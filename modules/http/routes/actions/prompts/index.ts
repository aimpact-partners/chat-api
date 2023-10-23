import * as OpenApiValidator from 'express-openapi-validator';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { Response as HttpResponse } from '@beyond-js/response/main';
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

		app.get('/prompts/templates/:id', UserMiddlewareHandler.validate, this.get);
		app.put('/prompts/templates/:id', UserMiddlewareHandler.validate, this.update);
		app.delete('/prompts/templates/:id', UserMiddlewareHandler.validate, this.delete);
		app.post('/prompts/templates', UserMiddlewareHandler.validate, this.publish);
		app.get('/prompts/templates', UserMiddlewareHandler.validate, this.list);

		app.get('/prompts/export', UserMiddlewareHandler.validate, this.export);
	}

	static async get(req: Request, res: Response) {
		try {
			let response;
			res.json(new HttpResponse(response));
		} catch (e) {
			res.json({ error: e.message });
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
			console.log('publish');
			let response;
			res.json(new HttpResponse(response));
		} catch (e) {
			res.json({ error: e.message });
		}
	}

	static async export(req: Request, res: Response) {
		try {
			let response;
			res.json(new HttpResponse(response));
		} catch (e) {
			res.json({ error: e.message });
		}
	}
}
