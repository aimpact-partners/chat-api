import { Chat } from '@aimpact/agents-api/business/chats';
import { ErrorGenerator, BusinessErrorManager } from '@aimpact/agents-api/business/errors';
import * as dotenv from 'dotenv';

dotenv.config();
const { AGENT_API_URL, AGENT_API_TOKEN } = process.env;

interface IMetadata {
	answer: string;
	synthesis: string;
	progress: string;
	error: { code: number; text: string };
}

interface ISendMessageResponse {
	status: boolean;
	error?: { code: number; text: string };
	iterator?: AsyncIterable<{ chunk?: string; metadata?: IMetadata }>;
}

export /*bundle*/ class Agents {
	static async sendMessage(chatId: string, prompt: string): Promise<ISendMessageResponse> {
		let chat: any;
		try {
			const response = await Chat.get(chatId);
			if (response.error) return { status: false, error: response.error };

			chat = response.data;
		} catch (exc) {
			console.error(exc);
			return { status: false, error: { code: exc, text: exc.message } };
		}

		if (!chat) return { status: false, error: ErrorGenerator.chatNotValid(chatId) };
		if (!chat.language) return { status: false, error: ErrorGenerator.chatWithoutLanguages(chatId) };

		const language = chat.language.default;
		if (!language) return { status: false, error: ErrorGenerator.chatWithoutDefaultLanguage(chatId) };
		if (!chat.project) return { status: false, error: ErrorGenerator.chatWithoutDefaultLanguage(chatId) };

		const url = chat.project.agent?.url ?? AGENT_API_URL;
		if (!url) return { status: false, error: ErrorGenerator.chatNotHasProjectUrlSet(chatId) };

		const { user, synthesis, messages: msgs } = chat;
		const messages = { last: msgs && msgs.lastTwo ? msgs.lastTwo : [], count: msgs && msgs.count ? msgs.count : 0 };

		const method = 'POST';
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${AGENT_API_TOKEN}`
		};

		// Prepare the parameters
		const body = JSON.stringify({
			metadata: chat.metadata,
			project: chat.project.identifier,
			chatId: chat.id,
			language,
			user,
			messages,
			synthesis,
			prompt
		});

		// Fetch the agent
		let response: any;
		try {
			response = await fetch(url, { method, headers, body });
		} catch (exc) {
			console.error(exc);
			return {
				status: false,
				error: ErrorGenerator.internalError('BAG100', `Failed to post message`, exc.message)
			};
		}

		// Check if response is ok
		if (!response.ok) {
			const { status, statusText } = response;

			let error: BusinessErrorManager;
			if (status === 400) {
				const json = await response.json();
				const errors = json.errors.map(e => `${e.path} ${e.message}`);
				error = ErrorGenerator.invalidParameters(errors);
			} else {
				error = ErrorGenerator.internalError('BAG101', `Failed to post message (${status}): "${statusText}"`);
			}
			return { status: false, error };
		}

		const metadata: { started: boolean; value: string; parsed?: object } = { started: false, value: '' };

		// Define a function to read the stream incrementally
		async function* iterator(): AsyncIterable<{ chunk?: string; metadata?: IMetadata }> {
			// Use the response body as a stream
			const reader = response.body.getReader();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				// Process each chunk
				const chunk = new TextDecoder().decode(value);
				if (!metadata.started) {
					if (!chunk.includes('ÿ')) {
						yield { chunk };
					} else {
						metadata.started = true;
						const split = chunk.split('ÿ');
						metadata.value += split[1];
						if (split[0]) yield { chunk: split[0] };
					}
				} else {
					metadata.value += chunk;
				}
			}

			// Parse the metadata data
			try {
				metadata.parsed = JSON.parse(metadata.value);
			} catch (exc) {
				console.error(exc);
				return;
			}

			yield { metadata: <IMetadata>metadata.parsed };
		}

		return { status: true, iterator: iterator() };
	}
}
