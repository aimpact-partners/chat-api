import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { v4 as uuid } from 'uuid';
import { Projects } from '@aimpact/chat-api/business/projects';
import { promptsCategories } from '@aimpact/chat-api/data/model';

interface IPromptCategorySpecs {
	id: string;
	name: string;
	description: string;
	project: string;
}

export /*bundle*/ class PromptCategories {
	static async data(id: string) {
		return await promptsCategories.data({ id });
	}

	static async save(params: IPromptCategorySpecs) {
		try {
			const id = params.id ?? uuid();
			const { name, description, project } = params;

			const projectResponse = await Projects.data(project);
			if (projectResponse.error) {
				return projectResponse;
			}
			if (projectResponse.data.error) {
				return projectResponse;
			}

			const projectSpecs = {
				id: projectResponse.data.data.id,
				name: projectResponse.data.data.name,
				identifier: projectResponse.data.data.identifier
			};
			const specs = { data: { id, name, description, project: projectSpecs } };
			const response = await promptsCategories.set(specs);

			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return await PromptCategories.data(id);
		} catch (exc) {
			return exc;
		}
	}

	static async update(params: {}) {
		const specs = { data: params };
		try {
			const response = await promptsCategories.merge(specs);
			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return response.data;
		} catch (exc) {
			return exc;
		}
	}
}
