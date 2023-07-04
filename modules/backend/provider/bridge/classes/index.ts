import type { Server } from 'socket.io';
import { db } from '@aimpact/chat-api/backend-db';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';
import { generator } from './generator';

interface IClass {
	id: string;
	userId: string;
	createdAt: number;
	title: string;
	description: string;
	bulletPoints: string[];
}
const openia = new OpenAIBackend();
export /*actions*/ /*bundle*/ class ClassesProvider {
	socket: Server;
	private collection;
	private table = 'classes';

	constructor(socket: Server) {
		this.socket = socket;
		this.collection = db.collection(this.table);
	}

	generator(promt, objetives) {
		return generator(promt, objetives);
	}

	async load(id: string) {
		try {
			if (!id) {
				return { status: false, error: true, message: 'id is required' };
			}
			const response = await this.collection.doc(id).get();
			return { status: true, data: response.data() as IClass };
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
