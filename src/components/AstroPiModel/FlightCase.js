import {useLoader} from "@react-three/fiber";
import { GLTFLoader } from 'three-stdlib/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three-stdlib/loaders/DRACOLoader.js';

const FlightCase = () => {

  const gltf = useLoader(GLTFLoader, process.env.PUBLIC_URL+'/models/raspi-compressed.glb', loader => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( process.env.PUBLIC_URL+'/three/examples/js/libs/draco/' );
    loader.setDRACOLoader( dracoLoader );
  })
  window.mod=gltf.scene

  return (
    <>
      <primitive onPointerDown={(e)=> {console.log("you clicked me")}} object={gltf.scene} scale={4} />
    </>
  )
}

export default FlightCase
