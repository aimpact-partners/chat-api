import { v4 as uuidv4 } from 'uuid';
import type { firestore } from 'firebase-admin';
import { db } from '@aimpact/chat-api/firestore';
import type { IMessage } from './message';
import { Message } from './message';
import { Messages } from './messages';

export /*bundle*/ interface IConversation {
	id: string;
	name: string;
	metadata: {};
	parent: string;
	language: { default: string };
	user: { id: string; name: string };
	usage: { completionTokens: number; promptTokens: number; totalTokens: number };
}

export /*bundle*/ class Conversation {
	private collection: firestore.CollectionReference;
	table = 'Conversations';

	static async get(id: string) {
		if (!id) {
			throw new Error('id is required');
		}

		const conversationDoc = await db.collection('Conversations').doc(id);
		const doc = await conversationDoc.get();
		const conversationData: IConversation = doc.data();

		return conversationData;
	}

	static async publish(data: IConversation) {
		try {
			const id = data.id ?? uuidv4();
			const collection = db.collection('Conversations');
			const conversationDoc = await collection.doc(id).get();
			if (!conversationDoc.exists) {
				// if the parent is not received, we set it to root by default
				data.parent === undefined && (data.parent = '0');
			}

			await collection.doc(id).set({ ...data, id }, { merge: true });

			return conversationDoc.data() as IConversation;
		} catch (e) {
			console.error(e);
			throw new Error('Error saving item');
		}
	}

	/**
	 *
	 * @param id
	 * @param message
	 * @returns
	 */
	static async saveMessage(conversationId: string, message: IMessage, id: string) {
		return Message.publish(conversationId, message, id);
	}

	/**
	 * sets the last interaction made in the conversation
	 * assuming an interaction is the message/response pair
	 * taking message(role:user)/response(role:system)
	 * @param id
	 * @param limit
	 */
	static async setLastInteractions(id: string, limit: number = 2) {
		if (!id) {
			throw new Error('id is required');
		}

		const collection = db.collection('Conversations');
		const conversationDoc = await collection.doc(id).get();
		if (!conversationDoc.exists) {
			throw new Error('conversationId not valid');
		}

		const messages = await Messages.getByLimit(id, limit);
		const lastTwo = messages.map(({ content, role }) => ({ content, role }));

		await collection.doc(id).set({ messages: { lastTwo } }, { merge: true });
	}
}
