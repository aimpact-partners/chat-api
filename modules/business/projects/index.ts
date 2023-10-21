import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { projects } from '@aimpact/chat-api/data/model';

export /*bundle*/ class Projects {
	static async data(id: string) {
		return await projects.data({ id });
	}

	static async save(params) {
		try {
			const { id, name, description } = params;
			const identifier = name.toLowerCase().replace(/\s+/g, '-');
			const specs = { data: { id, name, description, identifier } };
			const response = await projects.set(specs);

			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return await projects.data(id);
		} catch (exc) {
			return exc;
		}
	}

	static async update(params: {}) {
		const specs = { data: params };
		try {
			const response = await projects.merge(specs);
			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return response.data;
		} catch (exc) {}
	}

	static async list(project: string) {
		return await projects.data({ project });
	}
}
