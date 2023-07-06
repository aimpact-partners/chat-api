import * as React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';

export /*bundle*/
function View({ store }) {
	const [messages, setMessages] = React.useState(store.messages.length);
	const [fetching, setFetching] = React.useState(store.fetching);

	const update = () => {
		setMessages(store.messages.length);
		setFetching(store.fetching);
	};
	useBinder([store], update);

	const [inputValue, setInputValue] = React.useState('');
	const handleInputChange = event => setInputValue(event.target.value);
	const handleSubmit = async event => {
		event.preventDefault();
		if (inputValue.trim() === '') return;

		setInputValue('');
		await store.query(inputValue);
	};

	return (
		<div className='chat-container'>
			<div className='message-container'>
				{store.messages.map((message, index) => (
					<div className={`message ${message.type}`} key={index}>
						{message.content}
					</div>
				))}
			</div>
			<form className='input-container' onSubmit={handleSubmit}>
				<input
					type='text'
					className='message-input'
					value={inputValue}
					disabled={fetching}
					onChange={handleInputChange}
					placeholder='Type your message...'
				/>
				<button type='submit' className='send-button'>
					Send
				</button>
			</form>
		</div>
	);
}
