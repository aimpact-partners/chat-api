import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';
import { v4 as uuid } from 'uuid';
import { prompts } from '@aimpact/chat-api/data/model';
import { IPromptData } from '@aimpact/chat-api/data/interfaces';
import { PromptCategories } from '../categories';

export /*bundle*/ class PromptsTemplate {
	static async data(id: string) {
		return await prompts.data({ id });
	}

	static async save(params: IPromptData) {
		try {
			if (params.format !== 'text' && params.format !== 'json') {
				return { error: 'format not valid', code: 123 };
			}
			if (params.is !== 'prompt' && params.is !== 'function') {
				return { error: 'prompt type not specified', code: 124 };
			}

			let categories;
			// if (params.categories) {
			// 	const responseCategory = await PromptCategories.data(params.categories);
			// 	categories= categoriesData;
			// }

			const id = params.id ?? uuid();
			const toSave: IPromptData = {
				id: id,
				name: params.name,
				description: params.description,
				language: params.language,
				format: params.format,
				is: params.is
			};

			categories && (toSave.categories = categories);
			params.value && (toSave.value = params.value);
			params.options && (toSave.options = params.options);
			params.dependencies && (toSave.dependencies = params.dependencies);
			params.literals && (toSave.literals = params.literals);

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

	static async process(content: string) {
		try {
			const messages = [{ role: 'user', content }];
			const openai = new OpenAIBackend();
			const response = await openai.chatCompletions(messages);

			const { status, error } = response;
			let data;
			if (response.data) data = { output: response.data };

			return { status, error, data };
		} catch (exc) {
			return exc;
		}
	}
}
