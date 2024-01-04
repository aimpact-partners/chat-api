import type {
	IPromptTemplateBaseData,
	IPromptTemplateData,
	IPromptTemplateLanguageData
} from '@aimpact/chat-api/data/interfaces';
import { v4 as uuid } from 'uuid';
import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { db } from '@beyond-js/firestore-collection/db';
import { Response } from '@beyond-js/response/main';
import { BusinessResponse } from '@aimpact/chat-api/business/response';
import { prompts } from '@aimpact/chat-api/data/model';
import { ErrorGenerator } from '@aimpact/chat-api/business/errors';
import { Projects } from '@aimpact/chat-api/business/projects';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';

export /*bundle*/ class PromptsTemplate {
	static async data(id: string, language?: string, option?: string) {
		try {
			const prompt = await prompts.data({ id });
			if (prompt.error) return new BusinessResponse({ error: prompt.error });
			if (!prompt.data.exists) {
				const error = ErrorGenerator.documentNotFound('Prompts', id);
				return new BusinessResponse({ error });
			}

			// If the language is not received, it is returned with the default language
			const promptData = prompt.data.data;
			if (!language) language = promptData.language.default;

			if (!promptData.language.languages.includes(language)) {
				const error = ErrorGenerator.languageNotSupport('Prompts', language);
				return new BusinessResponse({ error });
			}

			const languageDoc = await prompts.languages.data({ id: language, parents: { Prompts: id } });
			if (languageDoc.error) return new BusinessResponse({ error: languageDoc.error });
			if (!languageDoc.data.exists) {
				const error = ErrorGenerator.documentNotFound('Prompts', `${id}.${language}`);
				return new BusinessResponse({ error });
			}

			if (!option) {
				const value = Object.assign({}, promptData, { value: languageDoc.data.data.value });
				return new BusinessResponse({ data: value });
			}

			const parents = { Prompts: id, Languages: language };
			const subCollection = await prompts.languages.options.data({ id: option, parents });

			const value = Object.assign({}, promptData, { ...{ language: languageDoc.data.data } });
			value.language.option = subCollection.data.data;

			return new BusinessResponse({ data: value });
		} catch (exc) {
			console.error(exc);
			return new BusinessResponse({ error: ErrorGenerator.internalError(exc) });
		}
	}

	static async identifier(identifier: string, language?: string) {
		try {
			const prompt = await db.collection('Prompts').where('identifier', '==', identifier).get();
			if (prompt.empty) {
				const error = ErrorGenerator.documentNotFound('Prompts', identifier);
				return new BusinessResponse({ error });
			}

			const id = prompt.docs[0].id;
			return await PromptsTemplate.data(id, language);
		} catch (exc) {
			console.error(exc);
			return new BusinessResponse({ error: ErrorGenerator.internalError(exc) });
		}
	}

	static async list(projectId: string, filter: string) {
		try {
			const dataProject = await Projects.data(projectId);
			if (dataProject.error) return new BusinessResponse({ error: dataProject.error });
			if (!dataProject.data.exists) return new BusinessResponse({ error: dataProject.data.error });

			let query = db.collection('Prompts').where('project.id', '==', projectId);
			if (filter) {
				query = <FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>>(
					query.where('is', '==', filter)
				);
			}

			const items = await query.get();
			const entries = items.docs.map(item => item.data());
			return new BusinessResponse({ data: { entries } });
		} catch (exc) {
			console.error(exc);
			return new BusinessResponse({ error: ErrorGenerator.internalError(exc) });
		}
	}

	static async process(content: string, model: string, temperature: string) {
		try {
			const messages = [{ role: 'user', content }];
			const openai = new OpenAIBackend();
			const response = await openai.chatCompletions(messages, model, temperature);

			const { error } = response;
			const data = response.data ? { output: response.data } : undefined;

			return new BusinessResponse({ error, data });
		} catch (exc) {
			console.error(exc);
			return new BusinessResponse({ error: ErrorGenerator.internalError(exc) });
		}
	}

	static async delete(id: string) {
		if (!id) {
			return new BusinessResponse({ error: ErrorGenerator.invalidParameters(['id']) });
		}

		try {
			const response = await prompts.data({ id });
			if (response.error) {
				return new BusinessResponse({ error: response.error });
			}
			if (!response.data.exists) {
				return new BusinessResponse({ error: response.data.error });
			}

			const responseDelete = await prompts.delete({ id });
			if (responseDelete.error) {
				return new BusinessResponse({ error: responseDelete.error });
			}

			return new BusinessResponse({ data: responseDelete.data });
		} catch (exc) {
			console.error(exc);
			return new BusinessResponse({ error: ErrorGenerator.internalError(exc) });
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

	static async save(params: IPromptTemplateBaseData) {
		try {
			if (!params.projectId) {
				const error = ErrorGenerator.invalidParameters(['projectId']);
				return new Response({ error });
			}

			const dataProject = await Projects.data(params.projectId);
			if (dataProject.error) return dataProject;
			if (!dataProject.data.exists) {
				const error = ErrorGenerator.documentNotFound('projects', params.projectId, dataProject.data.error);
				return new Response({ error });
			}

			const errors = [];
			if (!params.name) errors.push('name');
			if (!params.language || !params.language.default) errors.push('language');
			if (params.format !== 'text' && params.format !== 'json') errors.push('format');
			if (params.is !== 'prompt' && params.is !== 'function' && params.is !== 'dependency') {
				errors.push('is');
			}
			if (errors.length) return new Response({ error: ErrorGenerator.invalidParameters(errors) });

			const project = dataProject.data.data;
			const name = params.name.toLowerCase();
			const uid = uuid();
			const identifier = name.replace(/\s+/g, '-');
			const id = params.id ? params.id : uid;
			const toSave: IPromptTemplateData = {
				project: { id: project.id, name: project.name, identifier: project.identifier },
				id,
				name,
				identifier: `${project.identifier}.${identifier}`,
				language: params.language,
				format: params.format,
				is: params.is,
				value: params.value
			};
			params.description && (toSave.description = params.description);
			params.literals && (toSave.literals = params.literals);

			const specs = { data: toSave };
			const response = await prompts.set(specs);
			if (response.error) return new FirestoreErrorManager(response.error.code, response.error.text);

			const data: IPromptTemplateLanguageData = {
				id: `${project.identifier}.${name}.${params.language}`,
				project: { id: project.id, name: project.name, identifier: project.identifier },
				language: params.language.default
			};
			params.value && (data.value = params.value);
			params.literals && (data.literals = params.literals);

			const parents = { Prompts: id };
			await prompts.languages.set({ id: params.language.default, parents, data });

			/**
			 * Options
			 */
			if (params.options) {
				// const promises = [];
				// params.options.map(item => {
				// 	const parents = { Prompts: id, Languages: params.language };
				// 	const option = { id: item.id, value: item.value, prompt: name };
				// 	promises.push(prompts.languages.options.set({ parents, data: option }));
				// 	return option;
				// });
				// await Promise.all(promises);
			}

			return await PromptsTemplate.data(id);
		} catch (exc) {
			console.error(exc);
			return new BusinessResponse({ error: ErrorGenerator.internalError(exc) });
		}
	}
}
