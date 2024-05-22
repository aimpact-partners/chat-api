import type { IChatData, IMessageData } from '@aimpact/chat-api/data/interfaces';
import type { firestore } from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import { db } from '@beyond-js/firestore-collection/db';
import { Message } from './message';
import { Messages } from './messages';
import { Timestamp } from '@aimpact/chat-api/utils/timestamp';
import { BatchDeleter } from './firestore/delete';
import { FirestoreService } from './firestore/service';

import { User } from '@aimpact/chat-api/business/user';
import { chats, projects } from '@aimpact/chat-api/data/model';
import { ErrorGenerator } from '@aimpact/chat-api/business/errors';
import { BusinessResponse } from '@aimpact/chat-api/business/response';

export /*bundle*/ interface IChatParameters {
	id: string;
	name: string;
	metadata: {};
	parent?: string;
	children?: string;
	language: {
		default: string;
	};
	uid: string;
	projectId: string;
}

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

	static async get(id: string, uid?: string, messages: boolean = false): Promise<BusinessResponse<IChatData>> {
		if (!id) {
			return new BusinessResponse({ error: ErrorGenerator.invalidParameters(['id']) });
		}

		try {
			const response = await chats.data({ id });
			if (response.error) {
				return new BusinessResponse({ error: response.error });
			}
			if (!response.data.exists) {
				return new BusinessResponse({ error: response.data.error });
			}

			const ChatData: IChatData = response.data.data;
			// if (ChatData.user.id !== uid) {
			// 	return { error: 'The user does not have access permissions on this Chat' };
			// }

			if (messages) {
				const messagesSnapshot = await db.collection('Chats').doc(id).collection('messages').get();
				ChatData.messages = messagesSnapshot.docs.map(doc => {
					const data = doc.data();
					return {
						id: data.id,
						content: data.content,
						answer: data.answer,
						chatId: data.chatId,
						chat: data.chat,
						role: data.role,
						timestamp: Timestamp.format(data.timestamp)
					};
				});
				ChatData.messages.sort((a, b) => a.timestamp - b.timestamp);
			}

			return new BusinessResponse({ data: ChatData });
		} catch (exc) {
			console.error(exc);
			return new BusinessResponse({ error: ErrorGenerator.internalError(exc) });
		}
	}

	static async save(data: IChatParameters) {
		try {
			const id = data.id ?? uuid();

			const response = await chats.data({ id });
			if (response.error) {
				return new BusinessResponse({ error: response.error });
			}

			const specs = <IChatData>{ id: id };
			data.name && (specs.name = data.name);
			data.metadata && (specs.metadata = data.metadata);
			data.parent && (specs.parent = data.parent);
			data.children && (specs.children = data.children);
			data.language && (specs.language = data.language);

			if (!response.data.exists) {
				// if the parent is not received, we set it to root by default
				!data.parent && (specs.parent = '0');
			}

			if (data.projectId) {
				const response = await projects.data({ id: data.projectId });
				if (response.error) {
					return new BusinessResponse({ error: response.error });
				}
				if (!response.data.exists) {
					return new BusinessResponse({ error: response.data.error });
				}
				const project = response.data.data;
				specs.project = {
					id: project.id,
					name: project.name,
					identifier: project.identifier,
					agent: project.agent
				};
			}

			if (data.uid) {
				const model = new User(data.uid);
				await model.load();
				specs.user = model.toJSON();
			}

			await chats.merge({ id, data: specs });
			const chatResponse = await chats.data({ id });
			if (chatResponse.error) {
				return new BusinessResponse({ error: response.error });
			}

			return new BusinessResponse({ data: chatResponse.data.data });
		} catch (exc) {
			console.error(exc);
			return new BusinessResponse({ error: ErrorGenerator.internalError(exc) });
		}
	}

	/**
	 *
	 * @param id
	 * @param message
	 * @returns
	 */
	static async saveMessage(ChatId: string, params: IMessageData) {
		return Message.publish(ChatId, params);
	}

	/**
	 * sets the last interaction made in the Chat
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
		const ChatDoc = await collection.doc(id).get();
		if (!ChatDoc.exists) {
			throw new Error('ChatId not valid');
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
	async saveAll(items: IChatData[]) {
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
