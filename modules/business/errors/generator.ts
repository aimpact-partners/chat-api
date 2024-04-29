import { BusinessErrorManager } from './manager';
import { ErrorManager } from '@beyond-js/response/main';

export /*bundle*/ enum ErrorCodes {
	internalError = 1,
	documentNotFound = 404,
	documentNotSaved = 800,
	documentAlreadyExist,
	invalidParameters,
	projectNotFound,
	languageNotSupport,
	promptLiteralsNotFound,
	promptDependenciesNotFound,
	promptOptionsNotFound,
	promptDependenciesError,
	promptOptionsError,
	promptIsOptions,
	userAlreadyExists,
	roleNotSupported,
	unauthorizedUserForChat
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

	static promptOptionsError(error: ErrorManager) {
		return new BusinessErrorManager(ErrorCodes.promptOptionsError, error.text);
	}

	static promptDependenciesError(error: ErrorManager) {
		return new BusinessErrorManager(ErrorCodes.promptDependenciesError, error.text);
	}

	static promptLiteralsNotFound(items: string[]) {
		return new BusinessErrorManager(
			ErrorCodes.promptLiteralsNotFound,
			`Error/s found in at least one literals pure of the requested prompt, literals: ${items.join(', ')}`
		);
	}

	static promptDependenciesNotFound() {
		return new BusinessErrorManager(
			ErrorCodes.promptDependenciesNotFound,
			`Error/s found in at least one dependency of the requested prompt`
		);
	}

	static promptOptionsNotFound() {
		return new BusinessErrorManager(
			ErrorCodes.promptOptionsNotFound,
			`Error/s found in at least one dependency of the requested prompt`
		);
	}

	static userAlreadyExists(id: string, exc?: Error) {
		return new BusinessErrorManager(
			ErrorCodes.userAlreadyExists,
			`The user "${id}" is already registered in the application`,
			exc
		);
	}

	static roleNotSupported(role: string, exc?: Error) {
		return new BusinessErrorManager(ErrorCodes.roleNotSupported, `Role not "${role}" supported`, exc);
	}

	static unauthorizedUserForChat(exc?: Error) {
		return new BusinessErrorManager(
			ErrorCodes.unauthorizedUserForChat,
			`Unauthorized user to send messages in chat`,
			exc
		);
	}
}
