import { Server as ServerBase } from '@aimpact/agents-api/beyond-js/backend';
import { RealtimeAgentsServer } from '@aimpact/agents-api/realtime/server';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;

class Server extends ServerBase {
	/**
	 * The following mehods can now be overriden:
	 * _setErrorHandler
	 * _setHeader
	 */

	_begin() {}

	constructor() {
		super(PORT);
	}
}

// Start the HTTP + socket.io realtime server
const server = new Server();
server.start('@aimpact/agents-api/http/routes');

// Start the realtime agents server
const realtime = new RealtimeAgentsServer(server.app);
