import type { Request, Response, Application } from 'express';
import { Chats } from '@aimpact/chat-api/models/chats';
import * as OpenApiValidator from 'express-openapi-validator';
import { IChat, ICreateChatSpecs } from './interfaces';

export class ChatsRoutes {
	static setup(app: Application) {
		// TODO actualizar respuesta de endpoint POST/chats
		// app.use(
		// 	OpenApiValidator.middleware({
		// 		apiSpec: `${process.cwd()}/docs/chats/api.yaml`,
		// 		validateRequests: true, // (default)
		// 		validateResponses: true, // false by default
		// 	})
		// );

		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});

		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});
		app.get('/chats', ChatsRoutes.list);
		app.get('/chats/:id', ChatsRoutes.get);
		app.post('/chats', ChatsRoutes.save);
		app.post('/chats/bulk', ChatsRoutes.bulk);
		app.put('/chats/:id', ChatsRoutes.update);
		app.delete('/chats/:id', ChatsRoutes.delete);
		app.delete('/chats/', ChatsRoutes.delete);
	}

	static async list(req: Request, res: Response) {
		try {
			const model = new Chats();
			const data: [] = await model.list({ userId: req.query.userId });

			if (!data) {
				return res.status(404).json({ error: 'Chats not found.' });
			}
			res.json({
				status: true,
				data
			});
		} catch (e) {
			console.error(e);
			res.json({
				error: e.message
			});
			return { status: false, error: e.message };
		}
	}

	static async get(req: Request, res: Response) {
		try {
			// Logic to retrieve a specific chat by ID
			const { id } = req.params;

			const model = new Chats();
			const data = await model.get(id);

			return res.json({ status: true, data });
		} catch (e) {
			res.json({
				error: e.message
			});
		}
	}

	static async save(req: Request, res: Response) {
		try {
			// Logic to create a new chat}
			const params: ICreateChatSpecs = req.body;

			const model = new Chats();
			const data = await model.save(params);
			res.json({ status: true, data });
		} catch (e) {
			res.json({
				status: false,
				error: e.message
			});
		}
	}

	static update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const params: IChat = req.body;

			const model = new Chats();
			const data = model.save({ id, ...params });
			res.json({ status: true, data });
		} catch (e) {
			res.json({
				status: false,
				error: e.message
			});
		}
	}

	static async bulk(req: Request, res: Response) {
		try {
			// Logic to create a new chat}
			const params: IChat[] = req.body.chats;

			const model = new Chats();
			const invalid = params.some(item => !model.validate(item));

			if (invalid) {
				return res.json({
					status: false,
					data: {
						error: 'invalid fields'
					}
				});
			}

			const data = await model.saveAll(params);
			res.json({ status: true, data });
		} catch (e) {
			res.json({
				status: false,
				error: e.message
			});
		}
	}

	static async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.query;

			if (!id && !userId) {
				return res.status(400).json({ error: 'id or userId is required' });
			}

			const model = new Chats();
			if (userId) {
				const items: string[] = await model.deleteAll('userId', userId);
				return res.json({
					status: true,
					data: { deleted: items }
				});
			}
			await model.delete(id);

			res.json({ status: true, data: { deleted: [id] } });
		} catch (e) {
			res.json({
				status: false,
				error: e.message
			});
		}
	}
}
