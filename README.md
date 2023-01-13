# ji-GPU-Particles
* a GPU  particle Api for threejs using mesh instances inspired by unity shuriken.

**features**
* pointClouds,childParticles,vertex distortion/morphtargets,forceField,noise
* autosimulation for graphity,force and to set Attributes OverLifeTime
* 
**Usage**
* *ue need to use update() and updateSimulation() to make changes present in runtime!*
* import the script ```import InitMeshes, {Particles } from './JI-GPU-Particles';
```
* initialize the PS object with  ```const particle = new Particles()``` *u dont need to pass in any values yet* this is just to reference an object for later usage
* if your THREEjs scene is ready and referenced, you can initialize your PS now by calling **InitializeParticles** on the object we just created. for a minimal setup pass in the scene, prototype-Mesh and maxAmount like this:  ```particle.InitializeParticles(scene,Mesh,100000)```. you can set every value and attribute later in runtime.
* **noew its time to add some crazy stuff:**
* ``` particle.setMaxLifeTime(2);
 particle.setSpawnOverTime(true);
 particle.setMaxLifeTime(1);
 particle.setAttributeOverLifeTime("color",[10,1,0]);
 particle.setAttributeOverLifeTime("emission",[10,0,0]);
 particle.setAttributeOverLifeTime("force",[,20,50]);
 particle.setForce([0,150,0]);
 particle.setAttributeOverLifeTime("transform",[-100,-100,2]);
 particle.setSpawnFrequency(0);
 particle.setMaxSpawnCount(100000);
 particle.setSpawnOverTime(true);
 particle.setNoise(20000);
 const geo = new THREE.SphereGeometry(2000,30,30);
particle.setStartPositionFromGeometry(false,geo,10);```

* now we have set some values, we can update them in useFrame():
```useFrame((state, delta) => {
  particle.updateSimulation(delta)
  particle.updateValues(["transform","color","emission"])
}```
