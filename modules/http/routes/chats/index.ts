import type { Request, Response as IResponse, Application } from 'express';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import type { IChatDataSpecs } from '@aimpact/chat-api/data/interfaces';
import { db } from '@beyond-js/firestore-collection/db';
import { Chat, Chats } from '@aimpact/chat-api/business/chats';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { ChatMessagesRoutes } from './messages';
import { IChat } from './interfaces';
import { Response } from '@beyond-js/response/main';
import { ErrorGenerator } from '@beyond-js/firestore-collection/errors';
import * as OpenApiValidator from 'express-openapi-validator';

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

		ChatMessagesRoutes.setup(app);

		app.post('/chats/bulk', ChatsRoutes.bulk);
		app.put('/chats/:id', ChatsRoutes.update);
		app.delete('/chats/:id', ChatsRoutes.delete);

		app.get('/chats', UserMiddlewareHandler.validate, ChatsRoutes.list);
		app.get('/chats/:id', UserMiddlewareHandler.validate, ChatsRoutes.get);

		app.post('/chats', ChatsRoutes.save);
		// app.post('/chats', UserMiddlewareHandler.validate, ChatsRoutes.save);

		/**
		 * @deprecated
		 */
		app.post('/conversations', UserMiddlewareHandler.validate, ChatsRoutes.save);
		app.get('/conversations/:id', UserMiddlewareHandler.validate, ChatsRoutes.get);
	}

	static async list(req: IAuthenticatedRequest, res: IResponse) {
		try {
			const { uid } = req.user;
			const { data, error } = await Chats.byUser(uid);
			res.json(new Response({ data, error }));
		} catch (exc) {
			res.json(new Response({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async get(req: IAuthenticatedRequest, res: IResponse) {
		try {
			const { id } = req.params;
			const { uid } = req.user;

			// true for get messages
			const { data, error } = await Chat.get(id, uid, true);
			res.json(new Response({ data, error }));
		} catch (exc) {
			res.json(new Response({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async save(req: Request, res: IResponse) {
		try {
			const params: IChatDataSpecs = req.body;
			const { data, error } = await Chat.save(params);
			res.json(new Response({ data, error }));
		} catch (exc) {
			res.json(new Response({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async update(req: Request, res: IResponse) {
		try {
			const { id } = req.params;
			const params: IChatDataSpecs = req.body;

			const { data, error } = await Chat.save({ id, ...params });
			res.json(new Response({ data, error }));
		} catch (exc) {
			res.json(new Response({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	/**
	 *  TODO actualizar y ajustar parametros en agents-client
	 */
	static async bulk(req: Request, res: IResponse) {
		try {
			// Logic to create a new chat
			const params: IChat[] = req.body.chats;

			let uIds = [...new Set(params.map(chat => chat?.uid).filter(uid => uid))];

			const snapshot = await db.collection('Users').where('id', 'in', uIds).get();
			const userInfos: any = {};
			snapshot.forEach(doc => (userInfos[doc.id] = doc.data()));

			params.forEach(async chat => {
				chat.user = { id: userInfos[chat.uid].id, name: userInfos[chat.uid].displayName };
				delete chat.uid;
			});

			const model = new Chat();
			const invalid = params.some(item => !model.validate(item));

			if (invalid) return res.json({ status: false, data: { error: 'invalid fields' } });

			const data = await model.saveAll(params);
			res.json(new Response({ data }));
		} catch (exc) {
			res.json(new Response({ error: ErrorGenerator.internalError(exc) }));
		}
	}

	static async delete(req: Request, res: IResponse) {
		try {
			const { id } = req.params;
			const { userId } = req.query;
			if (!id && !userId) return res.status(400).json({ error: 'id or userId is required' });

			const model = new Chat();
			if (userId) {
				const items: string[] = await model.deleteAll('userId', userId);
				return res.json(new Response({ data: { deleted: items } }));
			}
			await model.delete(id);

			res.json(new Response({ data: { deleted: [id] } }));
		} catch (exc) {
			res.json(new Response({ error: ErrorGenerator.internalError(exc) }));
		}
	}
}
