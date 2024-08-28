import React, { createRef, useEffect, useRef, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import { TabPanel, Tabs } from "react-tabs";
import classNames from "classnames";
import { useMediaQuery } from "react-responsive";

import {
  closeFile,
  setFocussedFileIndex,
  setOpenFiles,
} from "../../../redux/EditorSlice";
import Button from "../../Button/Button";
import EditorPanel from "../EditorPanel/EditorPanel";
import DraggableTab from "../DraggableTabs/DraggableTab";
import DroppableTabList from "../DraggableTabs/DroppableTabList";
import RunBar from "../../RunButton/RunBar";

import "../../../assets/stylesheets/EditorInput.scss";
import RunnerControls from "../../RunButton/RunnerControls";
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";
import CloseIcon from "../../../utils/CloseIcon";
import { useTranslation } from "react-i18next";

const EditorInput = () => {
  const project = useSelector((state) => state.editor.project);
  const openFiles = useSelector((state) => state.editor.openFiles);
  const focussedFileIndices = useSelector(
    (state) => state.editor.focussedFileIndices,
  );
  const dispatch = useDispatch();
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const readOnly = useSelector((state) => state.editor.readOnly);

  const { t } = useTranslation();

  const onDragStart = (input) => {
    const { source } = input;
    dispatch(
      setFocussedFileIndex({
        panelIndex: parseInt(source.droppableId),
        fileIndex: source.index,
      }),
    );
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    let openFilesData = [...openFiles];
    let oldPane = [...openFilesData[source.droppableId]];
    const [removed] = oldPane.splice(source.index, 1);
    openFilesData[source.droppableId] = [...oldPane];

    let newPane = [...openFilesData[destination.droppableId]];
    newPane.splice(destination.index, 0, removed);
    openFilesData[destination.droppableId] = [...newPane];
    dispatch(setOpenFiles(openFilesData));
    dispatch(
      setFocussedFileIndex({
        panelIndex: parseInt(destination.droppableId),
        fileIndex: destination.index,
      }),
    );
    if (destination.droppableId !== source.droppableId) {
      dispatch(
        setFocussedFileIndex({
          panelIndex: parseInt(source.droppableId),
          fileIndex: Math.max(source.index - 1, 0),
        }),
      );
    }
  };

  const closeFileTab = (e, fileName) => {
    e.stopPropagation();
    dispatch(closeFile(fileName));
  };

  const [numberOfComponents, setNumberOfComponents] = useState(
    project?.components?.length,
  );
  let tabRefs = useRef(project?.components?.map(createRef));

  useEffect(() => {
    if (!project?.components) return;

    setNumberOfComponents(project.components.length);
    Array(project.components.length)
      .fill()
      .forEach((_, i) => {
        tabRefs.current[i] = tabRefs.current[i] || React.createRef();
      });
  }, [project?.components]);

  useEffect(() => {
    if (!project?.components) return;

    focussedFileIndices.forEach((index, i) => {
      const fileName = openFiles[i][index];
      const componentIndex = project.components.findIndex(
        (file) => `${file.name}.${file.extension}` === fileName,
      );
      const fileRef = tabRefs.current[componentIndex];
      if (fileRef && fileRef.current) {
        fileRef.current.parentElement.scrollIntoView();
      }
    });
  }, [focussedFileIndices, openFiles, numberOfComponents, project]);

  if (!project || !project.components) {
    return null;
  }

  return (
    <DragDropContext
      onDragStart={(input) => onDragStart(input)}
      onDragEnd={(result) => onDragEnd(result)}
    >
      <div className="editor-input">
        {openFiles.map((panel, panelIndex) => (
          <Tabs
            key={panelIndex}
            selectedIndex={focussedFileIndices[panelIndex]}
            onSelect={() => {}}
          >
            <div className="react-tabs__tab-container">
              <DroppableTabList index={panelIndex}>
                {panel.map((fileName, fileIndex) => (
                  <DraggableTab
                    key={fileIndex}
                    fileIndex={fileIndex}
                    panelIndex={panelIndex}
                  >
                    <span
                      className={classNames("react-tabs__tab-text", {
                        "react-tabs__tab-text--split": ![
                          "main.py",
                          "index.html",
                        ].includes(fileName),
                      })}
                      ref={
                        tabRefs.current[
                          project?.components?.findIndex(
                            (file) =>
                              `${file.name}.${file.extension}` === fileName,
                          )
                        ]
                      }
                    >
                      {fileName}
                    </span>
                    {!["main.py", "index.html"].includes(fileName) ? (
                      <Button
                        className="btn--tertiary react-tabs__tab-close-btn"
                        label="close"
                        onClickHandler={(e) => closeFileTab(e, fileName)}
                        ButtonIcon={() => <CloseIcon scaleFactor={0.85} />}
                      />
                    ) : null}
                  </DraggableTab>
                ))}
              </DroppableTabList>
              {isMobile ? <RunnerControls skinny /> : null}
            </div>
            {panel.map((fileName, i) => (
              <TabPanel key={i}>
                {readOnly && (
                  <span className="editor-input__view-only-banner">
                    {t("editorPanel.viewOnly")}
                  </span>
                )}
                <EditorPanel
                  fileName={fileName.split(".")[0]}
                  extension={fileName.split(".").slice(1).join(".")}
                />
              </TabPanel>
            ))}
            {isMobile ? null : <RunBar />}
          </Tabs>
        ))}
      </div>
    </DragDropContext>
  );
};
export default EditorInput;
