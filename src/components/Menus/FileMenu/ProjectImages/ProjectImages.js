import './ProjectImages.scss';

import { useSelector } from 'react-redux'
import { ChevronDown } from '../../../../Icons';

const ProjectImages = () => {
  const projectImages = useSelector((state) => state.editor.project.image_list);

  return (
    <details className='file-menu-section file-menu-section__images' open>
      <summary>
        <h2 className='menu-pop-out-subheading'>Image Gallery</h2>
        <div className='accordion-icon'>
          <ChevronDown />
        </div>
      </summary>
      <div className='project-images'>
        {projectImages.map((image, i) => (
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

export default ProjectImages
