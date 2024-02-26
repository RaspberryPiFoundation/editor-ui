import { defaultMZCriteria } from "./DefaultMZCriteria";

export const defaultHumidity = 45;
export const defaultPressure = 1013;
export const defaultTemperature = 13;

export const defaultSenseHatConfig = {
  emit: () => {}, // Overridden by FlightCase.jsx
  colour: "#FF00A4",
  gamma: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
  ],
  low_light: false,
  motion: false,
  mz_criteria: { ...defaultMZCriteria },
  pixels: new Array(64).fill([0, 0, 0]),
  rtimu: {
    pressure: [1, defaultPressure + Math.random() - 0.5] /* isValid, pressure*/,
    temperature: [
      1,
      defaultTemperature + Math.random() - 0.5,
    ] /* isValid, temperature */,
    humidity: [
      1,
      defaultHumidity + Math.random() - 0.5,
    ] /* isValid, humidity */,
    gyro: [0, 0, 0] /* all 3 gyro values */,
    accel: [0, 0, 0] /* all 3 accel values */,
    compass: [0, 0, 33] /* all compass values */,
    raw_orientation: [0, 90, 0],
  },
  sensestick: {
    _eventQueue: [],
    off: () => {},
    once: () => {},
  },
  start_motion_callback: () => {},
  stop_motion_callback: () => {},
};
