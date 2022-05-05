import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Sk from 'skulpt';
import '../AstroPiModel.scss';

const MotionInput = (props) => {
  const {defaultValue} = props;
  const [value, setValue] = useState(defaultValue);
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered);

  useEffect(() => {
    if (!codeRunTriggered) {
      Sk.sense_hat.start_motion_callback = () => {}
      Sk.sense_hat.stop_motion_callback = () => {}
    }
  }, [codeRunTriggered])

  useEffect(() => {
    if (Sk.sense_hat) {
      Sk.sense_hat.motion = value
    }
    value ? Sk.sense_hat.start_motion_callback() : Sk.sense_hat.stop_motion_callback()
  }, [value])

  return (
  <div className="rangeslider-container">
    <div className={`readings-container motion-sensor`}>
      <label htmlFor={`sense_hat_motion`}>Motion:</label>
      <input type="checkbox" id="sense_hat_motion" name="sense_hat_motion" defaultValue={value} onChange={e => setValue(e.target.checked)} />
    </div>
  </div>
  )
};

export default MotionInput
