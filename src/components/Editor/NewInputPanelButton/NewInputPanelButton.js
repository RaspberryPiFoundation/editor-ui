import React from "react";
import Button from "../../Button/Button";
import { useDispatch } from "react-redux";
import { addFilePanel } from "../EditorSlice";

const NewInputPanelButton = () => {
  const dispatch = useDispatch()

  const openNewPanel = () => {
    dispatch(addFilePanel())
  }
  return (
    <Button className={'btn--primary'} buttonText='Add another panel' onClickHandler={openNewPanel} />
  )
}

export default NewInputPanelButton
