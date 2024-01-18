/**
 * Internal SenseHat Module for reading and writing values from
 * JavaScript World to the Python World. This modules set ups
 * the commmunication and allows to read and write pixels.
 */

export const config = {
  pyodide: null,
  emit: () => {},
  colour: "#FF00A4",
  gamma: new Array(32).fill(0),
  pixels: new Array(64).fill([0, 0, 0]),
  low_light: false,
  motion: false,
  mz_criteria: {
    duration: null,
    noInputEvents: true,
    readColour: false,
    readHumidity: false,
    readPressure: false,
    readTemperature: false,
    usedLEDs: false,
  },
  rtimu: {
    pressure: [1, 1013 + Math.random() - 0.5],
    temperature: [1, 13 + Math.random() - 0.5],
    humidity: [1, 45 + Math.random() - 0.5],
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

const raisePythonError = (errorType, message) => {
  if (config.pyodide) {
    const escaped = message.replaceAll('"', '\\"');
    config.pyodide.runPython(`raise ${errorType}("${escaped}")`);
  } else {
    throw new Error(`${errorType}: ${message}`);
  }
};

const toJs = (val) => val?.toJs ? val.toJs() : val;
const isIterable = (val) => !!val?.[Symbol.iterator];
const isInteger = (val) => val === parseInt(val, 10);

const checkNumberAndReturn = (val) => {
  const parsed = parseFloat(val);
  // only numbers/floats are okay
  const isValid = !isNaN(parsed) && isFinite(val);
  if (isValid) {
    return {
      value: parsed,
      valid: true
    }
  }

  // invalid number, return -1
  return {
    value: -1,
    valid: false
  }
};

export const init = () => {
  config.emit('init');
};

// _fb_device specific methods
export const setpixel = (index, value) => {
  config.mz_criteria.usedLEDs = true

  const _index = toJs(index);
  const _value = toJs(value);

  if (!isIterable(_value)) {
    raisePythonError("ValueError", "'value' should be iterable")
  }

  for (let val of _value) {
    if (!isInteger(val)) {
      raisePythonError("ValueError", "'value' should be iterable of 'int'")
    }
  }

  try {
    config.pixels[_index] = _value;
  } catch (e) {
    raisePythonError("ValueError", e.message);
  }

  config.emit('setpixel', _index);
};

export const getpixel = (index) => {
  const _index = toJs(index);

  try {
    return config.pixels[_index];
  } catch (e) {
    raisePythonError("ValueError", e.message);
  }
};

export const setpixels = (indexes, values) => {
  const _indexes = toJs(indexes);
  const _values = toJs(values);

  if (_indexes) {
    config.mz_criteria.usedLEDs = true
  }

  try {
    config.pixels = _values;
  } catch (e) {
    raisePythonError("ValueError", e.message);
  }

  config.emit('setpixels', _indexes);
};

export const getpixels = () => {
  return config.pixels;
};

export const getGamma = () => {
  return config.gamma;
};

export const setGamma = (gamma) => {
  // checks are made in fb_device.py
  config.gamma = toJs(gamma);
  config.emit('setGamma');
};

export const setLowlight = (value) => {
  const _value = toJs(value);

  config.low_light = toJs(_value);
  config.emit('changeLowlight', _value);
};

// RTIMU stuff

/**
 * 260 - 1260 hPa
 */
export const pressureRead = () => {
  config.mz_criteria.readPressure = true
  const temperature = temperatureRead(); // does the validation for us

  if (!config.rtimu.pressure || config.rtimu.pressure.length !== 2) {
    // something was set wrong
    return [].concat([0, -1], temperature);
  }

  // check type of the temperature
  const { valid, value } = checkNumberAndReturn(config.rtimu.pressure[1]);

  // invalid value provided
  if (!valid) {
    return [].concat([0, -1], temperature);
  }

  // now do some range checks
  if (value < 260 || value > 1260) {
    return [].concat([0, value], temperature);
  }

  return [].concat([1, value], temperature);
};

/**
 * >= 0%
 */
export const humidityRead = () => {
  config.mz_criteria.readHumidity = true
  const temperature = temperatureRead(); // does the validation for us

  if (!config.rtimu.humidity || config.rtimu.humidity.length !== 2) {
    // something was set wrong
    return [].concat([0, -1], temperature);
  }

  // check type of the temperature
  const { valid, value } = checkNumberAndReturn(config.rtimu.humidity[1]);

  // invalid value provided
  if (!valid) {
    return [].concat([0, -1], temperature);
  }

  // now do some range checks
  if (value < 0) {
    return [].concat([0, value], temperature)
  }

  return [].concat([1, value], temperature);
};

/**
 * Temperature Range: -40 to +120 degrees celsius
 */
export const temperatureRead = () => {
  config.mz_criteria.readTemperature = true

  if (!config.rtimu.temperature || config.rtimu.temperature.length !== 2) {
    // something was set wrong
    return [0, -1];
  }

  // check type of the temperature
  const { valid, value } = checkNumberAndReturn(config.rtimu.temperature[1]);

  // invalid value provided
  if (!valid) {
    return [0, -1];
  }

  // now do some range checks
  if (value < -40 || value > 120) {
    return [0, value];
  }

  return [1, value];
};

/**
 * Colour
 */

const hex2rgb = (hex) => (
  ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0]
);

export const colourRead = () => {
  config.mz_criteria.readColour = true
  return hex2rgb(config.colour);
};

/**
 * Motion
 */
export const motionRead = () => {
  return config.motion;
};

/**
 * Sets start motion callback
 */
export const _start_motion = (callback) => {
  if (callback) { config.start_motion_callback = callback; }
};

/**
 * Sets stop motion callback
 */
export const _stop_motion = (callback) => {
  if (callback) { config.stop_motion_callback = callback; }
};

export const fusionPoseRead = () => {
  return config.rtimu.raw_orientation.map(x=> x * Math.PI / 180);
};

export const accelRead = () => {
  return config.rtimu.accel;
};

export const compassRead = () => {
  return config.rtimu.compass;
};

export const headingRead = () => {
  /* Returns tilt-compensated magnetometer heading in radians */
  /* Note: RTIMULib calculates a moving average. This gives an instant reading */

  // Accelerometer's roll and pitch, used for compensation
  const x = config.rtimu.raw_orientation[0]; // roll
  const y = config.rtimu.raw_orientation[1]; // pitch

  // Compass raw values in microteslas
  const mx = config.rtimu.compass[0];
  const my = config.rtimu.compass[1];
  const mz = config.rtimu.compass[2];

  // Tilt compensation for Tait-Bryan XYZ convention
  // Formulas here: https://dev.widemeadows.de/2014/01/24/to-tilt-compensate-or-not-to-tilt-compensate/
  const phi = x;
  const theta = y;

  // Remap magnetometer values to the horizontal plane and determine yaw (aka heading)
  const mag_x = mx * Math.cos(theta) + my * Math.sin(phi) * Math.sin(phi) + mz * Math.cos(phi) * Math.sin(theta);
  const mag_y = my * Math.cos(phi) - mz * Math.sin(phi);
  const heading = Math.atan2(-mag_y, mag_x);

  return heading;
};

export const gyroRead = () => {
  return config.rtimu.gyro;
};

/********************************************************/
/* SenseStick specific functions. Commented out until we have a means of inputting
/* sense stick events and can be made to work with the web component
/*
/*
 **/

export const _wait = (timeout) => {
  raisePythonError("NotImplementedError", "_wait");
};

export const _waitmotion = (timeout, motion) => {
  config.mz_criteria.noInputEvents = false
  raisePythonError("NotImplementedError", "_waitmotion");
};

export const _inspectFunction = (func) => {
  raisePythonError("NotImplementedError", "_inspectFunction");
};

/**
 * Removes the event handler for simulating threading
 */
export const _stop_stick_thread = () => {
  raisePythonError("NotImplementedError", "_stop_stick_thread");
};

/**
 * Adds the event handler for simulating threading for the SenseStick callbacks
 */
export const _start_stick_thread = (callback) => {
  raisePythonError("NotImplementedError", "_start_stick_thread");
};

export const _read = () => {
  raisePythonError("NotImplementedError", "_read");
};
