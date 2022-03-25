import './ProjectImages.css';

import { useSelector } from 'react-redux'

const ProjectImages = () => {
  const projectImages = useSelector((state) => state.editor.project.image_list);
  return (
    <section className='project-image-gallery'>
      <h2>Project Images</h2>
      <div className='project-images'>
        {projectImages.map((image, i) => (
          <div key={i} className='project-image-block'>
            <img className='project-image' src={image.url} alt={image.fileName}/>
            <p>{image.fileName}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProjectImages
