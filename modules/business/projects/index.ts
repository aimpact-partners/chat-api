import type { IProjectData } from '@aimpact/chat-api/data/interfaces';
import { v4 as uuid } from 'uuid';
import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { ErrorGenerator } from '@aimpact/chat-api/business/errors';
import { Response } from '@beyond-js/response/main';
import { db } from '@beyond-js/firestore-collection/db';
import { projects } from '@aimpact/chat-api/data/model';

export /*bundle*/ class Projects {
	static async data(id?: string) {
		return await projects.data({ id });
	}

	static async save(params: IProjectData) {
		try {
			const id = params.id ?? uuid();
			const { name, description, agent } = params;

			const data = await Projects.data(id);
			if (data.error) return data;
			if (data.data.exists) return Projects.update(params);

			const identifier = name.toLowerCase().replace(/\s+/g, '-');
			const specs = { data: { id, name, description, identifier, agent } };
			const response = await projects.set(specs);
			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return Projects.data(id);
		} catch (exc) {
			const error = ErrorGenerator.internalError(exc);
			return new Response({ error });
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
			const error = ErrorGenerator.internalError(exc);
			return new Response({ error });
		}
	}

	static async list() {
		try {
			const projectsRef = db.collection('Projects');
			const snapshot = await projectsRef.get();

			const entries = [];
			snapshot.forEach(doc => entries.push(doc.data()));

			return { data: { entries } };
		} catch (exc) {
			const error = ErrorGenerator.internalError(exc);
			return new Response({ error });
		}
	}
}
