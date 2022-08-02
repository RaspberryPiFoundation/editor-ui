/**
 * Internal SenseHat Module for reading and writing values from
 * JavaScript World to the Python World. This modules set ups
 * the commmunication and allows to read and write pixels. If the
 * "Sk.sense_hat_emit" config is present, we emit events when
 * values are changed: Python -> JavaScript
 */
 var $builtinmodule = function (name) {
  var mod = {};

  function checkNumberAndReturn(val) {
      var parsed = parseFloat(val);
      // only numbers/floats are okay
      var isValid = !isNaN(parsed) && isFinite(val);
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
  }

  mod.init = new Sk.builtin.func(function () {
      if (Sk.sense_hat_emit) {
          Sk.sense_hat_emit('init');
      }
  });

  // _fb_device specific methods
  mod.setpixel = new Sk.builtin.func(function (index, value) {
      Sk.sense_hat.mz_criteria.usedLEDs = true
      var _index;
      var _value;

      if (!Sk.builtin.checkIterable(value)) {
          throw new Sk.builtin.ValueError("'value' should be iterable")
      }

      for (var i in value.v) {
          if (!Sk.builtin.checkInt(value.v[i])) {
              throw new Sk.builtin.ValueError("'value' should be iterable of 'int'")
          }
      }

      _index = Sk.ffi.remapToJs(index);
      _value = Sk.ffi.remapToJs(value);

      try {
          Sk.sense_hat.pixels[_index] = _value;
      } catch (e) {
          throw new Sk.builtin.ValueError(e.message);
      }

      if (Sk.sense_hat_emit) {
          Sk.sense_hat_emit('setpixel', _index);
      }
  });

  mod.getpixel = new Sk.builtin.func(function (index) {
      var value;
      var _index;
      var _value;

      _index = Sk.ffi.remapToJs(index);

      try {
          _value = Sk.sense_hat.pixels[_index];
          value = Sk.ffi.remapToPy(_value); // should return a list
          //value = new Sk.builtin.list(value);
      } catch (e) {
          throw new Sk.builtin.ValueError(e.message);
      }

      return value;
  });

  mod.setpixels = new Sk.builtin.func(function (indexes, values) {
      if (Sk.ffi.remapToJs(indexes)) {
        Sk.sense_hat.mz_criteria.usedLEDs = true
      }
      _indexes = Sk.ffi.remapToJs(indexes);
      _values = Sk.ffi.remapToJs(values);
      try {
          Sk.sense_hat.pixels = _values;
      } catch (e) {
          throw new Sk.builtin.ValueError(e.message);
      }

      if (Sk.sense_hat_emit) {
          Sk.sense_hat_emit('setpixels', _indexes);
      }
  });

  mod.getpixels = new Sk.builtin.func(function () {
      var values;

      try {
          values = Sk.ffi.remapToPy(Sk.sense_hat.pixels); // should return a list
          values = new Sk.builtin.list(values);
      } catch (e) {
          throw new Sk.builtin.ValueError(e.message);
      }

      return values;
  });

  mod.getGamma = new Sk.builtin.func(function () {
      var gamma = Sk.ffi.remapToPy(Sk.sense_hat.gamma);
      return gamma;
  });

  mod.setGamma = new Sk.builtin.func(function (gamma) {
      // checks are made in fb_device.py
      var _gamma = Sk.ffi.remapToJs(gamma);
      Sk.sense_hat.gamma = _gamma;

      if (Sk.sense_hat_emit) {
          Sk.sense_hat_emit('setGamma');
      }
  });

  mod.setLowlight = new Sk.builtin.func(function (value) {
      var _value = Sk.ffi.remapToJs(value);

      Sk.sense_hat.low_light = _value;

      if (Sk.sense_hat_emit) {
          Sk.sense_hat_emit('changeLowlight', _value);
      }
  });

  // RTIMU stuff

  /**
   * 260 - 1260 hPa
   */
  mod.pressureRead = new Sk.builtin.func(function () {
      Sk.sense_hat.mz_criteria.readPressure = true
      var pyTemperature = Sk.misceval.callsim(mod.temperatureRead); // does the validation for us
      var jsTemperature = Sk.ffi.remapToJs(pyTemperature);

      var jsPressure; // object holding the parsed value

      if (!Sk.sense_hat.rtimu.pressure || Sk.sense_hat.rtimu.pressure.length !== 2) {
          // something was set wrong
          return Sk.ffi.remapToPy([].concat([0, -1], jsTemperature));
      }

      // check type of the temperature
      jsPressure = checkNumberAndReturn(Sk.sense_hat.rtimu.pressure[1]);

      // invalid value provided
      if (jsPressure.valid === false) {
          return Sk.ffi.remapToPy([].concat([0, -1], jsTemperature));
      }

      // now do some range checks
      if (jsPressure.value < 260 || jsPressure.value > 1260) {
          return Sk.ffi.remapToPy([].concat([0, jsPressure.value], jsTemperature));
      }

      return Sk.ffi.remapToPy([].concat([1, jsPressure.value], jsTemperature));
  });

  /**
   * >= 0%
   */
  mod.humidityRead = new Sk.builtin.func(function () {
      Sk.sense_hat.mz_criteria.readHumidity = true
      var pyTemperature = Sk.misceval.callsim(mod.temperatureRead); // does the validation for us
      var jsTemperature = Sk.ffi.remapToJs(pyTemperature);

      var jsHumidity;

      if (!Sk.sense_hat.rtimu.humidity || Sk.sense_hat.rtimu.humidity.length !== 2) {
          // something was set wrong
          return Sk.ffi.remapToPy([].concat([0, -1], jsTemperature));
      }

      // check type of the temperature
      jsHumidity = checkNumberAndReturn(Sk.sense_hat.rtimu.humidity[1]);

      // invalid value provided
      if (jsHumidity.valid === false) {
          return Sk.ffi.remapToPy([].concat([0, -1], jsTemperature));
      }

      // now do some range checks
      if (jsHumidity.value < 0) {
          return Sk.ffi.remapToPy([].concat([0, jsHumidity.value], jsTemperature));
      }

      return Sk.ffi.remapToPy([].concat([1, jsHumidity.value], jsTemperature));
  });

  /**
   * Temperature Range: -40 to +120 degrees celsius
   */
  mod.temperatureRead = new Sk.builtin.func(function () {
      Sk.sense_hat.mz_criteria.readTemperature = true
      var jsTemperature;

      if (!Sk.sense_hat.rtimu.temperature || Sk.sense_hat.rtimu.temperature.length !== 2) {
          // something was set wrong
          return Sk.ffi.remapToPy([0, -1]);
      }

      // check type of the temperature
      var jsTemperature = checkNumberAndReturn(Sk.sense_hat.rtimu.temperature[1]);

      // invalid value provided
      if (jsTemperature.valid === false) {
          return Sk.ffi.remapToPy([0, -1]);
      }

      // now do some range checks
      if (jsTemperature.value < -40 || jsTemperature.value > 120) {
          return Sk.ffi.remapToPy([0, jsTemperature.value]); // invalid
      }

      return Sk.ffi.remapToPy([1, jsTemperature.value]);
  });

  /**
   * Colour
   */

   function hex2rgb(hex) {
    return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
  }

  mod.colourRead = new Sk.builtin.func(function () {
      Sk.sense_hat.mz_criteria.readColour = true
      return Sk.ffi.remapToPy(hex2rgb(Sk.sense_hat.colour));
  });

  /**
   * Motion
   */
  mod.motionRead = new Sk.builtin.func(function () {
    return Sk.ffi.remapToPy(Sk.sense_hat.motion);
  });

  /**
   * Sets start motion callback
   */
  mod._start_motion = new Sk.builtin.func(function(callback) {
    if (!(callback instanceof Sk.builtin.none)) {
      Sk.sense_hat.start_motion_callback = () => {Sk.misceval.callsimAsync(null, callback)};
    }
  });

  /**
   * Sets stop motion callback
   */
  mod._stop_motion = new Sk.builtin.func(function(callback) {
    if (!(callback instanceof Sk.builtin.none)) {
      Sk.sense_hat.stop_motion_callback = () => {Sk.misceval.callsimAsync(null, callback)};
    }
  });

  mod.fusionPoseRead = new Sk.builtin.func(function () {
      var fusionPose = Sk.ffi.remapToPy(Sk.sense_hat.rtimu.raw_orientation.map(x=>x*Math.PI/180));

      return fusionPose;
  });

  mod.accelRead = new Sk.builtin.func(function () {
      var accel = Sk.ffi.remapToPy(Sk.sense_hat.rtimu.accel);

      return accel;
  });

  mod.compassRead = new Sk.builtin.func(function () {
      var compass = Sk.ffi.remapToPy(Sk.sense_hat.rtimu.compass);

      return compass;
  });

  mod.headingRead = new Sk.builtin.func(function () {
      /* Returns tilt-compensated magnetometer heading in radians */
      /* Note: RTIMULib calculates a moving average. This gives an instant reading */

      // Accelerometer's roll and pitch, used for compensation
      var x, y;
      x = Sk.sense_hat.rtimu.raw_orientation[0]; // roll
      y = Sk.sense_hat.rtimu.raw_orientation[1]; // pitch

      // Compass raw values in microteslas
      var mx, my, mz;
      mx = Sk.sense_hat.rtimu.compass[0];
      my = Sk.sense_hat.rtimu.compass[1];
      mz = Sk.sense_hat.rtimu.compass[2];

      // Tilt compensation for Tait-Bryan XYZ convention
      // Formulas here: https://dev.widemeadows.de/2014/01/24/to-tilt-compensate-or-not-to-tilt-compensate/
      var phi, theta, mag_y, mag_x, jsheading, heading;
      phi = x;
      theta = y;

      // Remap magnetometer values to the horizontal plane and determine yaw (aka heading)
      mag_x = mx * Math.cos(theta) + my * Math.sin(phi) * Math.sin(phi) + mz * Math.cos(phi) * Math.sin(theta);
      mag_y = my * Math.cos(phi) - mz * Math.sin(phi);
      jsheading = Math.atan2(-mag_y, mag_x);

      // Remap radian value to Skulpt and return
      heading = Sk.ffi.remapToPy(jsheading);
      return heading;
  });

  mod.gyroRead = new Sk.builtin.func(function () {
      var gyro = Sk.ffi.remapToPy(Sk.sense_hat.rtimu.gyro);

      return gyro;
  });

  /********************************************************/
  /* SenseStick specific functions. Commented out until we have a means of inputting
  /* sense stick events and can be made to work with the web component
  /*
  /*
   **/

  /**
   * Named InputEvent tuple
   */
  // var input_event_fields = {
  //     "timestamp": "",
  //     "direction": "",
  //     "action": "",
  // };
  // var input_event_f = Sk.builtin.make_structseq('SenseStick', 'InputEvent', input_event_fields);
  // mod.InputEvent = Sk.builtin.make_structseq('SenseStick', 'InputEvent', input_event_fields);

  mod._wait = new Sk.builtin.func(function (timeout) {
    throw new Error("NotImplementedError")
      // var _timeout;
      // if (!timeout || timeout instanceof Sk.builtin.none) {
      //     _timeout = null;
      // } else if (Sk.builtin.checkNumber(timeout)) {
      //     _timeout = Sk.ffi.remapToJs(timeout);
      // }

      // var timeoutHandle;
      // var hasEvent = false;
      // var susp = new Sk.misceval.Suspension();
      // susp.resume = function () {
      //     // Should the post image get stuff go here??
      //     if (susp.data["error"]) {
      //         if (susp.data.error === 'KeyboardInterrupt') {
      //             throw new Error('KeyboardInterrupt');
      //         } else {
      //             throw new Sk.builtin.IOError('SenseStickDevice Error');
      //         }
      //     }
      //     return Sk.builtin.bool(hasEvent);
      // };
      // susp.data = {
      //     type: "Sk.promise",
      //     promise: new Promise(function (resolve, reject) {
      //         // Listen to new one, once
      //         function handleKeyInput (event, inputData) {
      //             // Clear timeout
      //             if (timeoutHandle) {
      //                 window.clearTimeout(timeoutHandle);
      //             }

      //             if (inputData.type === 'keyboardinterrupt') {
      //                 reject('KeyboardInterrupt');
      //             }

      //             hasEvent = true; // Set return value
      //             resolve();
      //         }

      //         if (Sk.sense_hat.sensestick._eventQueue.length > 0) {
      //             hasEvent = true;
      //             resolve();
      //         } else {
      //             Sk.sense_hat.sensestick.once('sensestick.input', handleKeyInput);

      //             if (_timeout != null) {
      //                 timeoutHandle = setTimeout(function() {
      //                     Sk.sense_hat.sensestick.off('sensestick.input', handleKeyInput);
      //                     hasEvent = false; // Timeout passed before callback occured
      //                     resolve()
      //                 }, _timeout * 1000);
      //             }
      //         }
      //     })
      // };
      // return susp;
  });

  mod._waitmotion = new Sk.builtin.func(function (timeout, motion) {
    Sk.sense_hat.mz_criteria.noInputEvents = false
    throw new Error("NotImplementedError")
      // var _timeout;
      // if (!timeout || timeout instanceof Sk.builtin.none) {
      //     _timeout = null;
      // } else if (Sk.builtin.checkNumber(timeout)) {
      //     _timeout = Sk.ffi.remapToJs(timeout);
      // }
      // var _motion =  Sk.ffi.remapToJs(motion);
      // var timeoutHandle;
      // var hasEvent = false;
      // var susp = new Sk.misceval.Suspension();
      // susp.resume = function () {
      //     if (susp.data["error"]) {
      //         console.log(susp.data)
      //         throw new Error('KeyboardInterrupt');
      //     }
      //     return Sk.builtin.bool(hasEvent);
      // };
      // susp.data = {
      //     type: "Sk.promise",
      //     promise: new Promise(function (resolve, reject) {
      //         // Listen to new one, once
      //         function handleMotionChange (event, inputData) {
      //             // Clear timeout
      //             if (timeoutHandle) {
      //                 window.clearTimeout(timeoutHandle);
      //             }
      //             if (typeof(inputData) != "undefined" && inputData.type === 'interrupt') {
      //                 reject('interrupt');
      //             }
      //             hasEvent = true; // Set return value
      //             document.getElementById( "sense_hat_motion" ).removeEventListener( "change",  handleInput);
      //             resolve();
      //         }

      //         if(Sk.sense_hat.motion == _motion){
      //             hasEvent = true;
      //             resolve();
      //         } else {
      //             document.getElementById( "sense_hat_motion" ).addEventListener( "change",  handleMotionChange);
      //             if (_timeout != null) {
      //                 timeoutHandle = setTimeout(function() {
      //                   document.getElementById( "sense_hat_motion" ).removeEventListener( "change",  handleMotionChange);
      //                     hasEvent = false; // Timeout passed before callback occured
      //                     resolve()
      //                 }, _timeout * 1000);
      //             }
      //         }
      //     })
      // };
      // return susp;
  });

  mod._inspectFunction = new Sk.builtin.func(function (func) {
    throw new Error("NotImplementedError")
      // //var kwargs = false;
      // var argsLength = 0;

      // if (func.im_self && func.im_func) {
      //     //kwargs = func.im_func.func_code["co_kwargs"] != null;
      //     argsLength = func.im_func.func_code.length - 1; // -1 for the self
      // } else {
      //     //kwargs = func.func_code["co_kwargs"] != null;
      //     argsLength = func.func_code.length;
      // }

      // return Sk.builtin.int_(argsLength);
  });

  /**
   * Removes the event handler for simulating threading
   */
  mod._stop_stick_thread = new Sk.builtin.func(function() {
    throw new Error("NotImplementedError")
      // if (Sk.sense_hat.sensestick._threadHandler != null) {
      //     Sk.sense_hat.sensestick.off('sensestick.input', _threadHandler);
      // }
  });

  /**
   * Adds the event handler for simulating threading for the SenseStick callbacks
   */
  mod._start_stick_thread = new Sk.builtin.func(function(callback) {
    throw new Error("NotImplementedError")
      // function handleKeyInput (event, inputData) {
      //     // Store event in the internal queue
      //     // This may cause, that we are not able to call our interrupt suspension handler
      //     Sk.misceval.callsimAsync(null, callback);
      // }

      // Sk.sense_hat.sensestick.on('sensestick.input', handleKeyInput);
      // Sk.sense_hat.sensestick._threadHandler = handleKeyInput; // Callback and save closure
  });

  mod._read = new Sk.builtin.func(function () {
    throw new Error("NotImplementedError")
      // var inputEvent;
      // var susp = new Sk.misceval.Suspension();
      // susp.resume = function () {
      //     // We need the 2nd check for the keyboardinterrupt when we push this from the
      //     // watching thread
      //     if (susp.data["error"] || inputEvent.type === 'keyboardinterrupt') {
      //         if (susp.data.error === 'KeyboardInterrupt' || inputEvent.type === 'keyboardinterrupt') {
      //             // throwing now
      //             throw new Error('KeyboardInterrupt');
      //         } else {
      //             throw new Sk.builtin.IOError('SenseStickDevice Error');
      //         }
      //     }

      //     var tup = new Sk.builtin.tuple([
      //         Sk.builtin.int_(inputEvent.timestamp),
      //         Sk.builtin.int_(inputEvent.key),
      //         Sk.builtin.int_(inputEvent.state),
      //         Sk.builtin.int_(inputEvent.type)
      //     ]);
      //     return tup;
      // };
      // susp.data = {
      //     type: "Sk.promise",
      //     promise: new Promise(function (resolve, reject) {
      //         // Read from internal eventQueue
      //         if (Sk.sense_hat.sensestick._eventQueue.length > 0) {
      //             inputEvent = Sk.sense_hat.sensestick._eventQueue.shift();
      //             resolve();
      //         } else {
      //             // add eventlistener
      //             Sk.sense_hat.sensestick.once('sensestick.input', function (event, inputData) {
      //                 // Interrupt handling, so that we do not need to wait until the users inputs something
      //                 if (inputData.type === 'keyboardinterrupt') {
      //                     reject('KeyboardInterrupt');
      //                 }

      //                 inputEvent = inputEvent = Sk.sense_hat.sensestick._eventQueue.shift();
      //                 resolve();
      //             });
      //         }
      //     })
      // };
      // return susp;
  });

  return mod;
};
