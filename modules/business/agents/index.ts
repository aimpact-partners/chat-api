import { Chat } from '@aimpact/chat-api/business/chats';
import * as dotenv from 'dotenv';

dotenv.config();
const { AGENT_API_URL, AGENT_API_TOKEN } = process.env;

interface IMetadata {
	answer: string;
	synthesis: string;
}

interface ISendMessageResponse {
	status: boolean;
	error?: string;
	iterator?: AsyncIterable<{ chunk?: string; metadata?: IMetadata }>;
}

export /*bundle*/ class Agents {
	static async sendMessage(conversationId: string, prompt: string): Promise<ISendMessageResponse> {
		let conversation: any;
		try {
			conversation = await Chat.get(conversationId);
		} catch (exc) {
			console.error(exc);
			return { status: false, error: 'Error fetching conversation data from store' };
		}

		if (!conversation) {
			return { status: false, error: 'conversationId not valid' };
		}

		if (!conversation.language) {
			return { status: false, error: 'the conversation has no established language' };
		}
		const language = conversation.language.default;
		if (!language) {
			return { status: false, error: 'the conversation has no established default language' };
		}

		const { user, synthesis, message: msgs } = conversation;
		const messages = { last: msgs ? msgs.lastTwo : [], count: msgs ? msgs.count : 0 };

		const url = AGENT_API_URL;
		const method = 'POST';
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${AGENT_API_TOKEN}`
		};

		// Prepare the parameters
		const body = JSON.stringify({ metadata: conversation.metadata, language, user, messages, synthesis, prompt });

		// Fetch the agent
		let response: any;
		try {
			response = await fetch(url, { method, headers, body });
		} catch (exc) {
			console.error(exc);
			return { status: false, error: `Failed to post message: "${exc.message}"` };
		}

		// Check if response is ok
		if (!response.ok) {
			const { status, statusText } = response;

			let error: string;
			if (status === 400) {
				const json = await response.json();
				error = `Failed to post message (${status}): "${json.error}"`;
			} else {
				error = `Failed to post message (${status}): "${statusText}"`;
			}
			return { status: false, error };
		}

		const metadata: { started: boolean; value: string; parsed?: object } = { started: false, value: '' };

		// Define a function to read the stream incrementally
		async function* iterator(): AsyncIterable<{ chunk?: string; metadata?: IAnswerStage }> {
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
