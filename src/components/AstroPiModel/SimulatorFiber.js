import * as THREE from 'three';

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Stars} from "@react-three/drei";
import Lighting from './Lighting';
import {updateRTIMU } from '../../utils/Orientation';
import { useEffect, Suspense } from 'react';
import Sk from 'skulpt';

import FlightCase from './FlightCase'
import './AstroPiModel.scss';

var isDragging=false
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
// var lowLightLimit     = 8;
// var defaultLightLimit = 47;
// var lightThreshold    = defaultLightLimit;


const Simulator = (props) => {
  const {updateOrientation} = props

  const handleDragStart = (e) => {
    isDragging=true
    mouseXOnMouseDown = e.clientX - windowHalfX;
    targetRotationOnMouseDownX = targetRotationX;
    mouseYOnMouseDown = e.clientY - windowHalfY;
    targetRotationOnMouseDownY = targetRotationY;
  }
  const handleDragStop = () => {
    isDragging=false
  }

  const dragModel = (e) => {
    mouseX = e.clientX - windowHalfX;
    targetRotationX = ( mouseX - mouseXOnMouseDown ) * 0.00025;
    mouseY = e.clientY - windowHalfY;
    targetRotationY = ( mouseY - mouseYOnMouseDown ) * 0.00025;
  
    if(isDragging) {
      window.mod.rotateOnWorldAxis(new THREE.Vector3(0, 0, -1), targetRotationX);
      window.mod.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), targetRotationY);
      updateOrientation([((window.mod.rotation.y  * 180 / Math.PI)+360)%360, ((window.mod.rotation.x  * 180 / Math.PI)+90+360)%360, ((window.mod.rotation.z  * 180 / Math.PI)+360)%360])
      updateRTIMU();
      targetRotationY = targetRotationY * (1 - slowingFactor);
      targetRotationX = targetRotationX * (1 - slowingFactor);
    }
  };

  function setPixel(ledIndex,r,g,b) {
    if(window.mod == null)
      return;
  
    var x = ledIndex % 8;
    var y = Math.floor(ledIndex / 8);
    var newMaterial = new THREE.MeshStandardMaterial({color: `rgb(${r},${g},${b})`});
    var object = window.mod.getObjectByName(`circle${x}_${7-y}-1`);
  
    if(object != null)
      object.material = newMaterial;
  }
  
  function setPixels(indexes, pix) {
    if(window.mod == null)
      return;
  
    if(indexes == null)
      indexes = Array.from(Array(8*8).keys())
  
    var i = 0;
    for (const ledIndex of indexes){;
      setPixel(ledIndex, pix[i][0], pix[i][1], pix[i][2])
      i += 1;
    }
  }

  useEffect(() => {
    Sk.sense_hat_emit = function(event, data) {
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
  
        setPixel(ledIndex, parseInt(ledData[0]*255), parseInt(ledData[1]*255), parseInt(ledData[2]*255));
  
      }
      // else if (event && event === 'changeLowlight') {
      //   lightThreshold = data === true ? lowLightLimit : defaultLightLimit;
      // }
      else if (event && event === 'setpixels') {
        setPixels(data, Sk.sense_hat.pixels);
      }
    }
  }, [])

  return (
    <Canvas 
      style={{background: "#999999", width: '500px', height: '400px'}} 
      onPointerDown={handleDragStart}
      onPointerUp={handleDragStop}
      onPointerOut={handleDragStop}
      onPointerMove={dragModel}
    >
      <Lighting />
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault fov={25} near={1} far={20000} position={[0, 1.5, 0]} />
        <FlightCase />
        <OrbitControls enableRotate = {false} enablePan = {false} enableZoom = {false} enabled = {false} />
      </Suspense>
    </Canvas>
  )
};

export default Simulator
