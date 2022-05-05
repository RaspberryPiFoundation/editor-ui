import { Geometry } from './Geometry';
import Sk from 'skulpt';

function getTimestamp () {
  var time = Date.now(); // millis
  var timestamp = time * 1e+3; // milliseconds
  return timestamp;
}

/**
* Update call for periodically updating our internal sensehat data object.
*
* The UI events and the polling are async and therefore we can "simulate"
* even changes when the user does not rotate.
*/
export function updateRTIMU() {
// Retriev the previous timestamp
  var oldTimestamp = Sk.sense_hat.rtimu.timestamp;

  // Special case, if we call this function the first time and
  // the window.sense_hat.rtimu object has not been initialized
  if (oldTimestamp === null || oldTimestamp === undefined) {
    oldTimestamp = getTimestamp();
  }

  // Get a new timestamp and calc the delta
  var newTimestamp = getTimestamp();
  var timeDelta = (newTimestamp - oldTimestamp) / 1e+6;

  // Special case, when the delta is 0, everything gets null
  // Using a sane interval should avoid this case
  // Keeping it for now
  //console.info("timeDelta", timeDelta);
  if (timeDelta === 0) {
    timeDelta = 1;
  }

  // Get a copy of the old orientation in degrees (fusionPose is in radians)
  var oldOrientation = Sk.sense_hat.rtimu.raw_old_orientation;

  if (oldOrientation === null || oldOrientation === undefined) {
    oldOrientation = [0,90,0];
  }
  var newOrientation = Geometry.degToRad(Sk.sense_hat.rtimu.raw_orientation);

  // Gyro is the rate of change of the orientation
  // Actually it is: gyro = (newOrientation - oldOrientation) / timeDelta
  var _gyro = [
    newOrientation[0] - oldOrientation[0],
    newOrientation[1] - oldOrientation[1],
    newOrientation[2] - oldOrientation[2]
  ];

  // Divide the orientation delta by the time delta
  _gyro = Geometry.divideArrayWithScalar(_gyro, timeDelta);

  // Now we need x, y, z in radians
  var x = newOrientation[0]; // deOr.roll;
  var y = newOrientation[1]; // deOr.pitch;
  var z = newOrientation[2]; // deOr.yaw;

  // Calculate values for the rotation matrix
  var c1 = Math.cos(z);
  var c2 = Math.cos(y);
  var c3 = Math.cos(x);
  var s1 = Math.sin(z);
  var s2 = Math.sin(y);
  var s3 = Math.sin(x);

  // Rotation Matrix for the orientation (again euler angles)
  var R = [
    [c1 * c2, c1 * s2 * s3 - c3 * s1, s1 * s3 + c1 * c3 * s2],
    [c2 * s1, c1 * c3 + s1 * s2 * s3, c3 * s1 * s2 - c1 * s3],
    [-s2,     c2 * s3,                c2 * c3],
  ]

  // Transposed R matrix
  var T = Geometry.transpose3x3Matrix(R);

  // Acceleration is the transposed rotation matrix dot multiplied with gravity vector
  var _accel = Geometry.dot3x3and3x1(T, Geometry.Defaults.GRAVITY);

  // Compass is tranposed rotation matrix dot multiplied with the north vector
  var _compass = Geometry.dot3x3and3x1(T, Geometry.Defaults.NORTH);

  // store current orient to access it alter as old orient
  Sk.sense_hat.rtimu.raw_old_orientation = newOrientation;

  // update fusionPose (which is the orientation) and the timestamp values
  Sk.sense_hat.rtimu.fusionPose = newOrientation;
  Sk.sense_hat.rtimu.timestamp = newTimestamp;

  /* Update the internal rtimu data object */

  // The values are Floats representing the angle of the axis in degrees
  // _accel = perturb(_accel, 0.1);
  Sk.sense_hat.rtimu.accel = [
    Geometry.clamp(_accel[0], -8, 8),
    Geometry.clamp(_accel[1], -8, 8),
    Geometry.clamp(_accel[2], -8, 8)
  ];

  // _gyro = perturb(_gyro, .5);
  // radians per second
  Sk.sense_hat.rtimu.gyro = [
    _gyro[0],
    _gyro[1],
    _gyro[2],
  ];


  // _compass = perturb(_compass, .01);
  // multiply with 100 -> from Gauss to microteslas (µT)
  Sk.sense_hat.rtimu.compass = [
    _compass[0] * 100,
    _compass[1] * 100,
    _compass[2] * 100,
  ];
}

export function resetModel(event) {
  event.preventDefault();

    var x = 0
      , y = 0
      , z = 0;
    window.rotatemodel(Geometry.degToRad(x), Geometry.degToRad(y), Geometry.degToRad(z));
}
