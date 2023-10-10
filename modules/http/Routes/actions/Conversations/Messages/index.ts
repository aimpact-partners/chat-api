import type { Response, Application } from 'express';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { Conversation } from '@aimpact/chat-api/models/conversation';
import { processText } from './text';
import { processAudio } from './audio';

export class ConversationMessagesRoutes {
	static setup(app: Application) {
		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});

		app.post('/conversations/:id/messages', UserMiddlewareHandler.validate, ConversationMessagesRoutes.sendMessage);
	}

	static async sendMessage(req: IAuthenticatedRequest, res: Response) {
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}

		const { user } = req;
		let conversation;
		try {
			conversation = await Conversation.get(conversationId, user.uid);
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}

		if (conversation.error) {
			return res.status(400).json({ status: false, error: conversation.error });
		}
		if (!conversation.project) {
			return res.status(400).json({ status: false, error: 'the conversation not has a project defined' });
		}

		try {
			if (req.headers['content-type'] === 'application/json') {
				return processText(req, res);
			}

			return processAudio(req, res, { user, conversation });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}
}
