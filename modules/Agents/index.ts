import { Conversation } from '@aimpact/chat-api/models/conversation';
import * as dotenv from 'dotenv';

dotenv.config();
const { AGENT_API_URL, AGENT_API_TOKEN } = process.env;

interface IAnswerStage {
	synthesis: string;
}

interface ISendMessageResponse {
	status: boolean;
	error?: string;
	iterator?: AsyncIterable<{ chunk?: string; stage?: IAnswerStage }>;
}

export /*bundle*/ class Agents {
	async sendMessage(conversationId: string, prompt: string): Promise<ISendMessageResponse> {
		let conversation: any;
		try {
			conversation = await Conversation.get(conversationId);
		} catch (exc) {
			console.error(exc);
			return { status: false, error: 'Error fetching conversation data from store' };
		}

		if (!conversation.id) {
			return { status: false, error: 'conversationId not valid' };
		}

		const { user, metadata, synthesis, message: msgs } = conversation;
		const messages = { last: msgs.lastTwo, count: msgs.count };

		const url = AGENT_API_URL;
		const method = 'POST';
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${AGENT_API_TOKEN}`
		};

		// Prepare the parameters
		const body = JSON.stringify({ metadata, user, messages, synthesis, prompt });

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

		const stage: { started: boolean; value: string; parsed?: object } = { started: false, value: '' };

		// Define a function to read the stream incrementally
		async function* iterator(): AsyncIterable<{ chunk?: string; stage?: IAnswerStage }> {
			// Use the response body as a stream
			const reader = response.body.getReader();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				// Process each chunk
				const chunk = new TextDecoder().decode(value);
				if (!stage.started) {
					if (!chunk.includes('ÿ')) {
						yield { chunk };
					} else {
						stage.started = true;
						const split = chunk.split('ÿ');
						stage.value += split[1];
						if (split[0]) yield { chunk: split[0] };
					}
				} else {
					stage.value += chunk;
				}
			}

			// Parse the stage data
			try {
				stage.parsed = JSON.parse(stage.value);
			} catch (exc) {
				console.error(exc);
				return;
			}

			yield { stage: <IAnswerStage>stage.parsed };
		}

		return { status: true, iterator: iterator() };
	}
}
