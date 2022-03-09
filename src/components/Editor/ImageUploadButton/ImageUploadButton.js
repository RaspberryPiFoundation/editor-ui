import './ImageUploadButton.css';

import {useCallback, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Dropzone from 'react-dropzone';
import Modal from 'react-modal';

import { addImage, setNameError } from '../EditorSlice';
import Button from '../../Button/Button'
import NameErrorMessage from '../ErrorMessage/NameErrorMessage';
import store from '../../../app/store';
import { uploadImage } from '../../../utils/apiCallHandler';

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
    const projectType = useSelector((state) => state.editor.project.project_type);
    const projectIdentifier = useSelector((state) => state.editor.project.identifier);
    const projectComponents = useSelector((state) => state.editor.project.components);
    const componentNames = projectComponents.map(component => `${component.name}.${component.extension}`);
    const user = useSelector((state) => state.auth.user);
  
    const closeModal = () => {
        setFiles([])
        setIsOpen(false);
    }
    const showModal = () => {
      dispatch(setNameError(""));
      setIsOpen(true)
    };
    const uploadImages = async () => {
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
            // const response = await uploadImage(projectIdentifier, user.access_token, image)
            const response = {status: 200, url: 'https://images.unsplash.com/photo-1646761838823-c86156af055b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'}
            dispatch(addImage({extension: extension, name: name, url: response.url}));
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

          <NameErrorMessage />
          <Dropzone 
          onDrop={
            useCallback(acceptedFiles => {
                setFiles(prev => [...prev, ...acceptedFiles]);
                console.log(acceptedFiles)
                acceptedFiles.forEach((file) => {
                    const reader = new FileReader()
              
                    reader.onabort = () => console.log('file reading was aborted')
                    reader.onerror = () => console.log('file reading has failed')
                    reader.onload = () => {
                    // Do whatever you want with the file contents
                      const binaryStr = reader.result
                      console.log(binaryStr)
                    }
                    reader.readAsArrayBuffer(file)
                  })
              }, [])
              }>
            {({getRootProps, getInputProps}) => (
              <section>
              <div {...getRootProps()} className='dropzone-area'>
                  <input {...getInputProps()} />
                  <p className='dropzone-info'>Drag and drop images here, or click to select images from file</p>
                  {files.map((file, i) => 
                  <p key={i}>{file.name}</p>)}
                </div>
              </section>
            )}
          </Dropzone>
          <div className='modal-footer'>
            <Button buttonText='Cancel' onClickHandler={closeModal} />
            <Button buttonText='Save' onClickHandler={uploadImages} />
          </div>
          
        </Modal>
      </>
    );
  }
  
export default ImageUploadButton;
