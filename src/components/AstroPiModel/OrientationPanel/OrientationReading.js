import '../AstroPiModel.scss';

const OrientationReading = (props) => {

  const {name} = props

  return (
    <div className="rangeslider-container">
      <div className="readings-container">
        <span className="orientation-reading">
          {name}:
        </span>
        <span className={`sense-hat-${name} right`}></span>
      </div>
    </div>
  )
}

export default OrientationReading
