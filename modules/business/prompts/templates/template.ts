import type { IPromptTemplateBaseData, IPromptTemplateData } from '@aimpact/chat-api/data/interfaces';
import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { db } from '@beyond-js/firestore-collection/db';
import { v4 as uuid } from 'uuid';
import { Response } from '@beyond-js/response/main';
import { prompts } from '@aimpact/chat-api/data/model';
import { ErrorGenerator } from '@aimpact/chat-api/errors';
import { Projects } from '@aimpact/chat-api/business/projects';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';
import { PromptCategories } from '../categories';

export /*bundle*/ class PromptsTemplate {
	static async data(id: string, language?: string, option?: string) {
		const prompt = await prompts.data({ id });
		if (prompt.error) return prompt;
		if (!prompt.data.exists) {
			const error = ErrorGenerator.documentNotFound('prompts-templates', prompt.data.error);
			return new Response({ error });
		}

		/**
		 * solo retornamos el prompt sin la traducciones
		 */
		if (!language) return prompt;

		const promptData = prompt.data.data;
		if (!promptData.languages.includes(language)) {
			const error = ErrorGenerator.documentNotFound(
				'prompts-templates',
				id,
				`PromptTemplate not support language "${language}"`
			);
			return new Response({ error });
		}

		const languageDoc = await prompts.languages.data({ id: language, parents: { Prompts: id } });
		if (languageDoc.error) return languageDoc;
		if (!languageDoc.data.exists) {
			const error = ErrorGenerator.documentNotFound('prompts-templates', languageDoc.data.error);
			return new Response({ error });
		}

		if (!option) {
			const value = Object.assign({}, promptData, { ...{ language: languageDoc.data.data } });
			return new Response({ data: { exists: true, data: value } });
		}

		const parents = { Prompts: id, Languages: language };
		const subCollection = await prompts.languages.options.data({ id: option, parents });

		const value = Object.assign({}, promptData, { ...{ language: languageDoc.data.data } });
		value.language.option = subCollection.data.data;

		return new Response({ data: { exists: true, data: value } });
	}

	static async list(projectId: string, filter: string) {
		try {
			const dataProject = await Projects.data(projectId);
			if (dataProject.error) return dataProject;
			if (!dataProject.data.exists) return { status: false, error: 'Project not exists' };

			let query = db.collection('Prompts').where('project.id', '==', projectId);
			if (filter) {
				query = <FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>>(
					query.where('is', '==', filter)
				);
			}

			const items = await query.get();
			const entries = items.docs.map(item => item.data());
			return { status: true, data: { entries } };
		} catch (exc) {
			const error = ErrorGenerator.internalError(exc);
			return new Response({ error });
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
			const error = ErrorGenerator.internalError(exc);
			return new Response({ error });
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
			const error = ErrorGenerator.internalError(exc);
			return new Response({ error });
		}
	}

	static async save(params: IPromptTemplateBaseData) {
		try {
			// const dataResponse = await PromptsTemplate.data(params.id);
			// if (dataResponse.error) return dataResponse;
			// if (dataResponse.data.exists) return { status: false, error: 'Prompt already exists' };

			if (!params.projectId) {
				const error = ErrorGenerator.invalidParameters('prompts-templates', 'projectId');
				return new Response({ error });
			}

			const dataProject = await Projects.data(params.projectId);
			if (dataProject.error) return dataProject;
			if (!dataProject.data.exists) {
				const error = ErrorGenerator.documentNotFound('projects', params.projectId, dataProject.data.error);
				return new Response({ error });
			}

			if (!params.name) {
				const error = ErrorGenerator.invalidParameters('prompts-templates', 'name');
				return new Response({ error });
			}
			if (!params.language) {
				const error = ErrorGenerator.invalidParameters('prompts-templates', 'language');
				return new Response({ error });
			}
			if (params.format !== 'text' && params.format !== 'json') {
				const error = ErrorGenerator.invalidParameters('prompts-templates', 'format');
				return new Response({ error });
			}
			if (params.is !== 'prompt' && params.is !== 'function' && params.is !== 'dependency') {
				const error = ErrorGenerator.invalidParameters('prompts-templates', 'is');
				return new Response({ error });
			}

			let categories;
			// if (params.categories) {
			// 	const responseCategory = await PromptCategories.data(params.categories);
			// 	categories= categoriesData;
			// }

			const project = dataProject.data.data;
			const identifier = params.name.toLowerCase().replace(/\s+/g, '-');
			const id = params.id ? params.id : `${project.identifier}.${identifier}`;
			const toSave: IPromptTemplateData = {
				project: { id: project.id, name: project.name, identifier: project.identifier },
				id,
				name: params.name,
				identifier: `${project.identifier}.${identifier}`,
				languages: [params.language],
				format: params.format,
				is: params.is
			};
			params.description && (toSave.description = params.description);
			params.literals && (toSave.literals = params.literals);

			const specs = { data: toSave };
			const response = await prompts.set(specs);
			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			const data = {
				id: `${project.identifier}.${params.name}.${params.language}`,
				language: params.language,
				literals: params.literals
			};
			params.value && (data.value = params.value);

			const parents = { Prompts: id };
			await prompts.languages.set({ id: params.language, parents, data });

			/**
			 * Options
			 */
			if (params.options) {
				const promises = [];
				const options = params.options.map(item => {
					const option = { id: item.id, value: item.value };
					const parents = { Prompts: id, Languages: params.language };
					promises.push(prompts.languages.options.set({ parents, data: option }));
					return option;
				});
				await Promise.all(promises);
			}

			return await PromptsTemplate.data(id, params.language);
		} catch (exc) {
			const error = ErrorGenerator.internalError(exc);
			return new Response({ error });
		}
	}
}
