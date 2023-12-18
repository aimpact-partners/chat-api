import type { Request, Response, Application } from 'express';
import type { IAuthenticatedRequest } from '@aimpact/chat-api/middleware';
import { Chat } from '@aimpact/chat-api/business/chats';
import { Agents } from '@aimpact/chat-api/business/agents';
import { UserMiddlewareHandler } from '@aimpact/chat-api/middleware';
import { processAudio } from './audio';

interface IMessageSpecs {
	id: string;
	content: string;
	systemId: string;
	timestamp?: number;
}

export class ChatMessagesRoutes {
	static setup(app: Application) {
		// app.use((err, req: Request, res: Response, next) => {
		// 	res.status(err.status || 500).json({
		// 		message: err.message,
		// 		errors: err.errors
		// 	});
		// });

		app.post('/chats/:id/messages', UserMiddlewareHandler.validate, ChatMessagesRoutes.sendMessage);
		app.post('/conversations/:id/messages', UserMiddlewareHandler.validate, ChatMessagesRoutes.sendMessage);
	}

	static async sendMessage(req: IAuthenticatedRequest, res: Response) {
		const chatId = req.params.id;
		if (!chatId) {
			return res.status(400).json({ status: false, error: 'Parameter chatId is required' });
		}

		let chat;
		try {
			chat = await Chat.get(chatId, req.user.uid);
		} catch (e) {
			console.error(e);
			res.json({ status: false, error: e.message });
		}
		if (chat.error) {
			return res.status(400).json({ status: false, error: chat.error });
		}
		// if (!chat.project) {
		// 	return res.status(400).json({ status: false, error: 'the chat not has a project defined' });
		// }

		/**
		 *	Validate the type of request
		 *		req.header.content-type
					application/json for text messages
		 *			multipart/form-data for audio messages
		 *
		 *	If it is a text, the parameters come in the body of the request
		 *	If it is by audio, the audio must be processed and the transcription obtained
		 *
		 * @param req 
		 * @param res 
		 * @returns Promise<{ data?: IMessageSpecs; error?: string }>
		 */
		const processRequest = async (
			req: IAuthenticatedRequest
		): Promise<{ data?: IMessageSpecs; error?: string }> => {
			const textRequest = req.headers['content-type'] === 'application/json';
			if (textRequest) return { data: req.body };

			try {
				const { transcription, fields, error } = await processAudio(req, chat);
				if (error) return { error };

				if (transcription.error) return { error: transcription.error };
				return {
					data: {
						id: fields.id,
						content: transcription.data?.text,
						systemId: fields.systemId,
						timestamp: fields.timestamp
					}
				};
			} catch (e) {
				console.error(e);
				return { error: e.message };
			}
		};
		const { data, error } = await processRequest(req);
		if (error) {
			console.error(error);
			return res.json({ status: false, error });
		}

		const done = (specs: { status: boolean; error?: string }) => {
			const { status, error } = specs;
			res.write('ÿ');
			res.write(JSON.stringify({ status, error }));
			res.end();
		};
		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Transfer-Encoding', 'chunked');

		const { id, content, timestamp, systemId } = data;

		let answer = '';
		let metadata: { answer: string; synthesis: string };
		try {
			// Store the user message as soon as it arrives
			const userMessage = { id, content, role: 'user', timestamp };
			let response = await Chat.saveMessage(chatId, userMessage);
			if (response.error) {
				return done({ status: false, error: response.error });
			}

			const audioRequest = req.headers['content-type'] !== 'application/json';
			if (audioRequest) {
				const action = { type: 'transcription', data: { transcription: content } };
				res.write('😸' + JSON.stringify(action) + '🖋️');
			}

			const { iterator, error } = await Agents.sendMessage(chatId, content);
			if (error) {
				return done({ status: false, error: error });
			}

			for await (const part of iterator) {
				const { chunk } = part;
				answer += chunk ? chunk : '';
				chunk && res.write(chunk);

				if (part.metadata) {
					metadata = part.metadata;
					break;
				}
			}
		} catch (exc) {
			console.error(exc);
			return done({ status: false, error: 'Error processing agent response' });
		}

		try {
			// set assistant message on firestore
			const agentMessage = { id: systemId, content: answer, answer: metadata.answer, role: 'assistant' };
			const response = await Chat.saveMessage(chatId, agentMessage);
			if (response.error) {
				console.error('Error saving agent response:', response.error);
				return done({ status: false, error: 'Error saving agent response' });
			}

			// update synthesis on chat
			const data = { id: chatId, synthesis: metadata?.synthesis };
			await Chat.save(data);

			// set last interaction on chat
			await Chat.setLastInteractions(chatId, 4);
		} catch (exc) {
			return done({ status: false, error: 'Error saving agent response' });
		}

		done({ status: true });
	}
}
