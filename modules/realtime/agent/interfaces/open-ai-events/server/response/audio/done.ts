/**
 * Returned when the model-generated audio is done.
 * Also emitted when a Response is interrupted, incomplete, or cancelled.
 */
export /*bundle*/ interface IResponseAudioDoneServerEvent {
	// The unique ID of the server event.
	event_id: string;

	// The event type, must be "response.audio.done".
	type: 'response.audio.done';

	// The ID of the response.
	response_id: string;

	// The ID of the item to which the content part was added.
	item_id: string;

	// The index of the output item in the response.
	output_index: number;

	// The index of the content part in the item's content array.
	content_index: number;
}
