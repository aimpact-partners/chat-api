import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { v4 as uuid } from 'uuid';
import { projects } from '@aimpact/chat-api/data/model';

export /*bundle*/ class Projects {
	static async data(id: string) {
		return await projects.data({ id });
	}

	static async save(params) {
		try {
			const id = params.id ?? uuid();
			const { name, description } = params;

			const data = await Projects.data(id);
			if (data.error) return data;
			if (data.data.exists) return Projects.update(params);

			const identifier = name.toLowerCase().replace(/\s+/g, '-');
			const specs = { data: { id, name, description, identifier } };
			const response = await projects.set(specs);
			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return Projects.data(id);
		} catch (exc) {
			return exc;
		}
	}

	static async update(params) {
		try {
			const { id, name, description } = params;

			const dataResponse = await Projects.data(id);
			if (dataResponse.error) return dataResponse;
			if (!dataResponse.data.exists) return dataResponse;

			const specs = { data: { id, name, description } };
			const response = await projects.merge(specs);
			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return Projects.data(id);
		} catch (exc) {
			return exc;
		}
	}
}
