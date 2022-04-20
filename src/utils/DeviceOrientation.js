/**
 * Device orientation for rotations
 *
 * @param {Number} pitch
 * @param {Number} roll
 * @param {Number} yaw
 * @param {String} css3 matrix3d string
 */

export default class DeviceOrientation {
  constructor(pitch, roll, yaw, matrix) {
    this.pitch = pitch;
    this.roll = roll;
    this.yaw = yaw;
    this.matrix = matrix;
  }
  /**
         * Return as array with [x, y, z]
         */
  asArray() {
    return [this.roll, this.pitch, this.yaw];
  }
}
