import './ProjectImages.scss';

import { ChevronDown } from '../../../../../Icons';
import { useTranslation } from 'react-i18next'
import { gql } from '@apollo/client';

export const PROJECT_IMAGES_FRAGMENT = gql`
  fragment ProjectImagesFragment on ImageConnection {
    nodes {
      filename
      url
    }
  }
`

export const ProjectImages = (props) => {
  const { projectImagesData } = props
  const { t } = useTranslation()

  return (
    <details className='file-pane-section file-pane-section__images' open>
      <summary>
        <h2 className='menu-pop-out-subheading'>{t('filePane.images')}</h2>
        <div className='accordion-icon'>
          <ChevronDown />
        </div>
      </summary>
      <div className='project-images'>
        {projectImagesData.nodes.map((image, i) => (
          <div key={i} className='project-images__block'>
            <div className='project-images__image-wrapper'>
              <img className='project-images__image' src={image.url} alt={image.filename}/>
            </div>
            <p>{image.filename}</p>
          </div>
        ))}
      </div>
    </details>
  )
}

