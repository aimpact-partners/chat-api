import { Server as ServerBase } from '@aimpact/agents-api/beyond-js/backend';
import * as dotenv from 'dotenv';

dotenv.config();

declare const bimport: (module: string) => Promise<any>;

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

const server = new Server();
server.start('@aimpact/agents-api/http/routes');
