import { v4 as uuid } from 'uuid';
import { db } from '@beyond-js/firestore-collection/db';
import { Timestamp } from '@aimpact/chat-api/utils/timestamp';
import type { IMessage } from '@aimpact/chat-api/data/interfaces';

const MESSAGE_ROLE = ['system', 'user', 'assistant', 'function'];

export class Message {
	static async publish(chatId: string, params: IMessage) {
		try {
			if (!chatId) {
				throw new Error('chatId is required');
			}
			if (!params.content) {
				throw new Error('message content is required');
			}

			if (!params.role) {
				throw new Error('role is required');
			}
			if (!MESSAGE_ROLE.includes(params.role)) {
				throw new Error('role not supported');
			}

			const collection = db.collection('Chats');
			const chat = await collection.doc(chatId);
			const chatDoc = await chat.get();
			if (!chatDoc.exists) {
				throw new Error('chat not exists');
			}

			const id = params.id ? params.id : uuid();
			delete params.id;

			const timestamp = Timestamp.set(params.timestamp);
			const specs = { id, chatId, ...params, timestamp };
			await chat.collection('messages').doc(id).set(specs);

			const data = chatDoc.data();
			const count = (data.messages?.count || 0) + 1;

			await chat.update({ messages: { count } });

			const dataCollection = chat.collection('messages').doc(id);
			const dataDoc = await dataCollection.get();
			const dataMessage = dataDoc.data();
			dataMessage.timestamp && (dataMessage.timestamp = Timestamp.format(dataMessage.timestamp));

			return { status: true, data: dataMessage };
		} catch (e) {
			console.error(e);
			return { status: false, error: e.message };
		}
	}
}
