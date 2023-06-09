import type { Server } from 'socket.io';
import { db } from './db';
import * as admin from 'firebase-admin';
interface Message {
	id: string;
	userId: string;
	timestamp: number;
}

export class ChatMessages {
	socket: Server;
	private collection;
	private table = 'messages';

	constructor(parent) {
		parent.addMessage = this.publish.bind(this);
	}

	async publish(data) {
		try {
			if (!data.chatId) {
				throw new Error('chatId is required');
			}
			const chatProvider = db.collection('Chat');
			const chat = await chatProvider.doc(data.chatId);
			const chatDoc = await chat.get();
			const messageRef = await chat.collection('messages').add({
				...data,
				timestamp: admin.firestore.FieldValue.serverTimestamp(),
			});

			const savedMessage = await messageRef.get();
			const responseData = savedMessage.exists ? savedMessage.data() : undefined;

			//const item = await this.collection.add(data);

			return { status: true, message: responseData, response: };
		} catch (e) {
			console.error(e);
			return { error: true, message: e.message };
		}
	}
}
