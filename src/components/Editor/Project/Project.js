import './Project.scss';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector} from 'react-redux'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import 'react-toastify/dist/ReactToastify.css'

import EditorPanel from '../EditorPanel/EditorPanel'
import FilePane from '../../FilePane/FilePane'
import Output from '../Output/Output'
import RenameFile from '../../Modals/RenameFile'
import RunnerControls from '../../RunButton/RunnerControls'
import { saveProject } from '../EditorSlice';
import { isOwner } from '../../../utils/projectHelpers'

const Project = (props) => {
  const dispatch = useDispatch()
  const { forWebComponent } = props;
  const user = useSelector((state) => state.auth.user)
  const project = useSelector((state) => state.editor.project)
  const saving = useSelector((state) => state.editor.saving)
  const modals = useSelector((state) => state.editor.modals)
  const renameFileModalShowing = useSelector((state) => state.editor.renameFileModalShowing)
  const [timeoutId, setTimeoutId] = useState(null)

  useEffect(() => {
    if(timeoutId) clearTimeout(timeoutId)

    if (forWebComponent || saving !== 'idle') {
      return
    }

    const id = setTimeout(async () => {
      if (isOwner(user, project) && project.identifier) {
        dispatch(saveProject({project: project, user: user, autosave: true}))
      } else {
        localStorage.setItem(project.identifier || 'project', JSON.stringify(project))
      }
    }, 2000);
    setTimeoutId(id);

  }, [project, saving, forWebComponent, user, dispatch])

  return (
    <div className='proj'>
      <div className={`proj-container${forWebComponent ? ' proj-container--wc': ''}`}>
      {!forWebComponent ? <FilePane /> : null}
        <div className='proj-editor-container'>
          <Tabs>
            <TabList>
              { project.components.map((file, i) => (
                  <Tab key={i}>{file.name}.{file.extension}</Tab>
                )
              )}
            </TabList>
            { project.components.map((file,i) => (
              <TabPanel key={i}>
                <EditorPanel fileName={file.name} extension={file.extension} />
              </TabPanel>
              )
            )}
            <RunnerControls />
          </Tabs>
        </div>
        <Output />
      </div>
      {(renameFileModalShowing && modals.renameFile) ? <RenameFile /> : null}
    </div>
  )
};

export default Project;

