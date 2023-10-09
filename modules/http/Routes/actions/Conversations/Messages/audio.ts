import { join } from 'path';
import * as stream from 'stream';
import * as Busboy from 'busboy';
import { FilestoreFile } from '../../../utils/bucket';
import { getExtension } from '../../../utils/get-extension';
import { generateCustomName } from '../../../utils/generate-name';
import { Agents } from '@aimpact/chat-api/agents';
import { PendingPromise } from '@beyond-js/kernel/core';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';
import { Conversation } from '@aimpact/chat-api/models/conversation';
import * as dotenv from 'dotenv';
dotenv.config();

const oaiBackend = new OpenAIBackend();

export interface IMessage {
	id: string;
	role: string;
	content: string;
	timestamp?: number;
}
interface IMetadata {
	user: IMessage | undefined;
	system?: IMessage | undefined;
	error?: string;
}

interface IFileSpecs {
	project?: string;
	type?: string;
	container?: string;
	userId?: string;
	knowledgeBoxId?: string;
}

function processTranscription(req, res, specs): Promise<any> {
	const promise = new PendingPromise();
	const fields: IFileSpecs = {};
	const bb = Busboy({ headers: req.headers });
	const files = [];

	const { user, conversation } = specs;

	let transcription = new PendingPromise();
	bb.on('field', (name, val) => (fields[name] = val));
	bb.on('file', (nameV, file, info) => {
		let size = 0;
		file.on('data', data => (size += data.length));
		const pass = new stream.PassThrough();
		file.pipe(pass);
		files.push({ file: pass, info });
		oaiBackend.transcriptionStream(file, 'es').then(response => transcription.resolve(response));
	});
	bb.on('finish', async () => {
		const [item] = files;
		const {
			file,
			info: { filename, mimeType }
		} = item;

		const name = `${generateCustomName(filename)}${getExtension(mimeType)}`;
		let dest = join(conversation.project, user.uid, 'audio', name);
		dest = dest.replace(/\\/g, '/');
		const response = await transcription;

		const fileManager = new FilestoreFile();
		const bucketFile = fileManager.getFile(dest);
		const write = bucketFile.createWriteStream();
		file.pipe(write);

		promise.resolve({ transcription: response, fields, file: { name, dest, mimeType } });
	});

	req.pipe(bb);

	return promise;
}

export const processAudio = async function (req, res, specs) {
	try {
		const { transcription, fields, file } = await processTranscription(req, res, specs);
		if (!transcription.status) {
			return res.json({
				status: false,
				error: `Error transcribing audio: ${transcription.error}`
			});
		}

		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Transfer-Encoding', 'chunked');
		const done = (specs: { status: boolean; error?: string; user?: object; system?: object }) => {
			const { status, error, user, system } = specs;
			res.write('ÿ');
			res.write(JSON.stringify({ status, error, user, system }));
			res.end();
		};

		const { conversationId, id, timestamp, systemId } = fields;

		const userMessage = { id, content: transcription.data?.text, role: 'user', timestamp };
		let response = await Conversation.saveMessage(conversationId, userMessage);
		if (response.error) {
			return res.status(500).json({ status: false, error: `Error storing user message: ${response.error}` });
		}
		const user = response.data;

		const { iterator, error } = await Agents.sendMessage(conversationId, transcription.data?.text);
		if (error) {
			return res.status(500).json({ status: false, error });
		}

		let answer = '';
		let stage: { synthesis: string };
		for await (const part of iterator) {
			const { chunk } = part;
			answer += chunk ? chunk : '';
			chunk && res.write(chunk);

			if (part.stage) {
				stage = part.stage;
				break;
			}
		}

		const systemMessage = { id: systemId, content: answer, role: 'system' };
		response = await Conversation.saveMessage(conversationId, systemMessage);
		if (response.error) {
			return done({ status: false, error: 'Error saving agent response' });
		}
		const system = response.data;

		// update synthesis on conversation
		const data = { id: conversationId, synthesis: stage?.synthesis };
		await Conversation.publish(data);

		// set last interaction on conversation
		await Conversation.setLastInteractions(conversationId, 4);

		return done({ status: true, user, system });
	} catch (error) {
		console.error(error);
		res.json({
			status: false,
			error: error.message
		});
	}
};
