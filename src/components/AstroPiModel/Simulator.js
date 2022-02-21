import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import $ from 'jquery';
import Sk from "skulpt"

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

    var SenseHatHtml;
    var senseHatConfig;

    var browser    = Detectizr.browser.name;
    var browser_os = browser + ":" + Detectizr.os.name;
    // var killable   = browser === "midori" || browser === "iceweasel" || browser === "epiphany" ? false : true;

    // assumes versions greater than or equal to
    var browser_version = parseInt(Detectizr.browser.version);
    var browser_3d      = browser + '-gte-3d';

    var default_sense_hat_height = 400;

    var initSenseHat = function(config, $target) {
    var sense_hat_height;

    $target.html(SenseHatHtml);

    $target.css({
        height : '100%'
    });

    // need to wait for svg to fully load to get it's height

    var graphicWrapWidth = $('#graphic-wrap').width();
    var maxWidth         = graphicWrapWidth - (graphicWrapWidth * .05);

    try {
        // firefox doesn't like this
        sense_hat_height = $('#sense-hat-enclosure').get(0).getBBox().height;
    } catch(e) {
        sense_hat_height = default_sense_hat_height;
    }

    if (!sense_hat_height) {
        sense_hat_height = default_sense_hat_height;
    }

    var widthRatio = Math.floor( maxWidth / sense_hat_height );
    if (widthRatio > 1) {
        maxWidth /= widthRatio;
    }

    SenseOrientation.updateStage();

    if (!window.TrinketIO.runtime('usingSenseHat3d')) {
        $('.orientation-box').css({
            width  : maxWidth + 'px'
        , height : sense_hat_height + 'px'
        });

        $('.orientation-front').css({
            width  : maxWidth + 'px'
        , height : sense_hat_height + 'px'
        });
    }

    function _svg_height() {
        if ($('#_sense_hat_').height() === 0) {
        setTimeout( _svg_height, 250 );
        }
        else {
        var svg_height = $('#_sense_hat_').height();

        widthRatio = Math.floor( maxWidth / svg_height );
        if (widthRatio > 1) {
            maxWidth /= widthRatio;
        }

        // recalculate now that the svg has been loaded
        $('.orientation-box').css({
            width  : maxWidth + 'px'
            , height : svg_height + 'px'
        });

        $('.orientation-front').css({
            width  : maxWidth + 'px'
            , height : svg_height + 'px'
        });

        $('.orientation-back').css({
            width       : maxWidth + 'px'
            , height      : svg_height + 'px'
            , transform   : "rotateY(180deg) rotateZ(180deg)"
            , msTransform : "rotateY(180deg) rotateZ(180deg)"
        });

        }
    }

    (function _init() {
        // don't init sensors (rangeslider) until its container has been rendered
        if ($('#sense-hat-sensor-controls-container').width() === 0) {
        setTimeout( _init, 100 );
        }
        else {
        if (TrinketIO.runtime('usingSenseHatFlat')) {
            _svg_height();
        }

        // temporary check while 3d is in testing
        if (config._3d) {
            $target.find('.3d').removeClass('hide');
            TrinketIO.runtime('usingSenseHat3d', true);
            SenseOrientation.initOrientation();

            $('.save-it').removeClass('blue-highlight');
            $('.save-it').removeClass('green-highlight');
        }
        else {
            // show rotate and info buttons
            $target.find('.2d').removeClass('hide');
            TrinketIO.runtime('usingSenseHat3d', undefined);

            // temporary init until 3d is live
            SenseOrientation.initSenseHatEnclosure();
        }

        if (config.snapshot) {
            $target.find('.hide-for-snapshot').addClass('hide');
            $target.find('.orientation-stage').addClass('snapshot');
        }

        SenseHat.initSensors();
        }

    })();
    };

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
            // var w = document.getElementById('canvas').clientWidth
            // var h = document.getElementById('canvas').clientHeight
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
            dracoLoader.setDecoderPath('../three/examples/js/libs/draco/');
            loader.setDRACOLoader( dracoLoader );

            loader.load('../models/raspi-compressed.glb', function ( gltf ) {
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

    var loadSenseHatCanvas = function(config, $target){
        return new Promise(function (resolve, reject) {
          if (!Sk.sense_hat) {
            Sk.sense_hat = config.sense_hat;
          }
          if (!Sk.sense_hat_emit) {
            Sk.sense_hat_emit = config.sense_hat_emit;
          }
    
          $target.data("graphicMode", "sense hat");
    
          if (!SenseHatHtml) {
            var senseHatUrl;
            var configOverride = false;
            var senseHatPartial = ['sense-hat'];
    
            senseHatConfig = window.senseHatConfig2021 || {};
    
            // check 3d override for certain versions
            if (senseHatConfig[browser_3d] && browser_version >= senseHatConfig[browser_3d]) {
              configOverride = true;
            }
    
            if (senseHatConfig[browser] && !configOverride) {
              senseHatPartial.push( senseHatConfig[browser] );
            }
            if (senseHatConfig[browser_os]) {
              senseHatPartial.push( senseHatConfig[browser_os] );
            }
    
            // temporary check while 3d is in testing
            if (!config._3d) {
              // there is no flat 2d version
              if (senseHatPartial.indexOf('flat') >= 0) {
                senseHatPartial.splice( senseHatPartial.indexOf('flat'), 1 );
              }
              senseHatPartial.push('2d');
            }
    
            if (senseHatPartial.indexOf('flat') >= 0) {
              TrinketIO.runtime('usingSenseHatFlat', true);
            }
    
            senseHatUrl = senseHatPartial.join('-');
            senseHatUrl = trinketConfig.prefix('/partials/' + senseHatUrl + '2021.html');
    
            resolve(loadExternalLibraryInternal_(senseHatUrl, false)
              .then(window.init3D)
              .then(function (result) {
                SenseHatHtml = result;
                initSenseHat(config, $target);
    
                if (TrinketIO.runtime('usingSenseHatFlat')) {
                  var html = template('statusMessageTemplate', {
                    type    : 'info',
                    message : "Try <a href='https://www.google.com/chrome/browser/desktop/' class='text-link' target='_blank'><strong>Chrome</strong></a> or Safari for a richer 3D experience."
                  });
                  var $msg = $(html);
                  $('body').append($msg);
                  $('body').addClass('has-status-bar');
                  $msg.parent().foundation().trigger('open.fndtn.alert');
                }
              }));
          }
    
          if ($('#sense-hat-sensor-controls-container').length === 0) {
            initSenseHat(config, $target);
          }
    
          resolve();
        }).then(function () {
          var w = document.getElementById('canvas').clientWidth;
          var h = document.getElementById('canvas').clientHeight;
          var container = document.getElementById( 'canvas' );
          window.camera.aspect = w / h;
          window.camera.updateProjectionMatrix ();
          window.renderer.setSize( w, h );
          container.appendChild( window.renderer.domElement );
          SenseStick.initJoystick();
    
          destroyGraphicsFn = function() {
            SenseHat.destroySliders();
            $('#graphic-wrap').removeClass('sense-hat');
            destroyGraphicsFn = undefined;
          };
    
          $('#graphic-wrap').addClass('sense-hat');
        });
      }

    // window.init3D()
    loadSenseHatCanvas()

    return (
        <div id='canvas'></div>
    )
};

export default Simulator
