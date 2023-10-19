import * as OpenApiValidator from 'express-openapi-validator';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { Response as HttpResponse } from '@beyond-js/response/main';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import type { Request, Response, Application } from 'express';

dotenv.config();

export class PromptsCategoryRoutes {
	static setup(app: Application) {
		// app.use(
		// 	OpenApiValidator.middleware({
		// 		apiSpec: join(`${process.cwd()}/docs/prompts/category/api.yaml`),
		// 		validateRequests: true
		// 		// validateResponses: true
		// 	})
		// );

		app.get('/prompts/category/:id', UserMiddlewareHandler.validate, this.get);
		app.put('/prompts/category/:id', UserMiddlewareHandler.validate, this.update);
		app.delete('/prompts/category/:id', UserMiddlewareHandler.validate, this.delete);
		app.post('/prompts/category', UserMiddlewareHandler.validate, this.publish);
		app.get('/prompts/categories', UserMiddlewareHandler.validate, this.list);
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
			let response;
			res.json(new HttpResponse(response));
		} catch (e) {
			res.json({ error: e.message });
		}
	}
}
