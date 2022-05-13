import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import {updateRTIMU } from '../../utils/Orientation';
import { useEffect } from 'react';
import Sk from 'skulpt';
import './AstroPiModel.scss';

const Simulator = (props) => {

  const {updateOrientation} = props

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
        var newMaterial = new THREE.MeshStandardMaterial({color: `rgb(${r},${g},${b})`});
        var object = window.mod.getObjectByName(`circle${x}_${7-y}-1`);
      
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
        for (const ledIndex of indexes){;
          set_pixel(ledIndex, pix[i][0], pix[i][1], pix[i][2])
          i += 1;
        }
        renderer.render( scene, camera );
      }

      updateOrientation([0,90,0])
  }, [])

    return (
      <div className="orientation-stage" id="orientation-stage">
        <div className="orientation-layer" id="orientation-layer">
          <div className="scene scene3d" id="sensehat-node">
          </div>
        </div>
      </div>
    )
};

export default Simulator
