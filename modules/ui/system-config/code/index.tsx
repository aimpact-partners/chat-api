import React from 'react';
import { Modal } from 'pragmate-ui/modal';

export /*bundle*/ const SystemModal = ({}) => {
	const [show, setShow] = React.useState(false);

	function handleModal() {
		setShow(!show);
	}

	return (
		<>
			<button className='action-button' onClick={handleModal}>
				Display Modal!
			</button>
			{show && (
				<Modal show className='beauty-modal' onClose={handleModal}>
					<div>
						<p>This is a normal modal ❤</p>
					</div>
				</Modal>
			)}
		</>
	);
};
