import React, { createRef, useEffect, useRef, useState } from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { closeFile, setFocussedFileIndex, setOpenFiles } from '../EditorSlice'
import NewInputPanelButton from '../NewInputPanelButton/NewInputPanelButton'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import Button from '../../Button/Button'
import { CloseIcon } from '../../../Icons'
import EditorPanel from '../EditorPanel/EditorPanel'
import RunnerControls from '../../RunButton/RunnerControls'
import DraggableTab from '../DraggableTabs/DraggableTab'
import DroppableTabList from '../DraggableTabs/DroppableTabList'

const EditorInput = () => {
  const project = useSelector((state) => state.editor.project)
  const openFiles = useSelector((state) => state.editor.openFiles)
  const focussedFileIndex = useSelector((state) => state.editor.focussedFileIndex)
  const [isMounted, setIsMounted] = useState(false)
  const dispatch = useDispatch()
  useEffect(() => {
    setIsMounted(true)
  })

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
  }

  const switchToFileTab = (index) => {
    console.log('setting focussed file index...')
    dispatch(setFocussedFileIndex(index))
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
    console.log('switching focus to the correct file')
    const fileName = openFiles[0][focussedFileIndex]
    const componentIndex = project.components.findIndex(file => `${file.name}.${file.extension}`=== fileName)
    const fileRef = tabRefs.current[componentIndex]
    if (fileRef && fileRef.current) {
      fileRef.current.parentElement.scrollIntoView()
    }
  }, [focussedFileIndex, openFiles, numberOfComponents])

  return (
    <>
      <NewInputPanelButton />
      <div className='proj-editor-container'>
        <DragDropContext onDragEnd={result => onDragEnd(result)}>
          {isMounted ?
            <div style={{display: 'flex', flexDirection: 'column'}}>
              {openFiles.map((panel, index) => (
                <Tabs key={index} selectedIndex={focussedFileIndex} onSelect={index => switchToFileTab(index)}>
                  <div className='react-tabs__tab-container'>
                    <DroppableTabList index={index}>
                      {panel.map((fileName, item_index) => (
                        <DraggableTab key={item_index} item_index={item_index} index={index}>
                          <span
                            className={`react-tabs__tab-inner${fileName !== 'main.py'? ' react-tabs__tab-inner--split': ''}`}
                            ref={tabRefs.current[project.components.findIndex(file => `${file.name}.${file.extension}`===fileName)]}
                            >
                              {fileName}
                              {fileName !== 'main.py' ?
                                <Button className='btn--tertiary react-tabs__tab-inner-close-btn' label='close' onClickHandler={(e) => closeFileTab(e, fileName)} ButtonIcon={() => <CloseIcon scaleFactor={0.85}/> }/>
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
                </Tabs>
              ))}
            </div> : null
          }
        </DragDropContext>
        <RunnerControls />
      </div>
    </>
  )
}
export default EditorInput
