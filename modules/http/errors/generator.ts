import { HTTPErrorManager } from './manager';

export /*bundle*/ enum ErrorCodes {
	internalError = 500,
	invalidParameters = 10500
}

export /*bundle*/ class ErrorGenerator {
	static internalError(log: string, exc?: Error) {
		return new HTTPErrorManager(ErrorCodes.internalError, `Internal server error [${log}]`, exc);
	}

	static invalidParameters(parameters: string[]) {
		return new HTTPErrorManager(ErrorCodes.invalidParameters, `Invalid parameters: ${JSON.stringify(parameters)}`);
	}
}
