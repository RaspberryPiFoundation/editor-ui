import {useState} from 'react'
import { useDispatch } from 'react-redux';
import Modal from 'react-modal';

import { addProjectComponent } from '../EditorSlice';
import Button from '../../Button/Button'

const NewComponentButton = () => {
    const [modalIsOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
  
    const closeModal = () => setIsOpen(false);
    const showModal = () => {
      console.log("opening")
      setIsOpen(true)
    };
    const createComponent = () => {
      const fileName = document.getElementById('name').value
      const name = fileName.split('.')[0]
      const extension = fileName.split('.').slice(1).join('.')
      dispatch(addProjectComponent({extension: extension, name: name}))
      closeModal()
    }

    const customStyles = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
      },
    };

    Modal.setAppElement('#root')
  
    return (
      <>
        <Button buttonText='+' onClickHandler={showModal} className="proj-new-component-button" />
  
        <Modal 
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="New File"
        >
          <h2>Add a new file to your project</h2>
          <form>
            <label htmlFor='name'>Name: </label>
            <input type='text' name='name' id='name'></input>
            <Button buttonText='Cancel' onClickHandler={closeModal} />
            <Button buttonText='Save' onClickHandler={createComponent} />
          </form>
        </Modal>
      </>
    );
  }
  
export default NewComponentButton;