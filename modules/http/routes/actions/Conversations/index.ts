import type { Request, Response, Application } from 'express';
import { Conversation, IConversation } from '@aimpact/chat-api/models/conversation';
import { UserMiddlewareHandler, IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import { Agents } from '@aimpact/chat-api/agents';
import * as dotenv from 'dotenv';
dotenv.config();

export class ConversationsRoutes {
	static setup(app: Application) {
		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors,
			});
		});

		app.post('/conversations', ConversationsRoutes.publish);
		app.post('/conversations/:id/messages', ConversationsRoutes.sendMessage);
	}

	static async publish(req: Request, res: Response) {
		try {
			const params: IConversation = req.body;
			const data = await Conversation.publish(params);
			res.json({ status: true, data });
		} catch (e) {
			res.json({ status: false, error: e.message });
		}
	}

	static async sendMessage(req: Request, res: Response) {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ status: false, error: 'conversationId is required' });
		}

		const { message } = req.body;
		if (!message) {
			return res.status(400).json({ status: false, error: 'message is required' });
		}

		try {
			// set user message on firestore
			const userMessage = { content: message, role: 'user' };
			const response = await Conversation.sendMessage(id, userMessage);
			if (!response.status) {
				return res.status(400).json({ status: false, error: response.error });
			}

			res.setHeader('Content-Type', 'text/plain');
			res.setHeader('Transfer-Encoding', 'chunked');

			const { iterator, error } = await Agents.sendMessage(response.data.id, message);
			for await (const { chunk } of iterator) {
				res.write(chunk);
			}

			// set agent message on firestore
			// const agentMessage = { content: message, role: 'system' };
			// const response = await Conversation.sendMessage(id, agentMessage);
			// if (!response.status) {
			// 	return res.status(400).json({ status: false, error: response.error });
			// }

			// setea last interaction on conversation
			// await Conversation.setLastInteractions(id,4);

			res.end();
		} catch (e) {
			res.json({ status: false, error: e.message });
		}
	}
}
