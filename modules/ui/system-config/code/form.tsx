import React from 'react';
import { Form } from 'pragmate-ui/form';
import { Textarea } from 'pragmate-ui/form';

export /*bundle*/ const SystemModal = ({}) => {
	const [value, setValue] = React.useState('');

	function handleChange(event) {
		const { value: textAreaValue } = event.target;
		setValue(textAreaValue);
	}

	function handleSubmit(event) {
		event.preventDefault();
		console.log(`// Logic...`);
	}

	return (
		<Form onSubmit={handleSubmit} className='results-form'>
			<Textarea value={value} placeholder='Insert text...' onChange={handleChange} />
		</Form>
	);
};
