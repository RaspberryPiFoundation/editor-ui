import "../../../assets/stylesheets/ImageUploadButton.scss";

import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dropzone from "react-dropzone";
import Modal from "react-modal";

import { updateImages, setNameError } from "../../../redux/EditorSlice";
import Button from "../../Button/Button";
import NameErrorMessage from "../ErrorMessage/NameErrorMessage";
import store from "../../../app/store";
import ApiCallHandler from "../../../utils/apiCallHandler";

const allowedExtensions = {
  python: ["jpg", "jpeg", "png", "gif"],
};

const allowedExtensionsString = (projectType) => {
  const extensionsList = allowedExtensions[projectType];
  if (extensionsList.length === 1) {
    return `'.${extensionsList[0]}'`;
  } else {
    return (
      `'.` +
      extensionsList.slice(0, -1).join(`', '.`) +
      `' or '.` +
      extensionsList[extensionsList.length - 1] +
      `'`
    );
  }
};

const ImageUploadButton = ({ reactAppApiEndpoint }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const dispatch = useDispatch();
  const projectType = useSelector((state) => state.editor.project.project_type);
  const projectIdentifier = useSelector(
    (state) => state.editor.project.identifier
  );
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const imageNames = projectImages.map((image) => `${image.filename}`);
  const user = useSelector((state) => state.auth.user);

  const closeModal = () => {
    setFiles([]);
    setIsOpen(false);
  };
  const showModal = () => {
    dispatch(setNameError(""));
    setIsOpen(true);
  };
  const saveImages = async () => {
    const { uploadImages } = ApiCallHandler({
      reactAppApiEndpoint,
    });

    files.every((file) => {
      const fileName = file.name;
      const extension = fileName.split(".").slice(1).join(".").toLowerCase();
      if (
        imageNames.includes(fileName) ||
        files.filter((file) => file.name === fileName).length > 1
      ) {
        dispatch(setNameError("Image names must be unique."));
        return false;
      } else if (isValidFileName(fileName, files)) {
        return true;
      } else if (!allowedExtensions[projectType].includes(extension)) {
        dispatch(
          setNameError(
            `Image names must end in ${allowedExtensionsString(projectType)}.`
          )
        );
        return false;
      } else {
        dispatch(setNameError("Error"));
        return false;
      }
    });
    if (store.getState().editor.nameError === "") {
      const response = await uploadImages(
        projectIdentifier,
        user.access_token,
        files
      );
      dispatch(updateImages(response.data.image_list));
      closeModal();
    }
  };

  const isValidFileName = (fileName, files) => {
    const extension = fileName.split(".").slice(1).join(".").toLowerCase();
    if (
      allowedExtensions[projectType].includes(extension) &&
      !imageNames.includes(fileName) &&
      files.filter((file) => file.name === fileName).length === 1
    ) {
      return true;
    } else {
      return false;
    }
  };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
    overlay: {
      zIndex: 1000,
    },
  };

  return (
    <>
      <Button
        buttonText="Upload Image"
        onClickHandler={showModal}
        className="proj-image-upload-button"
      />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Upload Image"
        appElement={document.getElementById("root") || undefined}
      >
        <h2>Upload an image</h2>

        <NameErrorMessage />
        <Dropzone
          onDrop={useCallback((acceptedFiles) => {
            setFiles((prev) => [...prev, ...acceptedFiles]);
          }, [])}
        >
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()} className="dropzone-area">
                <input {...getInputProps()} />
                <p className="dropzone-info">
                  Drag and drop images here, or click to select images from file
                </p>
                {files.map((file, i) => (
                  <p key={i}>{file.name}</p>
                ))}
              </div>
            </section>
          )}
        </Dropzone>
        <div className="modal-footer">
          <Button buttonText="Cancel" onClickHandler={closeModal} />
          <Button buttonText="Save" onClickHandler={saveImages} />
        </div>
      </Modal>
    </>
  );
};

export default ImageUploadButton;
