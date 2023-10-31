import * as OpenApiValidator from 'express-openapi-validator';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { Response as HttpResponse } from '@beyond-js/response/main';
import { ErrorGenerator } from '@beyond-js/firestore-collection/errors';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { PromptCategories } from '@aimpact/chat-api/business/prompts';
import { Projects } from '@aimpact/chat-api/business/projects';
import type { Request, Response, Application } from 'express';

dotenv.config();

export class ProjectsRoutes {
	static setup(app: Application) {
		// app.use(
		// 	OpenApiValidator.middleware({
		// 		apiSpec: join(`${process.cwd()}/docs/projects/api.yaml`),
		// 		validateRequests: true
		// 		// validateResponses: true
		// 	})
		// );

		app.get('/projects/', this.list);
		app.get('/projects/:id', this.get);
		app.post('/projects/', this.publish);
		app.put('/projects/:id', this.update);
		app.delete('/projects/:id', this.delete);
	}

	static async list(req: Request, res: Response) {
		try {
			const response = await Projects.list();
			res.json(new HttpResponse(response));
		} catch (exc) {
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async get(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const response = await Projects.data(id);

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

	static async publish(req: Request, res: Response) {
		try {
			const { id, name, description } = req.body;
			const response = await Projects.save({ id, name, description });

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
		} catch (exc) {
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async delete(req: Request, res: Response) {
		try {
			let response;
			res.json(new HttpResponse(response));
		} catch (exc) {
			res.json(new HttpResponse({ error: ErrorGenerator.internalError(exc) }));
		}
	}
}
