import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as FormData from 'form-data';
import { gptTurboPlus, davinci3, whisper } from './utils/models';
import * as dotenv from 'dotenv';
dotenv.config();

interface IResponse {
	data: {
		text: string;
	};
}
export /*bundle*/
class OpenAIBackend {
	#configuration = new Configuration({ apiKey: process.env.OPEN_AI_KEY });
	#openai = new OpenAIApi(this.#configuration);

	async completions(prompt: string, text: string) {
		const content: string = prompt + `\n` + text;

		try {
			const response = await this.#openai.createCompletion({
				model: davinci3,
				prompt: content,
				temperature: 0.2,
			});

			return { status: true, data: response.data.choices[0].text };
		} catch (e) {
			console.error(e.message);
			return { status: false, error: e.message };
		}
	}

	async chatCompletions(messages: ChatCompletionRequestMessage[]) {
		try {
			const response = await this.#openai.createChatCompletion({
				model: gptTurboPlus,
				messages: messages,
				temperature: 0.2,
			});

			return { status: true, data: response.data.choices[0].message.content };
		} catch (e) {
			console.error(e.message);
			return { status: false, error: e.message };
		}
	}

	/**
	 *
	 * @param path
	 * @param lang
	 * @returns
	 */
	async transcription(file, lang = 'en'): Promise<any> {
		//    const blob = await getFile(path);
		const prompt =
			lang === 'en'
				? 'Please, transcribe the following text in English'
				: 'Por favor, transcribe el siguiente texto en Español';

		try {
			const response = (await this.#openai.createTranscription(
				//@ts-ignore
				blob,
				whisper,
				prompt,
				'json',
				0.2,
				lang
			)) as IResponse;

			return { status: true, data: response.data };
		} catch (e) {
			const code = e.message.includes('401' ? 401 : 500);
			return { status: false, error: e.message, code };
		}
	}

	async prepareFile(fullPath: string): Promise<Buffer> {
		const data = await fs.promises.readFile(fullPath);
		return data;
	}

	async transcriptionStream(
		stream: NodeJS.ReadableStream,
		lang: string = 'en'
	): Promise<{ status: boolean; data?: any; error?: string; code?: number }> {
		let form: FormData = new FormData();
		form.append('file', stream, 'audio.webm');
		form.append('model', 'whisper-1');

		let headers = {
			Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
			...form.getHeaders(),
		};

		try {
			const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
				method: 'POST',
				body: form,
				headers,
			});
			const data = await response.json();

			return { status: true, data };
		} catch (e) {
			console.error(e);
			const code = e.message.includes('401') ? 401 : 500;
			return { status: false, error: e.message, code };
		}
	}
}
