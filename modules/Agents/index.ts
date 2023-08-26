import fetch from 'node-fetch';
import config from '@aimpact/chat-api/config';
import { Conversation } from '@aimpact/chat-api/models/conversation';
import * as dotenv from 'dotenv';
dotenv.config();

export /*bundle*/ class Agents {
	async *sendMessage(conversationId: string, prompt: string) {
		try {
			const conversation = await Conversation.get(conversationId);
			if (!conversation.id) {
				return { status: false, error: 'conversationId not valid' };
			}

			const {
				user,
				metadata,
				synthesis,
				messages: { lastTwo, count },
			} = conversation;

			const messages = { last: lastTwo, count };

			const URL = `${config.params.AGENT_API}/agent/messages`;
			const options = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt, messages, synthesis, metadata, user }),
			};
			// Agent parameters example
			// const iterator = await Agent.sendMessage(metadata, synthesis, messages, user);

			const response = await fetch(URL, options);
			const responseJson = await response.json();

			return responseJson;
		} catch (e) {
			console.error('trigger agent:', e);
			return { status: false, error: e.message };
		}
	}
}
