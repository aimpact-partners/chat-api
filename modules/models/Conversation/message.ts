import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';
import { db } from '@aimpact/chat-api/firestore';

export interface IMessage {
	role: string;
	content: string;
}

export class Message {
	static async publish(conversationId: string, message: IMessage) {
		try {
			if (!conversationId) {
				throw new Error('conversationId is required');
			}
			if (!message.content) {
				throw new Error('message content is required');
			}

			const collection = db.collection('Conversations');
			const conversation = await collection.doc(conversationId);
			const conversationDoc = await conversation.get();
			if (!conversationDoc.exists) {
				throw new Error('Conversation not exists');
			}

			const id = uuidv4();

			const specs = {
				id,
				...message,
				conversationId: conversationId,
				timestamp: admin.firestore.FieldValue.serverTimestamp()
			};
			await conversation.collection('messages').doc(id).set(specs);

			const data = conversationDoc.data();
			const count = (data.messages?.count || 0) + 1;

			await conversation.update({ messages: { count } }, { merge: true });

			return { status: true, data: specs };
		} catch (e) {
			console.error(e);
			return { status: false, error: e.message };
		}
	}
}
