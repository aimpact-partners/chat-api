import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';
import { db } from '@aimpact/chat-api/firestore';

export interface IMessage {
	id: string;
	role: string;
	content: string;
	timestamp?: number;
}

export class Message {
	static async publish(conversationId: string, params: IMessage) {
		try {
			if (!conversationId) {
				throw new Error('conversationId is required');
			}
			if (!params.content) {
				throw new Error('message content is required');
			}
			if (!params.role) {
				throw new Error('role is required');
			}

			const collection = db.collection('Conversations');
			const conversation = await collection.doc(conversationId);
			const conversationDoc = await conversation.get();
			if (!conversationDoc.exists) {
				throw new Error('Conversation not exists');
			}

			const id = params.id ? params.id : uuidv4();
			delete params.id;

			const timestamp = params.timestamp ? params.timestamp : admin.firestore.FieldValue.serverTimestamp();

			const specs = {
				id,
				...params,
				conversationId: conversationId,
				timestamp
			};
			await conversation.collection('messages').doc(id).set(specs);

			const data = conversationDoc.data();
			const count = (data.messages?.count || 0) + 1;

			await conversation.update({ messages: { count } }, { merge: true });

			const dataCollection = conversation.collection('messages').doc(id);
			const dataDoc = await dataCollection.get();
			const dataMessage = dataDoc.data();

			if (typeof dataMessage.timestamp === 'object') {
				const dateObject = dataMessage.timestamp.toDate();
				dataMessage.timestamp = dateObject.getTime();
			}

			return { status: true, data: dataMessage };
		} catch (e) {
			console.error(e);
			return { status: false, error: e.message };
		}
	}
}
