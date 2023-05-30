var Geometry = {
  _Eps: 1e-5,
};

Geometry.Vector = function (x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
};

Geometry.Vector.prototype = {
  length: function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },
  normalize: function () {
    var length = this.length();
    if (length <= Geometry._Eps) return;

    this.x /= length;
    this.y /= length;
    this.z /= length;
  },
};

/**
 * Transposes a 2-dim Array
 *
 * @param {Array} a - 3x3 matrix
 *
 * @returns {Array} transposed a
 */
Geometry.transpose3x3Matrix = function (a) {
  var t = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  t[0][0] = a[0][0];
  t[0][1] = a[1][0];
  t[0][2] = a[2][0];

  t[1][0] = a[0][1];
  t[1][1] = a[1][1];
  t[1][2] = a[2][1];

  t[2][0] = a[0][2];
  t[2][1] = a[1][2];
  t[2][2] = a[2][2];

  return t;
};

/**
 * Dot multiplication of a 3 by 3 and a 3 by 1 array
 *
 * @returns {Array} 3 by 1 array
 */
Geometry.dot3x3and3x1 = function (a, b) {
  var rs = [];

  rs[0] = a[0][0] * b[0] + a[0][1] * b[1] + a[0][2] * b[2];
  rs[1] = a[1][0] * b[0] + a[1][1] * b[1] + a[1][2] * b[2];
  rs[2] = a[2][0] * b[0] + a[2][1] * b[1] + a[2][2] * b[2];

  return rs;
};

/**
 * Mulitplies each array element in a with the scalar s
 *
 * @param {Array} a - array/vector with 3 elements
 * @param {Number} s - scalar
 *
 * @returns {Array}
 */
Geometry.multiplyArrayWithScalar = function (a, s) {
  return [a[0] * s, a[1] * s, a[2] * s];
};

/**
 * Divides each array element in a by scalar s
 *
 * @param {Array} a - array/vector with 3 elements
 * @param {Number} s - scalar
 *
 * @returns {Array}
 */
Geometry.divideArrayWithScalar = function (a, s) {
  return [a[0] / s, a[1] / s, a[2] / s];
};

// Some useful defaults for the orientation calculations
Geometry.Defaults = {};
Geometry.Defaults.O = [0, 0, 0]; // originm (0, 0, 0)
Geometry.Defaults.X = [1, 0, 0]; // x mask
Geometry.Defaults.Y = [0, 1, 0]; // y mask
Geometry.Defaults.Z = [0, 0, 1]; // z mask

Geometry.Defaults.NORTH = Geometry.multiplyArrayWithScalar(
  Geometry.Defaults.X,
  0.33,
);

// Gravity vector
Geometry.Defaults.GRAVITY = Geometry.Defaults.Z;

/**
 * Constrain/clamp a given value to upper and lower limit
 */
Geometry.clamp = function (value, min_value, max_value) {
  var clampVal = Math.min(max_value, Math.max(min_value, value));
  return clampVal;
};

/**
 * Converts degrees to radians
 *
 * @param {Number|Array} deg - number or vector array (3 elements)
 *
 * @returns {Number|Array} depends on the deg param
 */
Geometry.degToRad = function (deg) {
  if (deg instanceof Array) {
    return [
      (deg[0] * Math.PI) / 180,
      (deg[1] * Math.PI) / 180,
      (deg[2] * Math.PI) / 180,
    ];
  }
  return (deg * Math.PI) / 180;
};

/**
 * Converts radians to degrees
 *
 * @param {Number|Array} rad - number or vector array (3 elements)
 *
 * @returns {Number|Array} depends on the rad param
 */
Geometry.radToDeg = function (rad) {
  if (rad instanceof Array) {
    return [
      (rad[0] * 180) / Math.PI,
      (rad[1] * 180) / Math.PI,
      (rad[2] * 180) / Math.PI,
    ];
  }
  return (rad * 180) / Math.PI;
};

export { Geometry };
