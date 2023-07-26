import type { Request, Response, Application } from 'express';
import { Chats as Model } from '@aimpact/chat-api/models/chats';
import * as OpenApiValidator from 'express-openapi-validator';
export class Chats {
	#app: Application;
	#model: Model;
	constructor(app: Application) {
		this.#app = app;
		this.#model = new Model();
	/* 	app.use(
			OpenApiValidator(
				apiSpec: `${process.cwd()/docs/api/Chats.yaml}`
			)
		) */
		app.get('/chat', this.list.bind(this));
		app.get('/chat/:id', this.get.bind(this));
		app.post('/chat', this.validateParams, this.create.bind(this));
		app.put('/chat/:id', this.validateParams, this.update.bind(this));
		app.delete('/chat/:id', this.validateParams, this.delete.bind(this));
		
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
			const data = await this.#model.list();

			res.json({
				status: true,
				data: {
					items: data,
				},
			});
		} catch (e) {
			return { status: false, error: e.message };
		}
	}

	get(req: Request, res: Response) {
		// Logic to retrieve a specific chat by ID
		const { id } = req.params;
		res.json({ id });
	}

	create(req: Request, res: Response) {
		// Logic to create a new chat
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
