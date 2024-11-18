import type { Express } from 'express';
import type { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { RealtimeConversationConnections } from './connections';
import { WebSocketServer } from 'ws';
import * as http from 'http';
import * as url from 'url';
import { Socket } from 'net';

export /*bundle*/ class RealtimeAgentsServer {
	#connections = new RealtimeConversationConnections();

	constructor(app: Express) {
		const server = http.createServer(app);
		const wss = new WebSocketServer({ noServer: true });

		// Define the secret token that should be used for authentication
		const AUTH_TOKEN = 'your_secret_token';

		// Handle WebSocket upgrade requests
		server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
			const parsedUrl = url.parse(request.url || '', true);
			const authorizationHeader = request.headers['authorization'];
			const token = authorizationHeader ? authorizationHeader.split(' ')[1] : undefined;

			if (!token || token !== AUTH_TOKEN) {
				socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
				socket.destroy();
				return;
			}

			wss.handleUpgrade(request, socket, head, ws => {
				wss.emit('connection', ws, request);
			});
		});

		// Handle WebSocket connections
		wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
			this.#connections.create(ws, request);
		});
	}
}
