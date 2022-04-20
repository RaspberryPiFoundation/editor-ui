import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { useEffect } from 'react';
import Sk from 'skulpt';

const Simulator = (props) => {

    useEffect(()=> {

      // low light settings
      var lowLightLimit     = 8;
      var defaultLightLimit = 47;
      var lightThreshold    = defaultLightLimit;

      function zeroPad(num) {
        return num.toString().length === 2 ? num : "0" + num;
      }

      Sk.sense_hat_emit   = function(event, data) {
        var offbright = 0.4 // opacity of LED off state - gives a whiteness that looks more real

          // minimum lit brightness, out of 255. LEDs won't get darker than this.
          // This should be roughly lighter than LED off state to avoid flash.
          , minBrightness = 180

          // RGB LEDs get a scaled brightness or 0 if they're below the threshold
          // Note: I believe this maxBrightness is what would need to change for low_light
          // It needs to be decently above minBrightness to allow for perceivable differences.
          , maxBrightness = 255

          // These default values should match the svg pixel stack's respective starting opacities
          , rled = 0
          , gled = 0
          , bled = 0
          , oled = 1
          , kled = 1

          , ledIndex, ledData, ledEnclosure, $led;

        if (event && event === 'setpixel') {
          // change the led
          ledIndex = data;
          ledData  = Sk.sense_hat.pixels[ledIndex];

          // Convert LED-RGB to RGB565 // and then to RGB555
          Sk.sense_hat.pixels[ledIndex] = [
            ledData[0] & ~7,
            ledData[1] & ~3,
            ledData[2] & ~7
          ];

          set_pixel(ledIndex, parseInt(ledData[0]*255), parseInt(ledData[1]*255), parseInt(ledData[2]*255));

        }
        else if (event && event === 'changeLowlight') {
          lightThreshold = data === true ? lowLightLimit : defaultLightLimit;
        }
        else if (event && event === 'setpixels') {
          set_pixels(data, Sk.sense_hat.pixels);
        }
      };


      var isDragging = false;
      var targetRotationX = 0.5;
      var targetRotationOnMouseDownX = 0;
      var targetRotationY = 0.2;
      var targetRotationOnMouseDownY = 0;
      var mouseX = 0;
      var mouseXOnMouseDown = 0;
      var mouseY = 0;
      var mouseYOnMouseDown = 0;
      var windowHalfX = window.innerWidth / 2;
      var windowHalfY = window.innerHeight / 2;
      var slowingFactor = 0.25;

      var senseHatNode = document.getElementById('sensehat-node')
      senseHatNode.innerHTML='';

      window.callback_move = null;
      window.set_onrotate   = function(func){
        window.callback_move = func;
      }
      
      var camera = new THREE.PerspectiveCamera( 25, 500 / 400, 1, 20000 );
      camera.position.set(0, 1.5, 0);

      var screen = new Array(8); 
      for (var i = 0; i < screen.length; i++) { 
          screen[i] = new Array(8); 
      } 

      // Load a Renderer
      var renderer = new THREE.WebGLRenderer( { antialias: true } );
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( 500, 400 );
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.setClearColor( 0xC5C5C3 );
      senseHatNode.appendChild(renderer.domElement);

      // Load 3D Scene
      var scene = new THREE.Scene();
      scene.background = new THREE.Color( 0xf9f9f9f );
      const environment = new RoomEnvironment();
      const pmremGenerator = new THREE.PMREMGenerator( renderer );
      scene.environment = pmremGenerator.fromScene( environment ).texture;

      const grid = new THREE.GridHelper( 500, 10, 0xffffff, 0xffffff );
      grid.material.opacity = 0.5;
      grid.material.depthWrite = false;
      grid.material.transparent = true;
      // scene.add( grid );

      // Load the Orbitcontroller
      var controls = new OrbitControls( camera, renderer.domElement );
      controls.enableRotate = false;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.enabled = false;
   
      // glTf Loader
      var loader = new GLTFLoader();     
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath( process.env.PUBLIC_URL+'/three/examples/js/libs/draco/' );
      loader.setDRACOLoader( dracoLoader );
    
      loader.load( process.env.PUBLIC_URL+'/models/raspi-compressed.glb', function ( gltf ) {         
          var object = gltf.scene;                
          gltf.scene.scale.set( 4, 4, 4 );               
          gltf.scene.position.x = 0;                   
          gltf.scene.position.y = 0;          
          gltf.scene.position.z = 0;              
          scene.add( gltf.scene );
          window.mod = gltf.scene;

          renderer.render(scene, camera)

          document.addEventListener( 'pointerup', function( event ) {
            // if ($('#canvas:hover').length <= 0)
            //   return;
            isDragging = false
          })
    
          document.addEventListener( 'pointerdown', function( event ) {
            // if ($('#canvas:hover').length <= 0)
            //   return;
            isDragging = true
            mouseXOnMouseDown = event.clientX - windowHalfX;
            targetRotationOnMouseDownX = targetRotationX;
            mouseYOnMouseDown = event.clientY - windowHalfY;
            targetRotationOnMouseDownY = targetRotationY;
          })
    
          senseHatNode.addEventListener( 'pointermove', moveit );
          window.finished3D = true
          window.rotatemodel = function(x, y, z){
            window.mod.rotation.x = x;
            window.mod.rotation.y = y;
            window.mod.rotation.z = z;
            renderer.render( scene, camera );
          }

          // var newMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});

          // for(var y=0;y<8;y++){
          //     for(var x=0;x<8;x++){
          //         var object = window.mod.getObjectByName("mesh_"+screen[y][x]+"_1");
          //         if(object != null){
          //             object.material = newMaterial
          //         }
          //     }
          // }
      });

      /*
          Uses drag code from:
          https://jsfiddle.net/MadLittleMods/n6u6asza/

          To rotate object, rather than rotating camera around object.  Wondering if there
          might be a more threejs solution?

          Note: Had to use pointer* events rather than mouse* events
      */
      var isDragging = false;
      var previousMousePosition = {
          x: 0,
          y: 0
      };

      function rotateAroundWorldAxis( object, axis, radians ) {
        // Changed this function from
        // the codepen version, so that it could rotate
        // on both axis.  Unsure currently why the the codepen code
        // didn't allow this with our model
        object.rotateOnWorldAxis(axis, radians)
      }

      function moveit(e){
        // if ($('#canvas:hover').length <= 0)
        //   return;
        mouseX = e.clientX - windowHalfX;
        targetRotationX = ( mouseX - mouseXOnMouseDown ) * 0.00025;
        mouseY = e.clientY - windowHalfY;
        targetRotationY = ( mouseY - mouseYOnMouseDown ) * 0.00025;
      
        if(isDragging) {
          rotateAroundWorldAxis(window.mod, new THREE.Vector3(0, 1, 0), targetRotationX);
          rotateAroundWorldAxis(window.mod, new THREE.Vector3(1, 0, 0), targetRotationY);
          if (window.callback_move != null) {
            window.callback_move(window.mod.rotation.x,window.mod.rotation.y,window.mod.rotation.y);
          }
          targetRotationY = targetRotationY * (1 - slowingFactor);
          targetRotationX = targetRotationX * (1 - slowingFactor);
          renderer.render( scene, camera );
          updateRTIMU();
        }
      }

      function set_pixel(ledIndex,r,g,b) {
        if(window.mod == null)
          return;
      
        var x = ledIndex % 8;
        var y = Math.floor(ledIndex / 8);
        var newMaterial = new THREE.MeshStandardMaterial({color: 'rgb('+r+','+g+','+b+')'});
        var object = window.mod.getObjectByName("circle"+x+"_"+(7-y)+"-1");
      
        if(object != null)
          object.material = newMaterial;
      
        renderer.render( scene, camera );
      }
      
      function set_pixels(indexes, pix) {
        if(window.mod == null)
          return;
      
        if(indexes == null)
          indexes = Array.from(Array(8*8).keys())
      
        var i = 0;
        for (const ledIndex of indexes){
          var x = ledIndex % 8;
          var y = Math.floor(ledIndex / 8);
          var newMaterial = new THREE.MeshStandardMaterial({color: 'rgb('+pix[i][0]+','+pix[i][1]+','+pix[i][2]+')'});
          var object = window.mod.getObjectByName("circle"+x+"_"+(7-y)+"-1");
          if(object != null)
            object.material = newMaterial;
          i += 1;
        }
        renderer.render( scene, camera );
      }
      

      // function toRadians(angle) {
      //     return angle * (Math.PI / 180);
      // }

      // function toDegrees(angle) {
      //     return angle * (180 / Math.PI);
      // }
      // ===========================================================================================================
      // Orientation stuff
      // TO DO: Decide whether to move this elsewhere and import

      var orientation_settings = ['pitch', 'roll', 'yaw', 'rotation_matrix', 'angle'];
      var orientation_settings_length = orientation_settings.length;

      var styles = window.getComputedStyle(document.documentElement, '')
        , prefix = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];

      if (prefix) {
        prefix = '-' + prefix + '-';
      }

      /**
       * Return a common timestamp in microseconds
       *
       * @returns {Number}
       */
      function getTimestamp () {
          var time = Date.now(); // millis
          var timestamp = time * 1e+3; // milliseconds
          return timestamp;
      }

      function roundAngle(angle) {
        if (angle < 0) {
          angle = angle + 360;
        }
        // round modulo 361 to get values between 0 and 360
        return (Math.round(angle * 10) / 10) % 361;
      }

      /**
       * Handles device orientation changes when a user drags the sense hat.
       *
       * Updates the sense hat position and the numerical readouts.
       *
       * @param {DeviceOrientation} deviceOrientation - changed position/angles
       */
      function deviceOrientationChange(deviceOrientation) {
        // store the new deviceOrientation on the rtimu object as [x,y,z]
        Sk.sense_hat.rtimu.raw_orientation = deviceOrientation.asArray();

        // var orientationValues = {
        //     pitch : roundAngle(deviceOrientation.pitch)
        //   , roll  : roundAngle(deviceOrientation.roll)
        //   , yaw   : roundAngle(deviceOrientation.yaw)
        //   , rotation_matrix : deviceOrientation.matrix
        // };

        // Update UI and hidden input values
        // var i;
        // var ui_name;
        // var setting_name;
        // var setting;

        // Notice: for loop with cached length is up to 70% faster than forEach (https://jsperf.com/for-vs-foreach/37)
        // for (i = 0; i < orientation_settings_length; i++) {
        //   setting      = orientation_settings[i];
        //   ui_name      = 'sense-hat-' + setting;
        //   setting_name = 'sense_hat_' + setting;

        //   // if ($('span.' + ui_name).length) {
        //   //   $('span.' + ui_name).html(orientationValues[setting]);
        //   // }

        //   $('#' + setting_name).val(orientationValues[setting]).change();
        // }
        var roll = document.getElementsByClassName('sense-hat-roll')[0]
        var pitch = document.getElementsByClassName('sense-hat-pitch')[0]
        var yaw = document.getElementsByClassName('sense-hat-yaw')[0]
        roll.innerText = Math.round(deviceOrientation.roll*10)/10
        pitch.innerText = Math.round(deviceOrientation.pitch*10)/10
        yaw.innerText = Math.round(deviceOrientation.yaw*10)/10
      }

      /**
       * Update call for periodically updating our internal sensehat data object.
       *
       * The UI events and the polling are async and therefore we can "simulate"
       * even changes when the user does not rotate.
       */
      function updateRTIMU() {
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

      /**
       * Perturbes an array/vector (x, y, z) with a given error and n iterations.
       *
       * @param {Array} arr - vector with 3 elements (x, y, z)
       * @param {Number} error - applied to the individual vector items
       * @param {Integer} n - iterations for calculating the mean over n drawn random numbers, default=10
       */
      function perturb(arr, error, n) {
        if (n == null) {
          n = 5;
        }

        var vals = [0, 0, 0];

        for (var i = 0; i < n; i++) {
          vals[0] += randomGaussian2(arr[0], error);
          vals[1] += randomGaussian2(arr[1], error);
          vals[2] += randomGaussian2(arr[2], error);
        }

        vals[0] /= n;
        vals[1] /= n;
        vals[2] /= n;

        return vals;
      }

      // http://blog.yjl.im/2010/09/simulating-normal-random-variable-using.html
      // https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform#Polar_form
      function _randomGaussian() {
        if (this.haveNextNextGaussian) {
          this.haveNextNextGaussian = false;
          return this.nextNextGaussian;
        }

        var v1, v2, s;
        do {
          v1 = 2 * Math.random() - 1; // between -1.0 and 1.0
          v2 = 2 * Math.random() - 1; // between -1.0 and 1.0
          s = v1 * v1 + v2 * v2;
        } while (s >= 1 || s === 0);

        var multiplier = Math.sqrt(-2 * Math.log(s) / s);
        this.nextNextGaussian = v2 * multiplier;
        this.haveNextNextGaussian = true;

        return v1 * multiplier;
      }

      /**
       * Draws a random sample from a normal distribution (0, 0.2)
       * and multiplicates with the given error.
       *
       * @param {Number} mean of the random sample result
       * @param {Number} error to apply
       * @param {Boolean} debug enables console output for inspection
       */
      function randomGaussian2(mean, error, debug) {
        var _randVal = 0.2 * _randomGaussian(); // mean + stdDev * rand with mean=0
        var randomGauss = mean + _randVal * error;

        // may output the drawn sample on the console
        if (debug) {
          console.info('mean: ', mean, _randVal, error, ' rg:', randomGauss);
        }

        return randomGauss;
      }

      // function randomGaussian (mean, error) {
      //   var _randVal = _randomGaussian();
      //   var randomGauss = mean + _randVal * error;

      //   var max = mean + error;
      //   var min = mean - error;
      //   return Math.min(Math.max(min, randomGauss), max);
      // }
      var Geometry = {
        _Eps: 1e-5
      };


      Geometry.Vector = function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
      }

      Geometry.Vector.prototype = {
        length: function() {
          return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },
        normalize: function() {
          var length = this.length();
          if (length <= Geometry._Eps)
            return;

          this.x /= length;
          this.y /= length;
          this.z /= length;
        }
      }

      /**
       * Transposes a 2-dim Array
       *
       * @param {Array} a - 3x3 matrix
       *
       * @returns {Array} transposed a
       */
      Geometry.transpose3x3Matrix = function(a) {
          var t = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

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
      }

      /**
       * Dot multiplication of a 3 by 3 and a 3 by 1 array
       *
       * @returns {Array} 3 by 1 array
       */
      Geometry.dot3x3and3x1 = function(a, b) {
          var rs = [];

          rs[0] = a[0][0]*b[0] + a[0][1] * b[1] + a[0][2] * b[2];
          rs[1] = a[1][0]*b[0] + a[1][1] * b[1] + a[1][2] * b[2];
          rs[2] = a[2][0]*b[0] + a[2][1] * b[1] + a[2][2] * b[2];

          return rs;
      }

      /**
       * Mulitplies each array element in a with the scalar s
       *
       * @param {Array} a - array/vector with 3 elements
       * @param {Number} s - scalar
       *
       * @returns {Array}
       */
      Geometry.multiplyArrayWithScalar = function(a, s) {
        return [
            a[0] * s,
            a[1] * s,
            a[2] * s
          ];
      }


      /**
       * Divides each array element in a by scalar s
       *
       * @param {Array} a - array/vector with 3 elements
       * @param {Number} s - scalar
       *
       * @returns {Array}
       */
      Geometry.divideArrayWithScalar = function(a, s) {
        return [
            a[0] / s,
            a[1] / s,
            a[2] / s
          ];
      }


      // Some useful defaults for the orientation calculations
      Geometry.Defaults = {};
      Geometry.Defaults.O = [0, 0, 0]; // originm (0, 0, 0)
      Geometry.Defaults.X = [1, 0, 0]; // x mask
      Geometry.Defaults.Y = [0, 1, 0]; // y mask
      Geometry.Defaults.Z = [0, 0, 1]; // z mask

      Geometry.Defaults.NORTH = Geometry.multiplyArrayWithScalar(Geometry.Defaults.X, 0.33);

      // Gravity vector
      Geometry.Defaults.GRAVITY = Geometry.Defaults.Z;

      /**
       * Constrain/clamp a given value to upper and lower limit
       */
      Geometry.clamp = function(value, min_value, max_value) {
          var clampVal = Math.min(max_value, Math.max(min_value, value))
          return clampVal;
      }

      /**
       * Converts degrees to radians
       *
       * @param {Number|Array} deg - number or vector array (3 elements)
       *
       * @returns {Number|Array} depends on the deg param
       */
      Geometry.degToRad =  function(deg) {
        if (deg instanceof Array) {
          return [
              deg[0] * Math.PI / 180,
              deg[1] * Math.PI / 180,
              deg[2] * Math.PI / 180
          ];
        }
        return deg * Math.PI / 180;
      }

      /**
       * Converts radians to degrees
       *
       * @param {Number|Array} rad - number or vector array (3 elements)
       *
       * @returns {Number|Array} depends on the rad param
       */
      Geometry.radToDeg = function(rad) {
        if (rad instanceof Array) {
          return [
              rad[0] * 180 / Math.PI,
              rad[1] * 180 / Math.PI,
              rad[2] * 180 / Math.PI
          ];
        }
        return rad * 180 / Math.PI;
      }

      /**
       * Device orientation for rotations
       *
       * @param {Number} pitch
       * @param {Number} roll
       * @param {Number} yaw
       * @param {String} css3 matrix3d string
       */
      function DeviceOrientation(pitch, roll, yaw, matrix) {
        this.pitch  = pitch;
        this.roll   = roll;
        this.yaw    = yaw;
        this.matrix = matrix;
      }

      /**
       * Return as array with [x, y, z]
       */
      DeviceOrientation.prototype.asArray = function() {
        return [this.roll, this.pitch, this.yaw];
      }

      /**
       * Initializes the device orientation handlers:
       *  - Handles 3D rotations of the sense hat
       *  - Calculates the position and view of the rotated sense hat
       */
      function initOrientation() {
        // $stage            = $('.orientation-stage');
        // $orientationLayer = $('.orientation-layer');
        var resetButton      = document.getElementById('orientation-reset-btn');
        // $enclosureToggle  = $('#enclosure-toggle');

        // if (TrinketIO.runtime('mission-zero')) {
        //   $('#enclosure-toggle-container').hide();
        // }

        // var i, setting_name;

        // for (i = 0; i < orientation_settings.length; i++) {
        //   setting_name = 'sense_hat_' + orientation_settings[i];

        //   $('#' + setting_name).data('skip-trigger', true);

          // if (typeof TrinketIO.runtime(setting_name) !== 'undefined') {
          //   $('#' + setting_name).val(TrinketIO.runtime(setting_name));
          //   TrinketIO.runtime(setting_name, undefined);
          // }
        // }

        // var pitch = $('#sense_hat_pitch').val();
        // var roll  = $('#sense_hat_roll').val();
        // var yaw   = $('#sense_hat_yaw').val();

        // var old_angle = parseInt($('#sense_hat_angle').val());
        // var matrix3d = $('#sense_hat_rotation_matrix').val();

        window.set_onrotate(function(){
          const x=window.mod.rotation.x;
          const y=window.mod.rotation.y;
          const z=window.mod.rotation.z;
          deviceOrientationChange(new DeviceOrientation(((x  * 180 / Math.PI)+90+360)%360,((y  * 180 / Math.PI)+360)%360,((z  * 180 / Math.PI)+360)%360));
        });

        var deviceOrientation = new DeviceOrientation(90,0,0);
        deviceOrientationChange(deviceOrientation);

        resetButton.onclick = function(event) {
          event.preventDefault();

          var x = 0
            , y = 0
            , z = 0;

          var axis  = [0, 0, 1]
            , angle;

          // if (TrinketIO.runtime('sense_hat_enclosure') === 'astro-pi') {
          //   //z = 180;
          //   axis[0] = 0;
          //   axis[2] = 1;
          // }

          window.rotatemodel(Geometry.degToRad(x), Geometry.degToRad(y), Geometry.degToRad(z));
          angle = Geometry.degToRad(z);

          var deviceOrientation = new DeviceOrientation(90, 0, 0);
          deviceOrientationChange(deviceOrientation);

          /*traq.stop(function() {
            traq.setup({
                axis  : axis
              , angle : angle
            });
            deviceOrientationChange(deviceOrientation);
          });*/
        };
      }

      initOrientation()
      // document.getElementById("sensetxt").setAttribute('onload', draw())
  }, [])

  // function draw() {
  //   var canvas = document.getElementById('canvas');
  //   var ctx = canvas.getContext('2d');
  //   ctx.drawImage(document.getElementById('sensetxt'), 0, 0);
  // }

    return (
      <div hidden>
        <canvas id='canvas' width="8" height="640">
          Canvas not supported
        </canvas>
        {/* <img id="sensetxt" src="sense_hat_text.bmp" alt=''/> */}
      </div>
    )
};

export default Simulator
