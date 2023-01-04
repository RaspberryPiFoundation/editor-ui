import { useTranslation } from 'react-i18next';
import './ProjectHeader.scss'


const ProjectHeader = (props) => {
  const { t } = useTranslation()

  return (
    <header className='editor-project-header'>
      <div className='editor-project-header__content'>
        <h2>{t('projectHeader.subTitle')}</h2>
        <h1 className='editor-project-header__title'>{t('projectHeader.title')}</h1>
        <h3>{t('projectHeader.text')}</h3>
      </div>
      <div className='editor-project-header__action'>
        {props.children}
      </div>
    </header>
  );
};

export default ProjectHeader;
