import type { Server } from 'socket.io';
import * as admin from 'firebase-admin';
import { db } from '@aimpact/chat-api/firestore';

interface IMessage {
	id: string;
	userId: string;
	timestamp: number;
}

export /*actions*/ /*bundle*/ class MessageProvider {
	socket: Server;
	private collection;
	private table = 'messages';

	constructor(socket: Server) {
		this.socket = socket;
		this.collection = db.collection(this.table);
	}

	async load(id: string) {
		try {
			if (!id) {
				return { status: false, error: true, message: 'id is required' };
			}
			const response = await this.collection.doc(id).get();
			return { status: true, data: response.data() as IMessage };
		} catch (e) {
			return { status: false, error: e.message };
		}
	}

	async publish(data) {
		try {
			if (!data.conversationId) {
				throw new Error('conversationId is required');
			}
			const chatProvider = db.collection('Conversations');
			const chat = await chatProvider.doc(data.conversationId);

			const specs = { ...data, timestamp: admin.firestore.FieldValue.serverTimestamp() };
			await chat.collection(this.table).doc(data.id).set(specs);

			const savedMessage = await chat.collection(this.table).doc(data.id).get();
			const responseData = savedMessage.exists ? savedMessage.data() : undefined;

			return { status: true, data: responseData };
		} catch (e) {
			console.error(e);
			return { status: false, error: e.message };
		}
	}

	async list() {
		try {
			const entries = [];
			const items = await this.collection.get();
			items.forEach(item => entries.push(item.data()));
			return { status: true, data: { entries } };
		} catch (e) {
			return { status: false, error: e.message };
		}
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
}
