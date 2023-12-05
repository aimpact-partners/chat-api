import { HTTPErrorManager } from './manager';

export /*bundle*/ enum ErrorCodes {
	invalidParameters = 10500
}

export /*bundle*/ class ErrorGenerator {
	static invalidParameters(parameters: string[]) {
		return new HTTPErrorManager(ErrorCodes.invalidParameters, `Invalid parameters: ${JSON.stringify(parameters)}`);
	}
}
