import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { v4 as uuid } from 'uuid';
import { prompts } from '@aimpact/chat-api/data/model';
import { IPromptData } from '@aimpact/chat-api/data/interfaces';

export /*bundle*/ class PromptsTemplate {
	static async data(id: string) {
		return await prompts.data({ id });
	}

	static async save(params: IPromptData) {
		try {
			const id = params.id ?? uuid();
			const toSave = {
				id: id,
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

			return await PromptsTemplate.data(id);
		} catch (exc) {
			return exc;
		}
	}

	static async update(params: any) {
		try {
			const { id, name, description } = params;

			const dataResponse = await PromptsTemplate.data(id);
			if (dataResponse.error) return dataResponse;
			if (!dataResponse.data.exists) return dataResponse;

			const specs = { data: { id, name, description } };
			const response = await prompts.merge(specs);
			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			return PromptsTemplate.data(id);
		} catch (exc) {
			return exc;
		}
	}
}
