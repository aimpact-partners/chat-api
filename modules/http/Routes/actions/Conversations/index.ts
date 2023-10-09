import type { Request, Response, Application } from 'express';
import { Agents } from '@aimpact/chat-api/agents';
import { uploaderStream } from '../Uploader/stream';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import { Conversation, IConversation } from '@aimpact/chat-api/models/conversation';

export class ConversationsRoutes {
	static setup(app: Application) {
		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});

		app.get('/conversations/:id', UserMiddlewareHandler.validate, ConversationsRoutes.get);
		app.post('/conversations', UserMiddlewareHandler.validate, ConversationsRoutes.publish);
		app.post('/conversations/:id/messages', UserMiddlewareHandler.validate, ConversationsRoutes.sendMessage);
	}

	static async get(req: IAuthenticatedRequest, res: Response) {
		try {
			const { id } = req.params;
			const { uid } = req.user;

			// true for get messages
			const data = await Conversation.get(id, uid, true);
			return res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async publish(req: Request, res: Response) {
		try {
			const params: IConversation = req.body;
			const data = await Conversation.publish(params);

			res.json({ status: true, data });
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
	}

	static async sendMessage(req: Request, res: Response) {
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}

		if (req.headers['content-type'] === 'application/json') {
			return ConversationsRoutes._textMessage(req, res);
		}
		return uploaderStream(req, res);
	}

	static async _textMessage(req: Request, res: Response) {
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}

		const { id, systemId, content } = req.body;
		if (!id) {
			return res.status(400).json({ status: false, error: 'Parameter id is required' });
		}
		if (!systemId) {
			return res.status(400).json({ status: false, error: 'Parameter systemId is required' });
		}
		if (!content) {
			return res.status(400).json({ status: false, error: 'Parameter content is required' });
		}

		const done = (specs: { status: boolean; error?: string; user?: object; system?: object }) => {
			const { status, error, user, system } = specs;
			res.write('ÿ');
			res.write(JSON.stringify({ status, error, user, system }));
			res.end();
		};

		let user;
		let answer = '';
		let stage: { synthesis: string };
		try {
			// Store the user message as soon as it arrives
			const userMessage = { id, content, role: 'user' };
			let response = await Conversation.saveMessage(conversationId, userMessage);
			if (response.error) {
				return res.status(400).json({ status: false, error: response.error });
			}
			user = response.data;

			res.setHeader('Content-Type', 'text/plain');
			res.setHeader('Transfer-Encoding', 'chunked');

			const { iterator, error } = await Agents.sendMessage(conversationId, content);
			if (error) {
				return done({ status: false, error: error });
			}

			for await (const part of iterator) {
				const { chunk } = part;
				answer += chunk ? chunk : '';
				chunk && res.write(chunk);

				if (part.stage) {
					stage = part.stage;
					break;
				}
			}
		} catch (exc) {
			console.error(exc);
			return done({ status: false, error: 'Error processing agent response' });
		}

		try {
			// set agent message on firestore
			const agentMessage = { id: systemId, content: answer, role: 'system' };
			const response = await Conversation.saveMessage(conversationId, agentMessage);
			if (response.error) {
				return done({ status: false, error: 'Error saving agent response' });
			}
			const system = response.data;

			// update synthesis on conversation
			const data = { id: conversationId, synthesis: stage?.synthesis };
			await Conversation.publish(data);

			// set last interaction on conversation
			await Conversation.setLastInteractions(conversationId, 4);

			done({ status: true, user, system });
		} catch (exc) {
			return done({ status: false, error: 'Error saving agent response' });
		}
	}
}
