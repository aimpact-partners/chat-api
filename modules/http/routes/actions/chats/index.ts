import type { Request, Response, Application } from 'express';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import { Chat } from '@aimpact/chat-api/business/chats';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import * as OpenApiValidator from 'express-openapi-validator';
import { ChatMessagesRoutes } from './messages';
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
		app.post('/chats/bulk', ChatsRoutes.bulk);
		app.put('/chats/:id', ChatsRoutes.update);
		app.delete('/chats/', ChatsRoutes.delete);
		app.delete('/chats/:id', ChatsRoutes.delete);

		ChatMessagesRoutes.setup(app);

		app.post('/chats', UserMiddlewareHandler.validate, ChatsRoutes.save);
		app.get('/chats/:id', UserMiddlewareHandler.validate, ChatsRoutes.get);
		app.get('/conversations/:id', UserMiddlewareHandler.validate, ChatsRoutes.get);
		app.post('/conversations', UserMiddlewareHandler.validate, ChatsRoutes.save);
	}

	static async list(req: Request, res: Response) {
		try {
			const model = new Chat();
			const data: [] = await model.list({ userId: req.query.userId });

			if (!data) {
				return res.status(404).json({ error: 'Chats not found.' });
			}
			res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async get(req: IAuthenticatedRequest, res: Response) {
		try {
			const { id } = req.params;
			const { uid } = req.user;

			// true for get messages
			const data = await Chat.get(id, uid, true);
			return res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async save(req: Request, res: Response) {
		try {
			const params: ICreateChatSpecs = req.body;
			const data = await Chat.save(params);
			res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const params: IChat = req.body;

			const model = new Chat();
			const data = model.save({ id, ...params });
			res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async bulk(req: Request, res: Response) {
		try {
			// Logic to create a new chat}
			const params: IChat[] = req.body.chats;

			const model = new Chat();
			const invalid = params.some(item => !model.validate(item));

			if (invalid) {
				return res.json({ status: false, data: { error: 'invalid fields' } });
			}

			const data = await model.saveAll(params);
			res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.query;

			if (!id && !userId) {
				return res.status(400).json({ error: 'id or userId is required' });
			}

			const model = new Chat();
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
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}
}
