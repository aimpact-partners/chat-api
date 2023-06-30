import type { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@aimpact/chat-api/backend-db';
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

	async bulkSave(data) {
		try {
			const entries = [];
			const promises = [];
			data.forEach(item => promises.push(this.collection.add(item)));
			await Promise.all(promises).then(i => i.map((chat, j) => entries.push({ id: chat.id, ...data[j] })));

			return { status: true, data: { entries } };
		} catch (e) {
			return { status: false, error: e.message };
		}
	}

	async publish(data) {
		try {
			if (!data.chatId) {
				throw new Error('chatId is required');
			}
			if (!data.content) {
				throw new Error('message is required');
			}

			const chatProvider = db.collection('Chat');
			const chat = await chatProvider.doc(data.chatId);
			const chatDoc = await chat.get();
			const chatData = chatDoc.data();

			let knowledgeBoxId;
			if (chatData.knowledgeBoxId) {
				const KBProvider = db.collection('KnowledgeBoxes');
				const KB = await KBProvider.doc(chatData.knowledgeBoxId);
				const KBDoc = await KB.get();
				const KBData = KBDoc.data();
				if (!KBData) {
					return { status: false, error: 'knowledgeBox not exist' };
				}
				knowledgeBoxId = KBData.id;
			}

			const { prompt } = data;
			delete data.prompt;
			const response = await this.#agent.call(data, chatData.id, prompt, knowledgeBoxId);
			if (!response.status) {
				return response;
			}

			/**
			 * user message
			 */
			await chat
				.collection(this.table)
				.doc(data.id)
				.set({
					...data,
					timestamp: admin.firestore.FieldValue.serverTimestamp(),
				});
			const savedMessage = await chat.collection(this.table).doc(data.id).get();
			const responseData = savedMessage.exists ? savedMessage.data() : undefined;

			/**
			 * agent message
			 */
			const agentMsgId = uuidv4();
			const agentMessage = {
				id: agentMsgId,
				chatId: data.chatId,
				content: response.data.output,
				role: 'system',
				timestamp: admin.firestore.FieldValue.serverTimestamp(),
			};
			await chat.collection(this.table).doc(agentMsgId).set(agentMessage);

			return { status: true, data: { message: responseData, response: agentMessage } };
		} catch (e) {
			console.error(e);
			return { status: false, error: e.message };
		}
	}
}
