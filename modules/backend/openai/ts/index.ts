import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';
import { getFile } from './buckets/read';
import { gptTurboPlus, davinci3, whisper } from './utils/models';

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
	async transcription(path: string, lang = 'en'): Promise<any> {
		const blob = await getFile(path);
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
}
