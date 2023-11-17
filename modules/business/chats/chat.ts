import { v4 as uuid } from 'uuid';
import { db } from '@beyond-js/firestore-collection/db';
import { Message } from './message';
import { Messages } from './messages';
import { Timestamp } from '@aimpact/chat-api/utils/timestamp';
import type { IChat, IMessage } from '@aimpact/chat-api/data/interfaces';

import type { firestore } from 'firebase-admin';
import { BatchDeleter } from './firestore/delete';
import { FirestoreService } from './firestore/service';

export /*bundle*/ class Chat {
	private collection: firestore.CollectionReference;
	private table = 'Chats';
	firestoreService: FirestoreService;
	#deleter;

	constructor() {
		this.collection = db.collection(this.table);
		this.#deleter = new BatchDeleter(this.collection);
		this.firestoreService = new FirestoreService(this.table);
	}

	static async get(id: string, uid: string, messages: boolean = false) {
		if (!id) {
			throw new Error('id is required');
		}

		const conversationDoc = await db.collection('Chats').doc(id);
		const doc = await conversationDoc.get();
		if (!doc.exists) {
			return { error: 'Conversation not exists' };
		}

		const conversationData: IChat = doc.data();

		// if (conversationData.user.id !== uid) {
		// 	return { error: 'The user does not have access permissions on this conversation' };
		// }

		if (messages) {
			const messagesSnapshot = await conversationDoc.collection('messages').orderBy('timestamp').get();
			conversationData.messages = messagesSnapshot.docs.map(doc => {
				const data = doc.data();
				data.timestamp = Timestamp.format(data.timestamp);
				return data;
			});
			conversationData.messages.sort((a, b) => a.timestamp - b.timestamp);
		}

		return conversationData;
	}

	static async save(data: IChat) {
		try {
			const id = data.id ?? uuid();
			const collection = db.collection('Chats');
			const chatDoc = await collection.doc(id).get();
			if (!chatDoc.exists) {
				// if the parent is not received, we set it to root by default
				data.parent === undefined && (data.parent = '0');
			}

			await collection.doc(id).set({ ...data, id }, { merge: true });
			const item = await collection.doc(id).get();

			return item.data() as IChat;
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
	static async saveMessage(conversationId: string, params: IMessage) {
		return Message.publish(conversationId, params);
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

		const collection = db.collection('Chats');
		const conversationDoc = await collection.doc(id).get();
		if (!conversationDoc.exists) {
			throw new Error('conversationId not valid');
		}

		const messages = await Messages.getByLimit(id, limit);
		const lastTwo = messages.map(({ role, content, answer }) => ({
			role,
			content: role === 'assistant' ? answer : content
		}));

		await collection.doc(id).set({ messages: { lastTwo } }, { merge: true });
	}

	/**
	 * Functions migradas del objeto Chat inicial
	 * @TODO validar funcionamiento
	 */
	async saveAll(items: IChat[]) {
		if (!items.length) {
			throw new Error('items are required');
		}

		const batch = db.batch();
		const collection = this.collection;
		const persisted = [];
		items.forEach(item => {
			const id = item.id ?? uuid();
			const persistedItem = { ...item, id };
			batch.set(collection.doc(id), persistedItem);
			persisted.push(persistedItem);
		});

		await batch.commit();

		return persisted;
	}

	async delete(id: string) {
		try {
			if (!id) {
				return { status: false, error: 'id is required' };
			}

			const docRef = this.firestoreService.getDocumentRef(id);
			const subcollectionRef = docRef.collection('messages');
			const batchDeleter = new BatchDeleter(subcollectionRef);

			await batchDeleter.deleteAll();
			await docRef.delete();

			return true;
		} catch (e) {
			console.error(e);
			throw new Error('Error saving item');
		}
	}

	async deleteAll(field, values) {
		try {
			return this.#deleter.deleteAll(field, values);
		} catch (e) {
			console.error(e);
		}
	}

	validate(item) {
		return true;
	}
}
