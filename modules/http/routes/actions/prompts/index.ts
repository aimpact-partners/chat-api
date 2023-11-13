import { PromptsTemplate, PromptTemplateProcessor } from '@aimpact/chat-api/business/prompts';
import { join } from 'path';
import * as dotenv from 'dotenv';
import * as OpenApiValidator from 'express-openapi-validator';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { Response as HttpResponse } from '@beyond-js/response/main';
import { ErrorGenerator } from '@beyond-js/firestore-collection/errors';
import { PromptsCategoriesRoutes } from './categories';
import type { Request, Response, Application } from 'express';

dotenv.config();

export class PromptsRoutes {
	static setup(app: Application) {
		// app.use(
		// 	OpenApiValidator.middleware({
		// 		apiSpec: join(`${process.cwd()}/docs/prompts/api.yaml`),
		// 		validateRequests: true
		// 		// validateResponses: true
		// 	})
		// );

		PromptsCategoriesRoutes.setup(app);

		app.get('/prompts/templates/project/:projectId', this.list);
		app.get('/prompts/templates/:id', this.get);
		app.get('/prompts/templates/:id/data', this.data);
		app.post('/prompts/templates', this.publish);
		app.put('/prompts/templates/:id', this.update);
		app.delete('/prompts/templates/:id', this.delete);

		app.post('/prompts/templates/:id/process', this.process);
		app.post('/prompts/templates/:id/process-openai', this.processOpenAI);
	}

	static async list(req: Request, res: Response) {
		try {
			const { projectId } = req.params;
			const filter = req.query.is;
			const response = await PromptsTemplate.list(projectId, filter);
			if (response.error) {
				res.json(new HttpResponse(response));
				return;
			}

			res.json(new HttpResponse({ data: response.data }));
		} catch (e) {
			res.json({ error: e.message });
		}
	}

	static async get(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { language } = req.query;
			const response = await PromptsTemplate.data(id, language);
			if (response.error) {
				res.json(new HttpResponse(response));
				return;
			}
			if (!response.data.exists) {
				res.json(new HttpResponse({ error: response.data.error }));
				return;
			}

			res.json(new HttpResponse({ data: response.data.data }));
		} catch (exc) {
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async data(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { language, option } = req.query;
			const response = await PromptsTemplate.data(id, language, option);
			if (response.error) {
				res.json(new HttpResponse(response));
				return;
			}
			if (!response.data.exists) {
				res.json(new HttpResponse({ error: response.data.error }));
				return;
			}

			res.json(new HttpResponse({ data: response.data.data }));
		} catch (exc) {
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async update(req: Request, res: Response) {
		try {
			let response;
			res.json(new HttpResponse(response));
		} catch (e) {
			res.json({ error: e.message });
		}
	}

	static async delete(req: Request, res: Response) {
		try {
			let response;
			res.json(new HttpResponse(response));
		} catch (e) {
			res.json({ error: e.message });
		}
	}

	static async publish(req: Request, res: Response) {
		try {
			const specs = req.body;
			const response = await PromptsTemplate.save(specs);
			if (response.error) {
				res.json(new HttpResponse(response));
				return;
			}
			if (response.data.error) {
				res.json(new HttpResponse({ error: response.data.error }));
				return;
			}

			res.json(new HttpResponse({ data: response.data.data }));
		} catch (exc) {
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async processOpenAI(req: Request, res: Response) {
		try {
			const { prompt } = req.body;
			const response = await PromptsTemplate.process(prompt);
			if (response.error) {
				res.json(new HttpResponse(response));
				return;
			}
			if (response.data.error) {
				res.json(new HttpResponse({ error: response.data.error }));
				return;
			}

			res.json(new HttpResponse({ data: response.data }));
		} catch (exc) {
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async process(req: Request, res: Response) {
		try {
			const params = req.body;

			console.log('paraaaams => ', params);
			const promptTemplate = new PromptTemplateProcessor(params);
			await promptTemplate.process();

			if (promptTemplate.error) {
				res.json(new HttpResponse(promptTemplate.error));
				return;
			}

			const value = promptTemplate.processedValue;
			res.json(new HttpResponse({ data: { value } }));
		} catch (exc) {
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}
}
