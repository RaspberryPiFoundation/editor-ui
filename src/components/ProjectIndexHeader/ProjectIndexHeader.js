import { useTranslation } from 'react-i18next';
import './ProjectIndexHeader.scss'


const ProjectIndexHeader = (props) => {
  const { t } = useTranslation()

  return (
    <header className='editor-project-header'>
      <div className='editor-project-header__inner'>
        <div className='editor-project-header__content'>
          <h2>{t('projectHeader.subTitle')}</h2>
          <h1 className='editor-project-header__title'>{t('projectHeader.title')}</h1>
          <h3>{t('projectHeader.text')}</h3>
        </div>
        <div className='editor-project-header__action'>
          {props.children}
        </div>
      </div>
    </header>
  );
};

export default ProjectIndexHeader;
