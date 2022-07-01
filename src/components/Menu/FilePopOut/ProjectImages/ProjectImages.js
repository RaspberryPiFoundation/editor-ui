import './ProjectImages.scss';

import { useSelector } from 'react-redux'
import { useState } from 'react';

const ProjectImages = () => {
  const projectImages = useSelector((state) => state.editor.project.image_list);

  return (
    <details className='menu-pop-out-section image-gallery' open>
      <summary>
        <h3 className='menu-pop-out-subheading'>Image Gallery</h3>
      </summary>
      <div className='project-images'>
        {projectImages.map((image, i) => (
          <div key={i} className='project-image-block'>
            <img className='project-image' src={image.url} alt={image.filename}/>
            <p>{image.filename}</p>
          </div>
        ))}
      </div>
    </details>
  )
}

export default ProjectImages
