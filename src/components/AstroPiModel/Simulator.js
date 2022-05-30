import React from 'react';
import * as THREE from 'three';
import { ResizeObserver } from "@juggle/resize-observer";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Lighting from './Lighting';
import { Suspense } from 'react';
import { useCookies } from 'react-cookie';

import { extractRollPitchYaw } from '../../utils/Orientation';
import FlightCase from './FlightCase'
import './AstroPiModel.scss';

var isDragging=false
var targetRotationX = 0.5;
var targetRotationY = 0.2;
var mouseX = 0;
var mouseXOnMouseDown = 0;
var mouseY = 0;
var mouseYOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var slowingFactor = 0.25;
const rotationScaleFactor = 0.00025

const Simulator = (props) => {
  const {updateOrientation} = props
  const [cookies] = useCookies(['theme'])

  const handleDragStart = (e) => {
    isDragging=true
    mouseXOnMouseDown = e.clientX - windowHalfX;
    mouseYOnMouseDown = e.clientY - windowHalfY;
  }
  const handleDragStop = () => {
    isDragging=false
  }

  const dragModel = (e) => {
    mouseX = e.clientX - windowHalfX;
    targetRotationX = ( mouseX - mouseXOnMouseDown ) * rotationScaleFactor;
    mouseY = e.clientY - windowHalfY;
    targetRotationY = ( mouseY - mouseYOnMouseDown ) * rotationScaleFactor;
  
    if(isDragging) {
      window.mod.rotateOnWorldAxis(new THREE.Vector3(0, 0, -1), targetRotationX);
      window.mod.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), targetRotationY);
      updateOrientation(
        extractRollPitchYaw(
        window.mod.rotation.x,
        window.mod.rotation.y,
        window.mod.rotation.z
        )
      )
      targetRotationY = targetRotationY * (1 - slowingFactor);
      targetRotationX = targetRotationX * (1 - slowingFactor);
    }
  };

  return (
    <Canvas 
      style={{background: `${cookies.theme === 'dark' ? "#414141" : "#999999"}`, width: '500px', height: '400px'}}
      onPointerDown={handleDragStart}
      onPointerUp={handleDragStop}
      onPointerOut={handleDragStop}
      onPointerMove={dragModel}
      resize={{polyfill: ResizeObserver}}
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
