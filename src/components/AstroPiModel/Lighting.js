import React from 'react';

const Lighting = () => {

  return(
    <>     
      <ambientLight intensity={0.25} />
      <pointLight intensity={0.35} angle={28} penumbra={2} position={[0.418, 16.199, 0.300]} castShadow />
      <pointLight position={[-16.116, 14.37, 8.208]} intensity={0.5} castShadow/>
      <pointLight position={[-16.109, 18.021, -8.207]} intensity={0.5} castShadow/>
      <pointLight position={[14.904, 12.198, -1.832]} intensity={0.17} castShadow/>
      <pointLight position={[- 0.462, 8.89, 14.520]} intensity={0.43} castShadow/>
      <pointLight position={[3.235, 11.486, - 12.541]} intensity={0.2} castShadow/>
      <pointLight position={[0.0, -20.0, 0.0]} intensity={0.5} castShadow/>
    </>
  )
}

export default Lighting
