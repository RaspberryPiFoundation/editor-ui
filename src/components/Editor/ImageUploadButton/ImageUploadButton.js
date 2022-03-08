import './ImageUploadButton.css';

import {useCallback, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Dropzone from 'react-dropzone';
import Modal from 'react-modal';

import { addProjectComponent, setNameError } from '../EditorSlice';
import Button from '../../Button/Button'
import NameErrorMessage from '../ErrorMessage/NameErrorMessage';
import store from '../../../app/store';

const allowedExtensions = {
  "python": [
    "jpg",
    "jpeg",
    "png",
    "gif"
  ]
}

const allowedExtensionsString = (projectType) => {
  const extensionsList = allowedExtensions[projectType];
  if (extensionsList.length == 1) {
    return `'.${extensionsList[0]}'`
  } else {
    return `'.` + extensionsList.slice(0,-1).join(`', '.`) + `' or '.` + extensionsList[extensionsList.length-1] + `'`;
  }
}

const ImageUploadButton = () => {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const dispatch = useDispatch();
    const projectType = useSelector((state) => state.editor.project.project_type)
    const projectComponents = useSelector((state) => state.editor.project.components);
    const componentNames = projectComponents.map(component => `${component.name}.${component.extension}`)
    console.log(componentNames)
  
    const closeModal = () => {
        setFiles([])
        setIsOpen(false);
    }
    const showModal = () => {
      dispatch(setNameError(""));
      setIsOpen(true)
    };
    const uploadImages = () => {
      files.every((file) => {
        const fileName = file.name
        const extension = fileName.split('.').slice(1).join('.').toLowerCase();
        if (componentNames.includes(fileName) || files.filter(file => file.name === fileName).length > 1) {
          dispatch(setNameError("Image names must be unique."));
          return false
        }
        else if (isValidFileName(fileName)) {
            return true
        } else if (!allowedExtensions[projectType].includes(extension)) {
          dispatch(setNameError(`Image names must end in ${allowedExtensionsString(projectType)}.`));
          return false
        } else {
          dispatch(setNameError("Error"));
          return false
        }
      })
      if (store.getState().editor.nameError==='') {
          files.forEach((file) => {
            const name = file.name.split('.')[0]
            const extension = file.name.split('.').slice(1).join('.');
            dispatch(addProjectComponent({extension: extension, name: name}));
          })
        closeModal()
      }
    }

    const isValidFileName = (fileName) => {
      const extension = fileName.split('.').slice(1).join('.').toLowerCase()
      if (allowedExtensions[projectType].includes(extension) && !componentNames.includes(fileName)) {
        return true;
      } else {
        return false;
      }
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
  
    return (
      <>
        <Button buttonText='Upload Image' onClickHandler={showModal} className="proj-image-upload-button" />
  
        <Modal 
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Upload Image"
          appElement={document.getElementById('root') || undefined}
        >
          <h2>Upload an image</h2>

          {/* <p>Drag and drop an image into the area below or choose an image from a file on your computer</p> */}

          <NameErrorMessage />
          <Dropzone 
          onDrop={
            useCallback(acceptedFiles => {
                setFiles(prev => [...prev, ...acceptedFiles]);
                console.log(acceptedFiles)
              }, [])
              }>
            {({getRootProps, getInputProps}) => (
              <section>
              <div {...getRootProps()} className='dropzone-area'>
                  <input {...getInputProps()} />
                  <p className='dropzone-info'>Drag and drop some images here, or click to select images</p>
                  {files.map((file, i) => <p key={i}>{file.name}</p>)}
                </div>
              </section>
            )}
          </Dropzone>
          <div>
            {/* <Button buttonText='Choose from File' /> */}
            <Button buttonText='Cancel' onClickHandler={closeModal} />
            <Button buttonText='Save' onClickHandler={uploadImages} />
          </div>
          
        </Modal>
      </>
    );
  }
  
export default ImageUploadButton;
