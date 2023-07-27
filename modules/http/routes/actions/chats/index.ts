import type { Request, Response, Application } from 'express';
import { Chats as Model } from '@aimpact/chat-api/models/chats';
import * as OpenApiValidator from 'express-openapi-validator';
export class Chats {
	#app: Application;
	#model: Model;
	constructor(app: Application) {
		this.#app = app;
		this.#model = new Model();
		app.use(
			OpenApiValidator.middleware({
				apiSpec: `${process.cwd()}/docs/api/chats.yaml`,
				validateRequests: true, // (default)
				validateResponses: true, // false by default
			})
		);

		app.get('/chats', this.list.bind(this));
		app.get('/chats/:id', this.get.bind(this));
		app.post('/chats', this.validateParams, this.create.bind(this));
		app.put('/chats/:id', this.validateParams, this.update.bind(this));
		app.delete('/chats/:id', this.validateParams, this.delete.bind(this));
	}

	private validateParams(req: Request, res: Response, next: Function) {
		const { id } = req.params;
		const { body } = req;
		if (!id) {
			return res.status(400).json({ error: 'Missing chat ID parameter.' });
		}

		next();
	}

	async list(req: Request, res: Response) {
		try {
			const data = await this.#model.list({ userId: req.query.userId });
			if (!data) {
				return res.status(404).json({ error: 'Chats not found.' });
			}
			res.json({
				status: true,
				data: {
					items: data,
				},
			});
		} catch (e) {
			console.log(e);
			res.json({
				error: e.message,
			});
			return { status: false, error: e.message };
		}
	}

	async get(req: Request, res: Response) {
		try {
			// Logic to retrieve a specific chat by ID
			const { id } = req.params;

			const data = await this.#model.get(id);

			return res.json({ status: true, data });
		} catch (e) {
			res.json({
				error: e.message,
			});
		}
	}

	create(req: Request, res: Response) {
		// Logic to create a new chat}
		console.log(5);
		const paramsReceived = req.body;
		res.json({ paramsReceived });
	}

	update(req: Request, res: Response) {
		// Logic to update an existing chat by ID
		const { id } = req.params;
		const paramsReceived = req.body;
		res.json({ id, paramsReceived });
	}

	delete(req: Request, res: Response) {
		// Logic to delete a chat by ID
		const { id } = req.params;
		res.json({ id });
	}
}
