import { useSelector } from 'react-redux'

const ProjectImages = () => {
  const projectImages = useSelector((state) => state.editor.project.images);
  projectImages.forEach((image) => console.log(image))
  return (
    <section>
      <h2>Project Images</h2>
      <div>
        {projectImages.map((image, i) => (
          <div key={i}>
            <img src={image.url} alt={image.name} height='150px'/>
            <p>{image.name}.{image.extension}</p>
          </div>
        ))}

      </div>
    </section>
  )
}

export default ProjectImages
