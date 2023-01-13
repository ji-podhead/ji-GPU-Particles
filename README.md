# ji-GPU-Particles
* a GPU  particle Api for threejs using mesh instances inspired by unity shuriken.

**features**
* pointClouds,childParticles,vertex distortion/morphtargets,forceField,noise
* autosimulation for graphity,force and to set Attributes OverLifeTime
* 
**Usage**
* initialize the PS object with  *const particle = new Particles() *u dont need to pass in any values yet* this is just to reference an object for later usage
* if your THREEjs scene is ready and referenced, you can initialize your PS from the object we just created by passing the scene, prototype-Mesh and maxAmount like this:  ```particle.InitializeParticles(scene,Mesh,100000)```
