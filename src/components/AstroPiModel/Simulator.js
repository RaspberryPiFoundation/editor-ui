import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { Geometry } from '../../utils/Geometry';
import DeviceOrientation from '../../utils/DeviceOrientation';
import { useEffect } from 'react';
import Sk from 'skulpt';

const Simulator = (props) => {

    useEffect(()=> {

      // low light settings
      var lowLightLimit     = 8;
      var defaultLightLimit = 47;
      var lightThreshold    = defaultLightLimit;

      Sk.sense_hat_emit   = function(event, data) {
        var ledIndex, ledData;

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
            isDragging = false
          })
    
          senseHatNode.addEventListener( 'pointerdown', function( event ) {
            isDragging = true
            mouseXOnMouseDown = event.clientX - windowHalfX;
            targetRotationOnMouseDownX = targetRotationX;
            mouseYOnMouseDown = event.clientY - windowHalfY;
            targetRotationOnMouseDownY = targetRotationY;
          })
    
          document.addEventListener( 'pointermove', moveit );
          window.finished3D = true
          window.rotatemodel = function(x, y, z){
            window.mod.rotation.x = x;
            window.mod.rotation.y = y;
            window.mod.rotation.z = z;
            renderer.render( scene, camera );
          }
      });

      /*
          Uses drag code from:
          https://jsfiddle.net/MadLittleMods/n6u6asza/

          To rotate object, rather than rotating camera around object.  Wondering if there
          might be a more threejs solution?

          Note: Had to use pointer* events rather than mouse* events
      */
      var isDragging = false;

      function rotateAroundWorldAxis( object, axis, radians ) {
        // Changed this function from
        // the codepen version, so that it could rotate
        // on both axis.  Unsure currently why the the codepen code
        // didn't allow this with our model
        object.rotateOnWorldAxis(axis, radians)
      }

      function moveit(e){
        mouseX = e.clientX - windowHalfX;
        targetRotationX = ( mouseX - mouseXOnMouseDown ) * 0.00025;
        mouseY = e.clientY - windowHalfY;
        targetRotationY = ( mouseY - mouseYOnMouseDown ) * 0.00025;
      
        if(isDragging) {
          rotateAroundWorldAxis(window.mod, new THREE.Vector3(0, 0, -1), targetRotationX);
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

      // ===========================================================================================================
      // Orientation stuff

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
       * Initializes the device orientation handlers:
       *  - Handles 3D rotations of the sense hat
       *  - Calculates the position and view of the rotated sense hat
       */
      function initOrientation() {
        var resetButton      = document.getElementById('orientation-reset-btn');
        window.set_onrotate(function(){
          const x=window.mod.rotation.x;
          const y=window.mod.rotation.z;
          const z=window.mod.rotation.y;
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

          window.rotatemodel(Geometry.degToRad(x), Geometry.degToRad(y), Geometry.degToRad(z));
          angle = Geometry.degToRad(z);

          var deviceOrientation = new DeviceOrientation(90, 0, 0);
          deviceOrientationChange(deviceOrientation);
          updateRTIMU()
        };
      }

      initOrientation()
  }, [])


    return (
      <div hidden>
        <canvas id='canvas' width="8" height="640">
          Canvas not supported
        </canvas>
      </div>
    )
};

export default Simulator
