import type { Readable } from 'stream';
import type { IChatData } from '@aimpact/chat-api/data/interfaces';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import { join } from 'path';
import * as stream from 'stream';
import * as Busboy from 'busboy';
import { FilestoreFile } from '../../utils/bucket';
import { getExtension } from '../../utils/get-extension';
import { generateCustomName } from '../../utils/generate-name';
import { PendingPromise } from '@beyond-js/kernel/core';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';
import { ErrorGenerator } from '@aimpact/chat-api/http/errors';
import * as dotenv from 'dotenv';

dotenv.config();
const oaiBackend = new OpenAIBackend();

interface IAudioSpecs {
	transcription?: { status: boolean; data?: { text: string }; error?: string };
	fields?: { id: string; systemId: string; timestamp: number };
	file?: { name: string; dest: string; mimeType: string };
	error?: string;
}

interface IFileSpecs {
	project?: string;
	type?: string;
	container?: string;
	userId?: string;
	knowledgeBoxId?: string;
}

function processTranscription(req: IAuthenticatedRequest, chat: IChatData): Promise<IAudioSpecs> {
	const { user } = req;

	const promise = new PendingPromise();
	const bb = Busboy({ headers: req.headers });
	const transcription = new PendingPromise();

	// const files = [];
	const files: { file: any; info: { filename: string; mimeType: string } }[] = [];
	const fields: Record<string, IFileSpecs> = {};

	bb.on('field', (name: string, val: any) => (fields[name] = val));

	bb.on('file', (name: string, file: Readable, info: { filename: string; mimeType: string }) => {
		let size = 0;
		file.on('data', data => (size += data.length));
		const pass = new stream.PassThrough();
		file.pipe(pass);
		files.push({ file: pass, info });
		oaiBackend.transcriptionStream(file, 'es').then(response => transcription.resolve(response));
	});
	bb.on('finish', async () => {
		if (!files.length) {
			promise.resolve({ error: ErrorGenerator.invalidParameters(['file']) });
			return;
		}

		const [item] = files;
		const { file, info } = item;
		const { filename, mimeType } = info;

		const name = `${generateCustomName(filename)}${getExtension(mimeType)}`;
		let dest = join(chat.project.identifier ?? 'undefined-project', user.uid, 'audio', name);
		dest = dest.replace(/\\/g, '/');

		const fileManager = new FilestoreFile();
		const bucketFile = fileManager.getFile(dest);
		const write = bucketFile.createWriteStream();
		file.pipe(write);

		const response = await transcription;
		promise.resolve({ transcription: response, fields, file: { name, dest, mimeType } });
	});

	req.pipe(bb);

	return promise;
}

export const processAudio = async function (req: IAuthenticatedRequest, chat: IChatData): Promise<IAudioSpecs> {
	try {
		const { transcription, fields, file } = await processTranscription(req, chat);

		if (!transcription.status) {
			return { error: `Error transcribing audio: ${transcription.error}` };
		}

		return { transcription, fields, file };
	} catch (error) {
		console.error(error);
		return { error: error.message };
	}
};
