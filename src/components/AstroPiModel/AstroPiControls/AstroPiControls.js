import Input from './Input';
import SliderInput from './SliderInput';
import '../AstroPiModel.scss';

const AstroPiControls = (props) => {
  const { name, label, type, defaultValue} = props;

  return (
    <div id="sense-hat-sensor-controls-container" className="top hide-for-snapshot">
      <div className="controls-container">
        <SliderInput name="temperature" unit="°C" min={-40} max={120} defaultValue={13} iconClass="wi wi-thermometer" />
        <SliderInput name="pressure" unit="hPa" min={260} max={1260} defaultValue={1013} iconClass="wi wi-barometer" />
        <SliderInput name="humidity" unit="%" min={0} max={100} defaultValue={45} iconClass="wi wi-humidity" />
      </div>
    
      <div className="controls-container motion-colour">
        <Input name="motion" label="Motion" type="checkbox" defaultValue={false} />
        <Input name="colour" label="Colour" type="color" defaultValue="#000000" />
      </div>
    </div>
  )
};

export default AstroPiControls
