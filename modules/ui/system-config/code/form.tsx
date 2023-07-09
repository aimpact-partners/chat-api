import React from 'react';
import { Form } from 'pragmate-ui/form';
import { Button } from 'pragmate-ui/form';
import { Textarea } from 'pragmate-ui/form';

export const UIForm = ({ chat, closeModal }) => {
	const [value, setValue] = React.useState(chat?.system);
	const [error, setError] = React.useState(false);

	function handleChange(event) {
		const { value: textAreaValue } = event.target;
		setValue(textAreaValue);
	}

	const handleSubmit = async event => {
		event.preventDefault();
		const response = await chat.publish({ system: value });
		if (!response.status) {
			setError(response.error);
		}
		closeModal();
	};

	return (
		<Form onSubmit={handleSubmit} className='results-form'>
			<Textarea value={value} placeholder='Insert text...' onChange={handleChange} />
			<Button onClick={handleSubmit}>Beyond Button border</Button>
		</Form>
	);
};
