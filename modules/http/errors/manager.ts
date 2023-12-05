import { ErrorManager } from '@beyond-js/response/main';

export /*bundle*/ class HTTPErrorManager extends ErrorManager {
	get is(): 'chat-api-http-error' {
		return 'chat-api-http-error';
	}
}
