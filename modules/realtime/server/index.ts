import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import * as url from 'url';
import { IncomingMessage } from 'http';
import { Socket } from 'net';

// Create an HTTP server
const server = http.createServer();

// Create a WebSocket server instance attached to the HTTP server
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
	console.log('Client connected');

	// Handle messages received from the client
	ws.on('message', (message: string) => {
		console.log(`Received message: ${message}`);
		// Echo the message back to the client
		ws.send(`Server received: ${message}`);
	});

	// Handle client disconnecting
	ws.on('close', () => {
		console.log('Client disconnected');
	});
});

// Start the server
server.listen(8080, () => {
	console.log('Server is listening on port 8080');
});
