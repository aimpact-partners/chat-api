import React from 'react';
import { UIForm } from './form';
import { Modal } from 'pragmate-ui/modal';

export /*bundle*/ const SystemModal = ({ chat }) => {
	const [show, setShow] = React.useState(false);
	const handleModal = () => setShow(!show);

	return (
		<>
			<button className='action-button' onClick={handleModal}>
				Definir system
			</button>
			{show && (
				<Modal show className='beauty-modal' onClose={handleModal}>
					<div>
						<p>Define la mision que tendra el agente para responder tus preguntas❤</p>
					</div>
					<UIForm chat={chat} closeModal={handleModal} />
				</Modal>
			)}
		</>
	);
};
