import { HTTPErrorManager } from './manager';

export /*bundle*/ enum ErrorCodes {
	internalError = 1,
	invalidParameters = 10500
}

export /*bundle*/ class ErrorGenerator {
	static internalError(exc?: Error) {
		return new HTTPErrorManager(ErrorCodes.internalError, 'Internal server error', exc);
	}

	static invalidParameters(parameters: string[]) {
		return new HTTPErrorManager(ErrorCodes.invalidParameters, `Invalid parameters: ${JSON.stringify(parameters)}`);
	}
}
