import { ErrorManager } from '@beyond-js/response/main';

export /*bundle*/ class ChatAPIErrorManager extends ErrorManager {
	get is() {
		return 'chat-api';
	}
}
