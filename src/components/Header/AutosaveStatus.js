import { useSelector, connect, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next';

import { CloudUploadIcon } from '../../Icons';

const AutosaveStatus = (props) => {
  const { user } = props;

  const { lastSavedTime }= useSelector((state) => state.editor.lastSavedTime)
  const { saving } = useSelector((state) => state.editor.saving)

  const dispatch = useDispatch()
  const { t } = useTranslation()

  return (
    <div>
        { saving === 'autosave-pending' ?
        <><CloudUploadIcon /> Auto saving</> :
        <>Auto saved</> }
    </div>
  )
}

export default AutosaveStatus