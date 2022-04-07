import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { useEffect } from 'react';

const Simulator = (props) => {

  // console.log(props.message)

    useEffect(()=> {
      var senseHatNode = document.getElementById('sensehat-node')
      senseHatNode.innerHTML='';
      
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
      controls.enableRotate = true
      controls.enablePan = true
      controls.enableZoom = false
      //controls.minDistance = 1.3
      controls.keys = {
          LEFT: 'ArrowLeft',
          UP: 'ArrowUp',
          RIGHT: 'ArrowRight',
          BOTTOM: 'ArrowDown'
      }
      var mod;
      
      // glTf Loader
      var loader = new GLTFLoader();     
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath( 'three/examples/js/libs/draco/' );
      loader.setDRACOLoader( dracoLoader );
    
      loader.load( 'models/raspi-compressed.glb', function ( gltf ) {         
          var object = gltf.scene;                
          gltf.scene.scale.set( 4, 4, 4 );               
          gltf.scene.position.x = 0;                   
          gltf.scene.position.y = 0;          
          gltf.scene.position.z = 0;              
          scene.add( gltf.scene );
          mod = gltf.scene
          var newMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});

          animate()
      });  

      var clock = new THREE.Clock();
      var delta;
      var txt = props.message;
      console.log('txt=', txt)
      var vdata = new Array(8);

      // Create virtual bitmap that represents the size of the text 
      for (var i = 0; i < vdata.length; i++) { 
          vdata[i] = new Array((5*(txt.length))+16); 
          for (var z = 0; z < vdata[i].length; z++) { 
              vdata[i][z] = 0x0
          }            
      }
      var canvas = document.getElementById('canvas');
      var ctx = canvas.getContext('2d');
      const dict = " +-*/!\"#$><0123456789.=)(ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz?,;:|@%[&_']\\~"

      // Initialise the virtual bitmap with data from out 'font' file
      for(var ch=0; ch<txt.length; ch++){
          var vv = dict.indexOf(txt[ch])
          for(var y=0;y<5;y++){
              for(var x=0;x<8;x++){
                  var dat = ctx.getImageData(7-x, y+(5*vv), 1, 1).data;
                  if(dat[0] > 0){
                      vdata[x][y+(ch*5)+8] = 0xffffff;
                  }
              }
          }
      }

      var shift = 0;

      // Animate the scrolling text
      function animate() {
          delta = clock.getElapsedTime();
          var newMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});

          for(var y=0;y<8;y++){
              for(var x=0;x<8;x++){
                  var object = mod.getObjectByName("circle"+y+"_"+x+"-1");
                  if(object != null){
                      var newMaterial = new THREE.MeshStandardMaterial({color: vdata[y][x+shift]});
                      object.material = newMaterial
                  }
              }
          }

          requestAnimationFrame( animate );
          renderer.render( scene, camera );

          if(delta > 0.1){
              clock.stop()
              clock.start()
              shift += 1
              if (shift >= (txt.length*5)+8){
                  shift = 0
              }
          }
      }

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

      document.addEventListener( 'pointerup', function( event ) {
          isDragging = false
      })

      document.addEventListener( 'pointerdown', function( event ) {
          isDragging = true
      })

      senseHatNode.addEventListener( 'pointermove', moveit );
      
      function moveit(e){
          var deltaMove = {
              x: e.offsetX-previousMousePosition.x,
              y: e.offsetY-previousMousePosition.y
          };

          if(isDragging) {
              var deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(
                  toRadians(deltaMove.y * 1),
                  toRadians(deltaMove.x * 1),
                  0,
                  'XYZ'
              ));
              mod.quaternion.multiplyQuaternions(deltaRotationQuaternion, mod.quaternion);
              console.log(toDegrees(mod.rotation.x), toDegrees(mod.rotation.y), toDegrees(mod.rotation.z))
          }

          previousMousePosition = {
              x: e.offsetX,
              y: e.offsetY
          };
      }

      function toRadians(angle) {
          return angle * (Math.PI / 180);
      }

      function toDegrees(angle) {
          return angle * (180 / Math.PI);
      }
      document.getElementById("sensetxt").setAttribute('onload', draw())
  }, [])

  function draw() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.drawImage(document.getElementById('sensetxt'), 0, 0);
  }

    return (
      <div hidden>
        <canvas id='canvas' width="8" height="640">
          Canvas not supported
        </canvas>
        <img id="sensetxt" src="sense_hat_text.bmp" alt=''/>
      </div>
    )
};

export default Simulator
