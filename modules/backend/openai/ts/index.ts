import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';
import { getFile } from './buckets/read';
import { gptTurboPlus, davinci3, whisper } from './utils/models';
import axios, { AxiosResponse } from 'axios';
import * as FormData from 'form-data';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
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

	async prepareFile(fullPath: string): Promise<FormData> {
		const data = await fs.promises.readFile(fullPath);
		const formData = new FormData();
		formData.append('audio', data, { filename: fullPath.split('\\').pop() });
		return formData;
	}

	async transcriptionStream(
		stream: NodeJS.ReadableStream,
		lang: string = 'en'
	): Promise<{ status: boolean; data?: any; error?: string; code?: number }> {
		const prompt: string =
			lang === 'en'
				? 'Please, transcribe the following text in English'
				: 'Por favor, transcribe el siguiente texto en Español';

		let form: FormData = new FormData();
		const b = await this.prepareFile(
			`C:/workspace/ia/voice-genius/backend/uploads/voice-genius/audios/AImpact_20230517145207.m4a`
		);
		form.append('file', b);
		form.append('model', 'whisper-1');
		console.log(100, stream, process.env.OPEN_AI_KEY);
		let config = {
			headers: {
				Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
				'Content-Type': 'multipart/form-data',
				...form.getHeaders(),
			},
		};
		console.log(500, config);
		try {
			const response: AxiosResponse = await axios.post(
				'https://api.openai.com/v1/audio/transcriptions',
				form,
				config
			);
			return { status: true, data: response.data };
		} catch (e) {
			console.error(e);
			const code = e.message.includes('401') ? 401 : 500;
			return { status: false, error: e.message, code };
		}
	}
}
