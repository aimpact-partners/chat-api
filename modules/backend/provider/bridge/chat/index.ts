import type { Server } from 'socket.io';
import { db } from '@aimpact/chat-api/backend-db';
import { ChatMessages } from './messages';
import { FirestoreService } from '../firestore/service';
import { BatchDeleter } from '../firestore/delete';

interface Chat {
	id: string;
	userId: string;
	category: string;
	knowledgeBoxId: string;
}

export /*actions*/ /*bundle*/ class ChatProvider {
	socket: Server;
	private collection;
	private table = 'Chat';
	#messages;
	firestoreService: FirestoreService;
	constructor(socket: Server) {
		this.socket = socket;
		this.firestoreService = new FirestoreService(this.table);
		this.collection = db.collection(this.table);
		this.#messages = new ChatMessages();
	}

	async load({ id }: { id: string }) {
		try {
			if (!id) {
				return { status: false, error: 'id is required' };
			}

			const chatRef = await this.collection.doc(id);
			const doc = await chatRef.get();

			const messagesSnapshot = await chatRef.collection('messages').orderBy('timestamp').get();

			const messages = messagesSnapshot.docs.map(doc => doc.data());

			return {
				status: true,
				data: {
					...doc.data(),
					messages,
				},
			};
		} catch (e) {
			return { status: false, error: e.message };
		}
	}

	async publish(data) {
		try {
			await this.collection.doc(data.id).set(data);
			const item = await this.collection.doc(data.id).get();

			return { status: true, data: item.data() };
		} catch (e) {
			console.error(e);
			return { status: false, error: e.message };
		}
	}

	async list(specs) {
		try {
			const entries = [];

			if (!specs.userId) {
				throw new Error('userId is required');
			}

			const items = await this.collection.where('userId', '==', specs.userId).get();
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

	async sendMessage(data) {
		return this.#messages.publish(data);
	}

	async delete({ id }: { id: string }) {
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
}
