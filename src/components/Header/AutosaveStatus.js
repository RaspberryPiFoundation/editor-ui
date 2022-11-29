import { useSelector, connect, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next';

const AutosaveStatus = (props) => {
  const { user } = props;

  const dispatch = useDispatch()
  const { t } = useTranslation()
}

export default AutosaveStatus