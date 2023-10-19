import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { Projects } from '@aimpact/chat-api/business/projects';
import { promptsCategories } from '@aimpact/chat-api/data/model';
import { IPromptCategoryBaseData } from '@aimpact/chat-api/data/interfaces';

export /*bundle*/ class PromptCategories {
	static async data(id: string) {
		return await promptsCategories.data({ id });
	}

	static async save(params: IPromptCategoryBaseData) {
		try {
			const { id, name, description, projectId } = params;

			const projectResponse = await Projects.data({ id: projectId });
			if (projectResponse.error) {
				return projectResponse;
			}
			if (projectResponse.data.error) {
				return projectResponse;
			}

			const project = {
				id: projectResponse.data.data.id,
				name: projectResponse.data.data.name,
				identifier: projectResponse.data.data.identifier
			};
			const specs = { data: { id, name, description, project } };
			const response = await promptsCategories.set(specs);

			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return await promptsCategories.data(id);
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
		} catch (exc) {}
	}

	static async list(project: string) {
		return await promptsCategories.data({ project });
	}
}
