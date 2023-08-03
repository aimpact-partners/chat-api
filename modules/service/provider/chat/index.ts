import type { Server } from 'socket.io';
import { db } from '@aimpact/chat-api/backend-db';
import { chatAPI } from '@aimpact/chat-api/backend/api';
import { ChatMessages } from './messages';
import { FirestoreService } from '../firestore/service';

interface IChat {
	id: string;
	name: string;
	usage: string;
	userId: string;
	category: string;
	knowledgeBoxId: string;
	metadata: {};
}

export /*actions*/ /*bundle*/ class ChatProvider {
	socket: Server;
	private collection;
	private table = 'Chat';
	#messages = new ChatMessages();
	firestoreService: FirestoreService;

	constructor(socket: Server) {
		this.socket = socket;
		this.collection = db.collection(this.table);
		this.firestoreService = new FirestoreService(this.table);
	}

	async load({ id }: { id: string }) {
		try {
			return chatAPI.get(id);
		} catch (e) {
			console.error(e);
			return { status: false, error: `Error loading chat` };
		}
	}

	async publish(data: IChat) {
		try {
			return chatAPI.save(data);
		} catch (e) {
			console.error(e);
			return { status: false, error: `Error saving chat` };
		}
	}

	async delete({ id }: { id: string }) {
		try {
			return chatAPI.delete(id);
		} catch (e) {
			console.error(e);
			return { status: false, error: `Error deleting chat` };
		}
	}

	async list(specs) {
		try {
			const entries = [];

			if (!specs.userId) {
				throw new Error('userId is required');
			}

			let query = this.collection;

			const { limit } = specs;
			delete specs.limit;

			// TODO @ftovar8 @jircdev pendiente agregar condicion por cada parametro de filtro
			for (let [k, v] of Object.entries(specs)) {
				query = query.where(k, '==', v);
			}
			query = query.limit(limit);

			const items = await query.get();
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
}
