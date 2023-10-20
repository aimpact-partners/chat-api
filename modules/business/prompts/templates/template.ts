import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { prompts } from '@aimpact/chat-api/data/model';
import { IPromptData } from '@aimpact/chat-api/data/interfaces';

export /*bundle*/ class PromptTemplate {
	static async data(id: string) {
		return await prompts.data({ id });
	}

	static async save(params: IPromptData) {
		try {
			const toSave = {
				id: params.id,
				categories: params.categories,
				name: params.name,
				description: params.description,
				language: params.language,
				value: params.value,
				options: params.options,
				dependencies: params.dependencies,
				literals: params.literals,
				format: params.format,
				is: params.is
			};
			const specs = { data: toSave };
			const response = await prompts.set(specs);

			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return await prompts.data(params.id);
		} catch (exc) {
			return exc;
		}
	}

	static async update(params: {}) {
		const specs = { data: params };
		try {
			const response = await prompts.merge(specs);
			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return response.data;
		} catch (exc) {}
	}

	static async list(project: string) {
		return await prompts.data({ project });
	}
}
