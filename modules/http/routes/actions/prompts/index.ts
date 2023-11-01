import type { Request, Response, Application } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { Response as HttpResponse } from '@beyond-js/response/main';
import { PromptsTemplate } from '@aimpact/chat-api/business/prompts';
import { ErrorGenerator } from '@beyond-js/firestore-collection/errors';
import { PromptsCategoriesRoutes } from './categories';

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

		app.get('/prompts/templates', this.list);
		app.get('/prompts/templates/:id', this.get);
		app.post('/prompts/templates', this.publish);
		app.put('/prompts/templates/:id', this.update);
		app.delete('/prompts/templates/:id', this.delete);
	}

	static async get(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const response = await PromptsTemplate.data(id);
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

	static async list(req: Request, res: Response) {
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
}
