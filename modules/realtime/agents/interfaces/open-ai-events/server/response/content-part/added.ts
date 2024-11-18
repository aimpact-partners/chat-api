import type { IPart } from './part';

/**
 * Returned when a new content part is added to an assistant message item during response generation.
 */
export /*bundle*/ interface IResponseContentPartAddedServerEvent {
	// The unique ID of the server event.
	event_id: string;

	// The event type, must be "response.content_part.added".
	type: 'response.content_part.added';

	// The ID of the response.
	response_id: string;

	// The ID of the item to which the content part was added.
	item_id: string;

	// The index of the output item in the response.
	output_index: number;

	// The index of the content part in the item's content array.
	content_index: number;

	// The content part that was added.
	part: IPart;
}
