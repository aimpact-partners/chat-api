import { ChatAPIErrorManager } from './manager';

export /*bundle*/ enum ErrorCodes {
	internalError = 1,
	documentNotFound = 404,
	documentNotSaved = 800,
	documentAlreadyExist,
	invalidParameters,
	languageNotSupport,
	promptIsOptions
}

export /*bundle*/ class ErrorGenerator {
	static internalError(exc?: Error) {
		return new ChatAPIErrorManager(ErrorCodes.internalError, 'Internal server error', exc);
	}

	static documentNotFound(collectionName: string, documentId: string, exc?: Error) {
		return new ChatAPIErrorManager(
			ErrorCodes.documentNotFound,
			`Error getting document id "${documentId}" from "${collectionName}" collection`,
			exc
		);
	}

	static documentNotSaved(collectionName: string, documentId: string, exc?: Error) {
		return new ChatAPIErrorManager(
			ErrorCodes.documentNotSaved,
			`Error storing document id "${documentId}" on "${collectionName}" collection`,
			exc
		);
	}

	static documentAlreadyExist(collectionName: string, documentId: string, exc?: Error) {
		return new ChatAPIErrorManager(
			ErrorCodes.documentNotSaved,
			`Error storing document id "${documentId}" on "${collectionName}" collection`,
			exc
		);
	}

	static invalidParameters(collectionName: string, parameter: string, exc?: Error) {
		return new ChatAPIErrorManager(
			ErrorCodes.documentNotSaved,
			`Invalid parameters, "${parameter}" is required in collection "${collectionName}"`,
			exc
		);
	}

	static languageNotSupport(collectionName: string, parameter: string, exc?: Error) {
		return new ChatAPIErrorManager(
			ErrorCodes.languageNotSupport,
			`PromptTemplate not support language "${parameter}"`,
			exc
		);
	}

	static promptDependenciesError() {
		return new ChatAPIErrorManager(
			ErrorCodes.promptIsOptions,
			`Error/s found in at least one dependency of the requested prompt`
		);
	}
}
