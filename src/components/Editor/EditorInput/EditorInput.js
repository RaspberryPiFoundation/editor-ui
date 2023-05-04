import React, { createRef, useEffect, useRef, useState } from 'react'
import {DragDropContext} from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { closeFile, setFocussedFileIndex, setOpenFiles } from '../EditorSlice'
import { TabPanel, Tabs } from 'react-tabs'
import Button from '../../Button/Button'
import { CloseIcon } from '../../../Icons'
import EditorPanel from '../EditorPanel/EditorPanel'
import DraggableTab from '../DraggableTabs/DraggableTab'
import DroppableTabList from '../DraggableTabs/DroppableTabList'
import RunBar from '../../RunButton/RunBar'

const EditorInput = () => {
  const project = useSelector((state) => state.editor.project)
  const openFiles = useSelector((state) => state.editor.openFiles)
  const focussedFileIndices = useSelector((state) => state.editor.focussedFileIndices)
  const [isMounted, setIsMounted] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onDragStart = (input) => {
    console.log('dragging....')
    const { source } = input
    dispatch(setFocussedFileIndex({panelIndex: parseInt(source.droppableId), fileIndex: source.index}))
  }

  const onDragEnd = (result) => {
    if(!result.destination) return
    const { source, destination } = result
    var openFilesData = [...openFiles]

    var oldPane = [...openFilesData[source.droppableId]]
    const [removed] = oldPane.splice(source.index, 1)
    openFilesData[source.droppableId] = [...oldPane]

    var newPane = [...openFilesData[destination.droppableId]]
    newPane.splice(destination.index, 0, removed)
    openFilesData[destination.droppableId] = [...newPane]
    dispatch(setOpenFiles(openFilesData))
    dispatch(setFocussedFileIndex({panelIndex: parseInt(destination.droppableId), fileIndex: destination.index}))
    if (destination.droppableId !== source.droppableId) {
      dispatch(setFocussedFileIndex({panelIndex: parseInt(source.droppableId), fileIndex: Math.max(source.index - 1, 0)}))
    }
  }

  const closeFileTab = (e, fileName) => {
    e.stopPropagation()
    dispatch(closeFile(fileName))
  }

  const [numberOfComponents, setNumberOfComponents] = useState(project.components.length)
  let tabRefs = useRef(project.components.map(createRef))

  useEffect(() => {
    setNumberOfComponents(project.components.length)
    Array(project.components.length).fill().forEach((_, i) => {
      tabRefs.current[i] = tabRefs.current[i] || React.createRef();
    })
  }, [project])

  useEffect(() => {
    focussedFileIndices.forEach((index, i) => {
      const fileName = openFiles[i][index]
      const componentIndex = project.components.findIndex(file => `${file.name}.${file.extension}`=== fileName)
      const fileRef = tabRefs.current[componentIndex]
      if (fileRef && fileRef.current) {
        fileRef.current.parentElement.scrollIntoView()
      }
    })
  }, [focussedFileIndices, openFiles, numberOfComponents, project, isMounted])

  return (
    <>
      <DragDropContext onDragStart={input => onDragStart(input)} onDragEnd={result => onDragEnd(result)}>
        {isMounted ?
          <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            {openFiles.map((panel, panelIndex) => (
              <Tabs key={panelIndex} selectedIndex={focussedFileIndices[panelIndex]} onSelect={() => {}}>
                <div className='react-tabs__tab-container'>
                  <DroppableTabList index={panelIndex}>
                    {panel.map((fileName, fileIndex) => (
                      <DraggableTab
                        key={fileIndex}
                        fileIndex={fileIndex}
                        panelIndex={panelIndex}
                      >
                        <span
                          className={`react-tabs__tab-inner${fileName !== 'main.py'? ' react-tabs__tab-inner--split': ''}`}
                          ref={tabRefs.current[project.components.findIndex(file => `${file.name}.${file.extension}`===fileName)]}
                        >
                          {fileName}
                          {fileName !== 'main.py' ?
                            <Button className='btn--tertiary react-tabs__tab-inner-close-btn' label='close' onKeyDown={(e) => e.stopPropagation()} onClickHandler={(e) => closeFileTab(e, fileName)} ButtonIcon={() => <CloseIcon scaleFactor={0.85}/> }/>
                          : null
                          }
                        </span>  
                      </DraggableTab>
                    ))}
                  </DroppableTabList>
                </div>
                {panel.map((fileName, i) => (
                  <TabPanel key={i}>
                    <EditorPanel fileName={fileName.split('.')[0]} extension={fileName.split('.').slice(1).join('.')} />
                  </TabPanel>
                ))}
                <RunBar />
              </Tabs>
            ))}
          </div>
          : null
        }
      </DragDropContext>
    </>
  )
}
export default EditorInput
