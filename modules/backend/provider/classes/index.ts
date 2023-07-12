import type { Socket } from 'socket.io';
import { db } from '@aimpact/chat-api/backend-db';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';
import { generateAll, generate } from './generator';
import { GenerationParams } from './prompts';
import { Model } from './model';

interface IClass {
	id: string;
	userId: string;
	createdAt: number;
	title: string;
	description: string;
	bulletPoints: string[];
}

export /*actions*/ /*bundle*/ class ClassesProvider {
	#socket: Socket;
	private collection;
	private table = 'classes';

	constructor(socket: Socket) {
		this.#socket = socket;
		this.collection = db.collection(this.table);
	}

	async generate(id, curriculumObjective: string, params: GenerationParams) {
		return await generate(id, curriculumObjective, params, this.#socket);
	}

	async generateAll(id, curriculumObjective: string, topics: string[]) {
		return await generateAll(id, curriculumObjective, topics, this.#socket);
	}

	async load(specs) {
		try {
			if (!specs) return { status: false };
			let { id } = specs;
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
			if (!data.id) {
				throw new Error('id is required');
			}
			//@todo: validate permissions
			const model = new Model(data.id);
			const item = await model.set(data);

			return { status: true, data: item };
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
