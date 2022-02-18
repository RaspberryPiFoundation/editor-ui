import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import $ from 'jquery';

const Simulator = (props) => {
    // Drag code based on https://codepen.io/OpherV/pen/YXwwNR
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

    function rotateAroundWorldAxis( object, axis, radians ) {
        // Changed this function from
        // the codepen version, so that it could rotate
        // on both axis.  Unsure currently why the the codepen code
        // didn't allow this with our model
        object.rotateOnWorldAxis(axis, radians)
      }

    function moveit(e){
        if ($('#canvas:hover').length <= 0)
          return;
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
          window.renderer.render( window.scene, window.camera );
        }
      }

    window.init3D = function (val){
        return new Promise(function (resolve, reject) {
            //var w = document.getElementById('canvas').clientWidth
            //var h = document.getElementById('canvas').clientHeight
            var w = 500;
            var h = 500;
            window.callback_move = null;
            window.set_onrotate   = function(func){
            window.callback_move = func;
            }

            window.camera = new THREE.PerspectiveCamera( 70, w / h, 1, 1000 );
            window.camera.position.y = 0;
            window.camera.position.x = 0;
            window.camera.position.z = 400;

            // Load a Renderer
            window.renderer = new THREE.WebGLRenderer( { antialias: true } );
            window.renderer.setPixelRatio( window.devicePixelRatio );
            window.renderer.setSize( window.innerWidth, window.innerHeight );
            window.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            window.renderer.toneMappingExposure = 1;
            window.renderer.outputEncoding = THREE.sRGBEncoding;
            window.renderer.setClearColor( 0xC5C5C3 );

            // Load 3D Scene
            window.scene = new THREE.Scene();
            window.scene.background = new THREE.Color( 0xf9f9f9f );
            const environment = new RoomEnvironment();
            const pmremGenerator = new THREE.PMREMGenerator( window.renderer );
            window.scene.environment = pmremGenerator.fromScene( environment ).texture;
            window.scene.add( window.camera );

            const grid = new THREE.GridHelper( 500, 10, 0xffffff, 0xffffff );
            grid.material.opacity = 0.5;
            grid.material.depthWrite = false;
            grid.material.transparent = true;

            // Load the Orbitcontroller
            var controls = new OrbitControls( window.camera, window.renderer.domElement );
            controls.enableRotate = false;
            controls.enablePan = false;
            controls.enableZoom = false;
            controls.enabled = false;

            // glTf Loader
            var loader = new GLTFLoader();
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('%PUBLIC_URL%/js/three/examples/js/libs/draco/');
            loader.setDRACOLoader( dracoLoader );

            loader.load('%PUBLIC_URL%/models/raspi-compressed.glb', function ( gltf ) {
            gltf.scene.scale.set( 2000,2000,2000 );
            window.scene.add( gltf.scene );
            window.mod = gltf.scene
            var newMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});

            window.mod.translateY(100.0);
            window.mod.rotateX(1.5708);
            window.mod.rotateY(0);
            window.mod.rotateZ(0);

            window.renderer.render( window.scene, window.camera );

            document.addEventListener( 'pointerup', function( event ) {
                if ($('#canvas:hover').length <= 0)
                return;
                isDragging = false
            })

            document.addEventListener( 'pointerdown', function( event ) {
                if ($('#canvas:hover').length <= 0)
                return;
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
                window.renderer.render( window.scene, window.camera );
            }

            resolve(val)
            })
        })
    }

    return (
        <div id='canvas'></div>
    )
};

export default Simulator
