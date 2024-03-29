import { join } from 'path';
import * as stream from 'stream';
import * as Busboy from 'busboy';
import { FilestoreFile } from '../bucket/file';
import { getExtension } from './utils/get-extension';
import { generateCustomName } from './utils/generate-name';
import { PendingPromise } from '@beyond-js/kernel/core';
import { TriggerAgent } from '@aimpact/chat-api/trigger-agent';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';

const oaiBackend = new OpenAIBackend();
const triggerAgent = new TriggerAgent();

interface IFileSpecs {
	project?: string;
	type?: string;
	container?: string;
	userId?: string;
	knowledgeBoxId?: string;
}

function isReadableStream(obj) {
	return obj instanceof stream.Readable;
}

function processRequest(req, res): Promise<any> {
	const promise = new PendingPromise();
	const fields: IFileSpecs = {};
	const bb = Busboy({ headers: req.headers });
	const files = [];

	let transcription = new PendingPromise();
	bb.on('field', (name, val) => (fields[name] = val));
	bb.on('file', (nameV, file, info) => {
		let size = 0;
		file.on('data', data => (size += data.length));
		const pass = new stream.PassThrough();
		file.pipe(pass);
		oaiBackend.transcriptionStream(pass, 'es').then(response => transcription.resolve(response));
		files.push({ file: pass, info });
	});
	bb.on('finish', async () => {
		const [item] = files;
		const {
			file,
			info: { filename, mimeType },
		} = item;

		const fileManager = new FilestoreFile();
		const { project, container, userId } = fields;
		const name = `${generateCustomName(filename)}${getExtension(mimeType)}`;
		let dest = join(project, userId, container, name);
		dest = dest.replace(/\\/g, '/');
		const response = await transcription;

		promise.resolve({ transcription: response, fields, file: { name, dest, mimeType } });
	});

	// TODO @ftovar8 @jircdev validar el funcionamiento de estos metodos
	process.env?.CLOUD_FUNCTION ? bb.end(req.rawBody) : req.pipe(bb);

	return promise;
}

export /*bundle*/ const uploader = async function (req, res) {
	try {
		const { transcription, fields, file } = await processRequest(req, res);
		if (!transcription.status) {
			res.json({
				status: false,
				error: `Error transcribing audio: ${transcription.error}`,
			});
			return;
		}

		const message = { role: 'user', content: transcription.data?.text };

		const { knowledgeBoxId, chatId } = fields;
		const agentResponse = await triggerAgent.call(message, chatId, knowledgeBoxId);

		if (!agentResponse.status) {
			res.json({
				status: false,
				error: `Error saving file: ${agentResponse.error}`,
			});
			return;
		}

		res.json({
			status: true,
			data: {
				file: file.dest,
				transcription: transcription.data.text,
				output: agentResponse.data.output,
				usage: agentResponse.data.usage,
				message: 'File uploaded successfully',
			},
		});
	} catch (error) {
		console.error(error);
		res.json({
			status: false,
			error: error.message,
		});
	}
};
