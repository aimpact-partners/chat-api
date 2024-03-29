import { db } from '@aimpact/chat-api/backend-db';
import { BatchDeleter } from './firestore/delete';
import { FirestoreService } from './firestore/service';

interface IChat {
	id: string;
	name: string;
	usage: string;
	userId: string;
	parent: string;
	children: string;
	category: string;
	knowledgeBoxId: string;
}

export class Chats {
	private collection;
	private table = 'Chat';
	firestoreService: FirestoreService;

	constructor() {
		this.collection = db.collection(this.table);
		this.firestoreService = new FirestoreService(this.table);
	}

	async get(id: string) {
		try {
			if (!id) {
				return { status: false, error: 'id is required' };
			}

			const chatRef = await this.collection.doc(id);
			const doc = await chatRef.get();

			// Chat not exists
			if (!doc.exists) return { status: true };

			const messagesSnapshot = await chatRef.collection('messages').orderBy('timestamp').get();
			const messages = messagesSnapshot.docs.map(doc => doc.data());

			return {
				status: true,
				data: { ...doc.data(), messages },
			};
		} catch (e) {
			return { status: false, error: e.message };
		}
	}

	async save(data: IChat) {
		try {
			// if the parent is not received, we set it to root by default
			data.parent === undefined && (data.parent = '0');

			await this.collection.doc(data.id).set(data);
			const item = await this.collection.doc(data.id).get();

			return { status: true, data: item.data() as IChat };
		} catch (e) {
			console.error(e);
			return { status: false, error: e.message };
		}
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

			return { status: true, data: { id } };
		} catch (e) {
			return { status: false, error: e.message };
		}
	}

	async saveAll(items) {
		if (items.length) {
			throw new Error('items are required');
		}
		const batch = db.batch();
		const collection = this.collection('chats');
		items.forEach(item => {
			batch.set(collection.doc(item.id), item);
		});
		await batch.commit();
	}
}
