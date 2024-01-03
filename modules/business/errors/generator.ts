import { BusinessErrorManager } from './manager';

export /*bundle*/ enum ErrorCodes {
	internalError = 1,
	documentNotFound = 404,
	documentNotSaved = 800,
	documentAlreadyExist,
	invalidParameters,
	projectNotFound,
	languageNotSupport,
	promptDependenciesError,
	promptIsOptions,
	promptLiteralsNotFound
}

export /*bundle*/ class ErrorGenerator {
	static internalError(exc?: Error) {
		return new BusinessErrorManager(ErrorCodes.internalError, 'Internal server error', exc);
	}

	static documentNotFound(collectionName: string, documentId: string, exc?: Error) {
		return new BusinessErrorManager(
			ErrorCodes.documentNotFound,
			`Error getting document id "${documentId}" from "${collectionName}" collection`,
			exc
		);
	}

	static documentNotSaved(collectionName: string, documentId: string, exc?: Error) {
		return new BusinessErrorManager(
			ErrorCodes.documentNotSaved,
			`Error storing document id "${documentId}" on "${collectionName}" collection`,
			exc
		);
	}

	static documentAlreadyExist(collectionName: string, documentId: string, exc?: Error) {
		return new BusinessErrorManager(
			ErrorCodes.documentAlreadyExist,
			`Error storing document id "${documentId}" on "${collectionName}" collection`,
			exc
		);
	}

	static invalidParameters(parameters: string[]) {
		return new BusinessErrorManager(
			ErrorCodes.invalidParameters,
			`Invalid parameters: ${JSON.stringify(parameters)}`
		);
	}

	static projectNotFound(id: string) {
		return new BusinessErrorManager(ErrorCodes.projectNotFound, `Project "${id}" not found`);
	}

	static languageNotSupport(collectionName: string, parameter: string, exc?: Error) {
		return new BusinessErrorManager(
			ErrorCodes.languageNotSupport,
			`${collectionName} not support "${parameter}" language`,
			exc
		);
	}

	static promptDependenciesError() {
		return new BusinessErrorManager(
			ErrorCodes.promptDependenciesError,
			`Error/s found in at least one dependency of the requested prompt`
		);
	}

	static promptLiteralsNotFound() {
		return new BusinessErrorManager(
			ErrorCodes.promptLiteralsNotFound,
			`Error/s found in at least one literals pure of the requested prompt`
		);
	}
}
