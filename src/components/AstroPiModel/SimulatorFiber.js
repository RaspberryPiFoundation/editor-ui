import * as THREE from 'three';

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Stars} from "@react-three/drei";
import Lighting from './Lighting';
import {updateRTIMU } from '../../utils/Orientation';
import { useEffect, Suspense } from 'react';
import Sk from 'skulpt';

import FlightCase from './FlightCase'
import './AstroPiModel.scss';


const Simulator = (props) => {
  const {updateOrientation} = props

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

  function rotateAroundWorldAxis( object, axis, radians ) {
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
      // if (window.callback_move != null) {
      //   window.callback_move(window.mod.rotation.x,window.mod.rotation.y,window.mod.rotation.y);
      // }
      // updateOrientation([((window.mod.rotation.y  * 180 / Math.PI)+360)%360, ((window.mod.rotation.x  * 180 / Math.PI)+90+360)%360, ((window.mod.rotation.z  * 180 / Math.PI)+360)%360])
      targetRotationY = targetRotationY * (1 - slowingFactor);
      targetRotationX = targetRotationX * (1 - slowingFactor);
      updateRTIMU();
    }
  }

    useEffect(()=> {
      window.rotatemodel = function(x, y, z){
        window.mod.rotation.x = x;
        window.mod.rotation.y = y;
        window.mod.rotation.z = z;
      }

      // window.callback_move = null;
      // window.set_onrotate   = function(func){
      //   window.callback_move = func;
      // }
      // window.set_onrotate(function(){
      //   const x=window.mod.rotation.x;
      //   const y=window.mod.rotation.z;
      //   const z=window.mod.rotation.y;
      //   updateOrientation([((y  * 180 / Math.PI)+360)%360, ((x  * 180 / Math.PI)+90+360)%360, ((z  * 180 / Math.PI)+360)%360])
      // });
      updateOrientation([0,90,0])
  }, [])

    return (
      <Canvas 
        style={{background: "#999999", width: '500px', height: '400px'}} 
        onPointerDown={(e)=>{
        isDragging=true
        mouseXOnMouseDown = e.clientX - windowHalfX;
        targetRotationOnMouseDownX = targetRotationX;
        mouseYOnMouseDown = e.clientY - windowHalfY;
        targetRotationOnMouseDownY = targetRotationY;
        }} 
        onPointerUp={()=>{isDragging=false}} 
        onPointerOut={()=>{isDragging=false}}
        onPointerMove={moveit}
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
