import { join } from 'path';
import { FilestoreFile } from '../bucket/file';
import { convertFile } from './utils/convert';
import { getExtension } from './utils/get-extension';
import { supportedMimetypes } from './utils/mimetypes';
import { generateCustomName } from './utils/generate-name';
import { TriggerAgent } from '@aimpact/chat-api/trigger-agent';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';
import { PendingPromise } from '@beyond-js/kernel/core';
const oaiBackend = new OpenAIBackend();
const triggerAgent = new TriggerAgent();
import * as Busboy from 'busboy';
import * as stream from 'stream';
import { createReadStream } from 'fs';
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
	const promises = [];
	const bb = Busboy({ headers: req.headers });
	const files = File[];
	bb.on('field', (name, val) => (fields[name] = val));
	bb.on('file', (nameV, file) => {
		 files.push(file)
        
	});
	bb.on('finish', async () => {
		console.log("in finish...");
        const [file] = files;
        const fileManager = new FilestoreFile();
        const { project, container, userId} = fields;
        let dest = join(project, userId, container, file.name);
        const blob = fileManager.getFile(dest);
        const blobStream = blob.createWriteStream();
        file.pipe(blobStream);
        dest = dest.replace(/\\/g, '/');
		const response = await oaiBackend.transcription(files[0], 'es');
        promise.resolve(response)
        console.log("aja")
	});
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
        console.log("llamada")
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
