import type { Request, Response, Application } from 'express';
import { Conversation, IConversation } from '@aimpact/chat-api/models/conversation';
import { Agents } from '@aimpact/chat-api/agents';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';

export class ConversationsRoutes {
	static setup(app: Application) {
		app.use((err, req, res, next) => {
			res.status(err.status || 500).json({
				message: err.message,
				errors: err.errors
			});
		});

		app.post('/conversations', UserMiddlewareHandler.validate, ConversationsRoutes.publish);
		app.post('/conversations/:id/messages', UserMiddlewareHandler.validate, ConversationsRoutes.sendMessage);
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
		const conversationId = req.params.id;
		if (!conversationId) {
			return res.status(400).json({ status: false, error: 'Parameter conversationId is required' });
		}

		const { message, id } = req.body;
		if (!id) {
			return res.status(400).json({ status: false, error: 'Parameter id is required' });
		}
		if (!message) {
			return res.status(400).json({ status: false, error: 'Parameter message is required' });
		}

		const done = (specs: { status: boolean; error?: string; synthesis?: string; metadata?: object }) => {
			const { status, error, synthesis, metadata } = specs;
			res.write('ÿ');
			res.write(JSON.stringify({ status, error, synthesis, metadata }));
			res.end();
		};

		let answer = '';
		let stage: { synthesis: string };
		const metadata = {};
		// const metadata = { user: {}, system: {} };
		try {
			// Store the user message as soon as it arrives
			const userMessage = { content: message, role: 'user' };
			let response = await Conversation.saveMessage(conversationId, userMessage, id);
			if (response.error) {
				return res.status(400).json({ status: false, error: response.error });
			}
			// metadata.user = { id: response.data.id };

			res.setHeader('Content-Type', 'text/plain');
			res.setHeader('Transfer-Encoding', 'chunked');

			const { iterator, error } = await Agents.sendMessage(conversationId, message);
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
			// const agentMessage = { content: answer, role: 'system' };
			// const response = await Conversation.saveMessage(conversationId, agentMessage);
			// if (response.error) {
			// 	return done({ status: false, error: 'Error saving agent response' });
			// }
			// metadata.system = { id: response.data.id };

			// update synthesis on conversation
			const data = { id: conversationId, synthesis: stage?.synthesis };
			await Conversation.publish(data);

			// set last interaction on conversation
			await Conversation.setLastInteractions(conversationId, 4);

			done({ status: true, metadata });
		} catch (exc) {
			return done({ status: false, error: 'Error saving agent response' });
		}
	}
}
