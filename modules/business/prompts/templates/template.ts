import { FirestoreErrorManager } from '@beyond-js/firestore-collection/errors';
import { db } from '@beyond-js/firestore-collection/db';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';
import { v4 as uuid } from 'uuid';
import { prompts } from '@aimpact/chat-api/data/model';
import { IPromptTemplateBaseData, IPromptTemplateData } from '@aimpact/chat-api/data/interfaces';
import { Projects } from '@aimpact/chat-api/business/projects';
import { PromptCategories } from '../categories';

export /*bundle*/ class PromptsTemplate {
	static async data(id: string) {
		return await prompts.data({ id });
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
		} catch (e) {
			throw Error(e.message);
		}
	}

	static async save(params: IPromptTemplateBaseData) {
		try {
			// const dataResponse = await PromptsTemplate.data(params.id);
			// if (dataResponse.error) return dataResponse;
			// if (dataResponse.data.exists) return { status: false, error: 'Prompt already exists' };

			const dataProject = await Projects.data(params.projectId);
			if (dataProject.error) return dataProject;
			if (!dataProject.data.exists) return { status: false, error: 'Project not exists' };

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

			const project = dataProject.data.data;
			const id = params.id ? params.id : `${project.id}.${params.name}`;
			const toSave: IPromptTemplateData = {
				project: { id: project.id, name: project.name },
				id,
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
