import type { Server } from 'socket.io';
import { db } from '../db';
import * as admin from 'firebase-admin';
import { TriggerAgent } from '@aimpact/chat-api/trigger-agent';

interface Message {
	id: string;
	chatId: string;
	message: string;
	role: string;
	timestamp: number;
}

export class ChatMessages {
	socket: Server;
	private collection;
	private table = 'messages';
	#agent: TriggerAgent;

	constructor() {
		this.#agent = new TriggerAgent();
	}

	async publish(data) {
		try {
			console.log(0.1, data);
			if (!data.chatId) {
				throw new Error('chatId is required');
			}
			if (!data.text) {
				throw new Error('message is required');
			}
			console.log(0.4, data.agent);
			const response = await this.#agent.call(data.text);

			if (!response.status) {
				return response;
			}

			/**
			 * user message
			 */
			const chatProvider = db.collection('Chat');
			const chat = await chatProvider.doc(data.chatId);
			const chatDoc = await chat.get();
			const messageRef = await chat.collection(this.table).add({
				...data,
				timestamp: admin.firestore.FieldValue.serverTimestamp(),
			});
			const savedMessage = await messageRef.get();
			const responseData = savedMessage.exists ? savedMessage.data() : undefined;

			/**
			 * agent message
			 */
			const agentMessage = {
				chatId: data.chatId,
				text: response.data.output,
				role: 'system',
				timestamp: admin.firestore.FieldValue.serverTimestamp(),
			};
			await chat.collection(this.table).add(agentMessage);

			return { status: true, message: responseData, response: agentMessage };
		} catch (e) {
			console.error(e);
			return { error: true, message: e.message };
		}
	}
}