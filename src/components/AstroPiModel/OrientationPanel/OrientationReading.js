import { useEffect, useState } from 'react';
import Sk from 'skulpt';
import '../AstroPiModel.scss';

const OrientationReading = (props) => {
  const {name} = props
  const indexMap = {"roll": 0, "pitch": 1, "yaw": 2}
  // const [reading, setReading] = useState(Sk.sense_hat.rtimu.raw_orientation[indexMap[name]])

  // useEffect(() => {
  //   console.log(Sk.sense_hat.rtimu.raw_orientation)
  //   setReading(Math.round(Sk.sense_hat.rtimu.raw_orientation[indexMap[name]]*10)/10)
  // }, [window.mod])

  return (
    <div className="rangeslider-container">
      <div className="readings-container">
        <span className="orientation-reading">
          {name}:
        </span>
        <span className={`sense-hat-${name} right`}>{Math.round(Sk.sense_hat.rtimu.raw_orientation[indexMap[name]]*10)/10}</span>
      </div>
    </div>
  )
}

export default OrientationReading
