import { join } from 'path';
import { FilestoreFile } from '../bucket/file';
import { convertFile } from './utils/convert';
import { getExtension } from './utils/get-extension';
import { supportedMimetypes } from './utils/mimetypes';
import { generateCustomName } from './utils/generate-name';
import { TriggerAgent } from '@aimpact/chat-api/trigger-agent';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';
import { PendingPromise } from '@beyond-js/kernel/core';
import * as Busboy from 'busboy';
import * as stream from 'stream';
import { createReadStream } from 'fs';

const oaiBackend = new OpenAIBackend();
const triggerAgent = new TriggerAgent();

interface IFileSpecs {
	project?: string;
	type?: string;
	container?: string;
	userId?: string;
	knowledgeBoxId?: string;
}

function process(req, res) {
	const promise = new PendingPromise();
	const fields: IFileSpecs = {};
	const bb = Busboy({ headers: req.headers });
	const files = [];
	bb.on('field', (name, val) => (fields[name] = val));
	bb.on('file', (nameV, file, info) => {
		let size = 0;
		file.on('data', data => (size += data.length));
		const pass = new stream.PassThrough();
		file.pipe(pass);
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

		const blob = fileManager.getFile(dest);

		const blobStream = blob.createWriteStream();
		Error.stackTraceLimit = 50;
		console.log(1);
		blobStream.on('error', e => console.error(e));
		blobStream.on('finish', a => console.log('finished...', a));
		file.pipe(blobStream);
		console.log(2);

		const response = await oaiBackend.transcription(file, 'es');
		promise.resolve(response);
	});

	// TODO @ftovar8 @jircdev validar el funcionamiento de estos metodos
	process.env?.CLOUD_FUNCTION ? bb.end(req.rawBody) : req.pipe(bb);

	return promise;
}

export /*bundle*/ const uploader = async function (req, res) {
	/* if (!fields.file) {
		return res.status(400).send({ status: false, error: 'No file was uploaded' });
	}
	if (!supportedMimetypes.includes(req.file.mimetype)) {
		return res.status(400).send(`Only MP3, MP4, MPEG, MPGA, M4A, WAV, and WEBM files are allowed`);
	} */

	try {
		console.log('llamada 1');
		/* 		const convertable = ['audio/x-m4a', 'audio/mp4'];
		const fileManager = new FilestoreFile();

		const { path, originalname, mimetype } = req.file;
		const name = `${generateCustomName(originalname)}${getExtension(mimetype)}`;

		const { project, container, userId, prompt } = req.body;
		let dest = join(project, userId, container, name);
		dest = dest.replace(/\\/g, '/'); 

		let origin = path;
		if (convertable.includes(mimetype)) {
			origin = await convertFile(path, 'mp3');
		}*/

		const response = await process(req, res);

		if (!response.status) {
			res.json({
				status: false,
				error: `Error transcribing audio: ${response.error}`,
			});
			return;
		}

		const message = { role: 'user', content: response.data.text };
		const { knowledgeBoxId, chatId } = req.body;
		const agentResponse = await triggerAgent.call(message, chatId, prompt, knowledgeBoxId);
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
				file: dest,
				transcription: response.data.text,
				output: agentResponse.data.output,
				usage: agentResponse.usage,
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
