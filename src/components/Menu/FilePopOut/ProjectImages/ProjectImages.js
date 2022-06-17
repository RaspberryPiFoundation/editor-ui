import './ProjectImages.scss';

import { useSelector } from 'react-redux'
import { useState } from 'react';

const ProjectImages = () => {
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const [open, setOpen] = useState(true)
  
  const toggleOpen = () => {
    setOpen(!open)
  }

  return (
    <section className='project-image-gallery'>
      <h3 className='menu-pop-out-subheading' onClick={toggleOpen}>Image Gallery</h3>
      { open ? (
        <div className='project-images'>
          {projectImages.map((image, i) => (
            <div key={i} className='project-image-block'>
              <img className='project-image' src={image.url} alt={image.filename}/>
              <p>{image.filename}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default ProjectImages
