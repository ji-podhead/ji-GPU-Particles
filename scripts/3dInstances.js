import React, { useRef, useMemo, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { setCameraPosition, setTempString, Update, setVal, setLastCallTime, setCubes } from './features/counter/counterSlice';
import { useDispatch } from 'react-redux';
import data from "./camData.json"
import { geometry } from '@turf/turf';
import { transform } from 'ol/proj';
export class Particles {
	constructor(amount,startPosition,vertCount,items,noise,pointCloud,startPositionFromgeometry,forcefield,force,forceFieldForce,startValues,maxLifeTime,lifeTime,attributesoverLifeTime,properties,spawFrequency,maxSpawnCount,spawnOverTime,waitingtime,burstCount,additionalBurstCount,evenFunctions,particleEventFunctions,instance){
	this.amount = amount
	this.startPosition = startPosition
	this.vertCount = vertCount
	this.items = items
	this.noise =noise
	this.pointCloud = pointCloud
	this.startPositionFromgeometry = startPositionFromgeometry
	this.forcefield = forcefield
	this.force = force
	this.forceFieldForce = forceFieldForce
	this.startValues = startValues
	this.maxLifeTime = maxLifeTime
	this.lifeTime = lifeTime
	this.attributesoverLifeTime = attributesoverLifeTime
	this.properties = properties
	this.spawFrequency =spawFrequency
	this.maxSpawnCount =maxSpawnCount
	this.spawnOverTime =spawnOverTime
	this.waitingtime = waitingtime
	this.burstCount =burstCount
	this.additionalBurstCount =additionalBurstCount
	this.evenFunctions =evenFunctions
	this.particleEventFunctions =particleEventFunctions
	this.instance=instance
}

//occlusion culling mitels active/inactive item propertie und vertexshader position*visibilityAttr

/**
 * sets  the morphtargets and updates the attribute array
 * @param {*} morphTargets
 * array of the morphtargets 
 */

  setMorphTargets(morphTargets) {
	for (let i = 0; i < morphTargets.length; i++) {
		this.properties.set("morphTargets", parseInt(morphTargets[i]))
	}
	this.properties.get("morphTargetInfluences").attribute.needsUpdate = true
}
  setMaxLifeTime(maxLifeTime) {
	this.maxLifeTime = maxLifeTime
}
  setNoise(strength) {
	this.noise = strength
}
  setScale(x, y, z, index) {
	this.properties.get("transform").array[1][index * 4] = x
	this.properties.get("transform").array[1][(index * 4) + 1] = y
	this.properties.get("transform").array[1][(index * 4) + 2] = z
}
  setRotation(x, y, z, index) {
	this.properties.get("transform").array[2][index * 4] = x
	this.properties.get("transform").array[2][(index * 4) + 1] = y
	this.properties.get("transform").array[2][(index * 4) + 2] = z
}
  setTransform(x, y, z, index) {
	this.properties.get("transform").array[3][index * 4] = x
	this.properties.get("transform").array[3][(index * 4) + 1] = y
	this.properties.get("transform").array[3][(index * 4) + 2] = z
}
  getScale(index) {
	return ([
		this.properties.get("transform").array[1][index * 4],
		this.properties.get("transform").array[1][(index * 4) + 1],
		this.properties.get("transform").array[1][(index * 4) + 2]])
}
  getRotation(index) {
	return ([
		this.properties.get("transform").array[2][index * 4],
		this.properties.get("transform").array[2][(index * 4) + 1],
		this.properties.get("transform").array[2][(index * 4) + 2]])
}
  getTransform(index) {
	return ([
		this.properties.get("transform").array[3][index * 4],
		this.properties.get("transform").array[3][(index * 4) + 1],
		this.properties.get("transform").array[3][(index * 4) + 2]])
}
  setForceFieldForce(forceFieldForce) {
	this.forceFieldForce = (forceFieldForce[0])
	this.forceFieldForce = (forceFieldForce[1])
	this.forceFieldForce = (forceFieldForce[2])
}
  setForce(force) {
	this.force = force
	this.properties.get("sourceValues").set("force",force)
}
  setBurstCount(count) {
	this.properties.burstCount=count
}
  burstParticlesManually(count){
	this.properties.additionalBurstCount=count
}
  setSpawnOverTime(bool) {
	this.spawnOverTime = bool
	
}
  setSpawnFrequency(freq) {
	this.spawFrequency = freq
	
}
  setMaxSpawnCount(count) {
	if(count>this.amount){
		count =this.amount
	}
	this.instance.instanceCount = 1
	
}
  setStartPositionFromGeometry(deactivate, geometry,step) {
	if (deactivate == false) {
		this.createPointCloud(geometry, false, true, false,step)

	if(this.spawnOverTime==false)
		for(let i=0; i<this.amount;i++){
			this.setTransform(
				this.pointCloud[(i*3)],
				this.pointCloud[(i*3) + 1],
				this.pointCloud[(i *3)+ 2], i)
		}
	
		this.startPositionFromgeometry = true
	}else{
		this.startPositionFromgeometry = false
	}
	
}
  setStartPositionFromArray(deactivate, array) {
	if (deactivate == false) {
		this.createPointCloud(array, false, true, true)
	}
	this.startPositionFromgeometry = true
}
  setForceFieldFromArray(array) {
	this.createPointCloud(array, true, false, true)
	this.startPositionFromgeometry = true
}
  setForceFieldFromGeomtry(geometry) {
	this.createPointCloud(geometry, true, false, false)
}
  setStartPosition(position) {
	this.startPositionFromgeometry = false
	this.startPosition = position
}
  getPointCloudAtIndex(index) {
	try {
		return ([
			this.pointCloud[index],
			this.pointCloud[index + 1],
			this.pointCloud[index + 2]
		])
	} catch {
		return ([0, 0, 0])
	}
}
  createPointCloud(geometry, forceField, startPosition, fromArray,step) {
	let amount = this.amount
	let height, width, depth, stepY, stepX, stepZ
	let xMin= 100.0
	let yMin= 100.0
	let zMin =100.0
	let xMax= -100.0
	let yMax= -100.0
	let zMax = -100.0
	
	let tempArr = fromArray == false ? geometry.attributes.position.array :  [].concat(geometry)
	const positions= new Array(tempArr.length)
	const pc = new Array(tempArr.length)
	for (let i=0;i<positions.length;i++){
		positions[i]=tempArr[i]
	}
	//indexPCStep= parseInt((this.amount/(positions.length/3))<0?-this.amount/(positions.length)/3:this.amount/(positions.length/3))
	console.log(geometry)
	//alert("step" +indexPCStep + " length" + positions.length)
	let nextIndex = 0
	init()
	create()
	function init() {
		for (let i = 0; i < positions.length /3 ; i++) {
		
			if (positions[i] <= xMin) {
				xMin = positions[i]
			}
			else if (positions[i] > xMax) {
				xMax = positions[i]
			}
			if (positions[i+1] < yMin) {
				yMin = positions[i+1]
			}
			else if (positions[i+1] > yMax) {
				yMax = positions[i + 1]
			}
			if (positions[i+2] < zMin) {
				zMin = positions[i+2]
			}
			else if (positions[i+2] > zMax) {
				zMax = positions[i + 2]
			}
			console.log()
		}
		width=xMax-xMin
		height=yMax-yMin
		depth=zMax-zMin
		stepY = height/step
		stepX =  width/step
		stepZ =  depth/step
		alert("stepx" + stepX +" stepy"+ stepY )
	}
	function findNearest(point,index) {
		let nearestDist = Infinity
		let nearestIndex = 0

		for (let i = 0; i < positions.length / 3; i++) {
			const distTemp = Math.sqrt(Math.abs(((positions[i] - point[0]) ^ 3) + ((positions[i + 1] - point[1]) ^ 3) + ((positions[i + 3] - point[2]) ^ 3)))
			//alert("dist" + distTemp)
			if (distTemp < nearestDist) {
				nearestDist = distTemp
				nearestIndex = i*3
			}
		}

		pc[nextIndex*3] = positions[nearestIndex]
		pc[(nextIndex*3 )+ 1] = positions[nearestIndex + 1]
		pc[(nextIndex*3 )+ 2] = positions[nearestIndex + 2]
		positions.splice(nextIndex*3,3)
		nextIndex += 1
	}
	function create() {
		let x, y, z = 0
		for (let i = 0; i < step; i++) {
			x += stepX
			for (let i2 = 0; i2 < step ;i2++) {
				y += stepY
				for (let i3 = 0; i3 < step; i3++) {
					z += stepY
					
					
					findNearest([stepX, stepY, stepZ],i)
					
				
					/** * findet den nächsten punkt zu point aus den quads */

				}
			}
		}
	}
	
	if (startPosition) {
		this.pointCloud = pc
		alert("pc"+JSON.stringify(pc))
	}
	else if (forceField) {
		this.forceField = pc
	}
	

}
/**
 *  @returns * this function returns an array of the values if length>0
 * for example attribute=transform will return an array array with length=3
  * @param {*} attribute 
 * so far you can get rotation,scale, color, emission, textures and morphtargets
 * * * @param {*} length 
 * the length of the of the attribute array representing the stride
 */
  getAttribute(attribute, index, length) {
	if (length > 1) {
		let values = new Array(length)
		for (let i = index; i < length; i++) {
			values[i] = this.properties.get(attribute).array[i * length]
		}
		return {
			values
		}
	} else {
		return (
			this.properties.get(attribute).array[index * length])
	}
}
  setSourceAttributes(attributes, values) {

	const sourceValues = this.properties.get("sourceValues")
	if (typeof attributes != "string") {
		for (const attribute of attributes) {
			sourceValues.set(attribute, values)
		}
	} else {
		sourceValues.set(attributes, values)
	}
}
/**
 * sets the attributes of the shader. use update() to make the changes present.
 * if you want to set the transform use setTransform(),setRotation(),or setScale().
 * if you want to set the forces use setForce(),or setForceFieldForce(). 
 * @param {*} attribute  
 * pass a string of the attribute
 * so far you can set color, emission, textures and morphtargets
  * @param {*} values 
 * an array holding the data
  * @param {*} index
 *the index of the meshPartikel ranges from 0 to instanceAmount
 */
  setShaderAttribute(attribute, index, values) {
	const attributeI = this.properties.get(attribute).array
	
	for (let i = 0; i <3; i++) {
		attributeI[(index*3)+i] = values[i]
		
	}
	//console.log("setting  index " +index+ " attr "+)
}
/**
 * @param {*} attribute  
 * pass a string of the attribute or an array of strings
 *  adds the attributes over lifeTime . possible attributes: "force","size","color","transform","scale","emission","rotation"
  * @param {*} values 
 * an array holding the data. elements must be numbers be from 0-1
  * @param {*} index
 *the index of the meshPartikel ranges from 0 to instanceAmount
 */
  setAttributeOverLifeTime(attribute, values) {
	this.attributesoverLifeTime.set(attribute, values)
}
checkType(element) {
	if (element == "transform") {
		//console.log("updating "+ "transform")
		this.properties.get("transform").attribute[3].needsUpdate = true
		return (true)
	}
	else if (element == "rotation") {

		this.properties.get("transform").attribute[1].needsUpdate = true
		return (true)
		console.log("updating "+ "transform")
	}
	else if (element == "scale") {
		console.log("updating "+ "transform")
		this.properties.get("transform").attribute[2].needsUpdate = true
		return (true)
	}
	else {
		return (false)
	}
}
/**
 * update the attributes
 * @param {*} attributes
 * either pass a single string, or an array of strings.
 * pass "transform","scale", or"rotation" if you want to update the transformMatrix
 */
  updateValues(attributes) {
	//console.log(attributes)
	//console.log(typeof attributes)
	if (typeof attributes == "object") {

		for (const attribute of attributes) {
			if (this.checkType(attribute) === false) {
				try {
					//console.log("updating " + attribute )
					this.properties.get(attribute).attribute.needsUpdate = true
				}
				catch { console.warn(attribute + " is not defined, pls check your spelling, or check if the attribute exist") }
			}
		}
	}
	else if (this.checkType(attributes) == false) {
		try {
			this.properties.get(attributes).attribute.needsUpdate = true
		}
		catch { console.warn(attributes + " is not defined, pls check your spelling, or check if the attribute exist") }
	}

	
}

  resetTransform(index) {
	const sourceAttributes = this.properties.startPosition

	if (this.startPositionFromgeometry == true) {
		this.setTransform(

			this.pointCloud[(index*3)],
			this.pointCloud[(index*3) + 1],
			this.pointCloud[(index *3)+ 2], index)
	} else {
		//console.log(this.startPosition)
		this.setTransform(
			this.startPosition[0],
			this.startPosition[0 + 1],
			this.startPosition[0 + 2], index)
	}
}
  resetParticle(index, attributesoverLifeTimeValues) {
	const sourceValues = this.properties.get("sourceValues")
	attributesoverLifeTimeValues.forEach( (value,attribute) =>{
		//console.log("reset"  +  attribute)
		if(attribute=="transform") {
			this.resetTransform(index)
		}
		else if (attribute == "rotation") {
			const rotation = sourceValues.get("rotation")
			this.setRotation(rotation[0], rotation[1], rotation[2], index)
		}
		else if (attribute == "scale") {
			const scale = sourceValues.get("scale")
			this.setScale(scale[0], scale[1], scale[2], index)
		}
		else if (attribute == "force") {
		//const scale =  this.properties.get("sourceValues").get("force")
		//console.log(scale)
		//setForce(scale[0], scale[1], scale[2])
		}
		else  {
			try {
				//console.log("rest")
				const sourceAttribute=sourceValues.get(attribute)
				this.setShaderAttribute(attribute, index, [sourceAttribute[index*3],sourceAttribute[(index*3)+1],sourceAttribute[(index*3)+2]])
			}
			catch {
				console.warn(attribute + " is not defined")
			}
		}
	})
	this.lifeTime[index] = 0
	
}
  createEventFunction(){

}
/**
 * this updates the physics transformation and overlifetime delta
 * this function requires a maxlifetime value != infinity
 * @param {*} delta 
 * @returns 
 */
  updateSimulation(delta) {
	//todo: set i by i/range
	//todo disable aatributes that are not reached by i/range
	const attributesoverLifeTimeValues = this.attributesoverLifeTime
		const overlifetimeSize=this.attributesoverLifeTime.size
//console.log(":MAAAAXSPAWNCOUNT:" + this.maxSpawnCount)
//console.log("SPAWNCOUNT:" + this.spawnCount)
//console.log("spawnfreq:" + this.spawFrequency)
	
	if(this.instance.instanceCount<=this.maxSpawnCount){
	//	console.log("wait " + this.waitingTime)
		if(this.waitingTime<=this.spawFrequency){
			this.waitingTime+=1
		}	else{
			this.waitingTime=0
			const maxBurst= this.burstCount + this.additionalBurstCount
			const überschuss =this.maxSpawnCount-(maxBurst+this.instance.instanceCount)
			const burstCount = überschuss>0?maxBurst:maxBurst-überschuss
			for (let i =0;i<burstCount;i++)
			{
				this.instance.instanceCount+=1
				this.resetParticle(this.instance.instanceCount,attributesoverLifeTimeValues)
			}
			if(this.additionalBurstCount>0)
			{this.additionalBurstCount=0}
		}
		}
		let force =[].concat(this.force)
	for (let i = 0; i <=this.instance.instanceCount ; i++) {
		this.lifeTime[i] +=delta
		if (this.lifeTime[i] <= this.maxLifeTime ) 
		{
			const lifeTimedelta = (this.lifeTime[i]/this.maxLifeTime )
			//console.log("upedate " + i +" life " +  this.lifeTime[i] + " delta " + lifeTimedelta)
			
			const step = lifeTimedelta 
			const current =i
			const newPosition = this.getTransform(i)
			let forceFieldForce = new Array(this.forceFieldForce)
			
			attributesoverLifeTimeValues.forEach( (value,attribute) =>{
		
			if (attribute == "transform") {
				newPosition[0] += (value[0] *step)
				newPosition[1] += (value[1] *step)
				newPosition[2] += (value[2] *step)	
					}
			else if (attribute == "rotation") {
				this.setRotation(value[0], value[1], value[2], i)
			}
			else if (attribute == "scale") {
				this.setScale(value[0], value[1], value[2], i)
			}
			else if (attribute == "forceFieldForce") {
				forceFieldForce = [forceFieldForce[0] * step,forceFieldForce[1] * step,forceFieldForce[2] * step]
				
			}
			else if (attribute == "force") {
				newPosition[0] += force[0]
				newPosition [1] += force[ 1]
				newPosition[2] +=force[ 2]
			}
			else {
				try {
					const arr=this.properties.get(attribute).array
					
					for (let i2= 0; i2<value.length ;i2++){
						const temp = arr[(i*3)+i2]+parseInt(value[i2]*step)
						arr[(i*3)+i2]= temp>=250?250:temp
						//console.log(arr[i+i2])
					}
					
				}
				catch {
					console.warn(attribute + " is not defined")
				}
			}
		})
			if (forceFieldForce[0] > 0 || forceFieldForce[1] > 0 || forceFieldForce[2] > 0) {
				if (data.data.this.startPositionFromgeometry == true) {
					newPosition[0] += forceFieldForce[0]
					newPosition[1] += forceFieldForce[1]
					newPosition[2] += forceFieldForce[2]
					if (
					 this.instances.properties.transform.array[3][i * 4] != data.data.this.forceField[i * 3]
						&& this.instances.properties.transform.array[3][i * 4 + 1] != data.data.this.forceField[i * 3 + 1]
						&& this.instances.properties.transform.array[3][i * 4 + 2] != data.data.this.forceField[i * 3 + 2]) {

						newPosition[0] += forceFieldForce
						newPosition[1] += forceFieldForce
						newPosition[2] += forceFieldForce
					}
				}
			}
			
				newPosition[0] += force[0]
				newPosition [1] += force[ 1]
				newPosition[2] +=force[ 2]
			if (this.noise > 0) {
				const noise = Math.sin(delta * 10 * this.noise)
				newPosition[0] += noise
				newPosition[1] += noise
				newPosition[2] += noise
			}
			const x = newPosition[0]
			const y = newPosition[1]
			const z = newPosition[2]
		//	console.log("newPosition " + newPosition + " force "+ force	)
			this.setTransform(x, y, z, i)
		}
		else {
			this.resetParticle(i, attributesoverLifeTimeValues)
			//console.log("reset " + i)
		}
	}
}
  InitializeParticles(scene,mesh,amount, maxLifeTime, burstCount,spawnOverTime, spawnFrequency,maxSpawnCount,startPosition, startScale, startRotation, startColor, startForce, startForceFieldForce) {
	//alert(JSON.stringify(sphereVerts))
	//+++++++++++++++++++++++++++++++++  >> initialize instancesObject <<  +++++++++++++++++++++++++++++++
		//setting the init values to default if not set
		amount = typeof amount != "number" && amount < 0 ? 100 : amount
		maxLifeTime = typeof maxLifeTime != "number" ? 100 : maxLifeTime
		startPosition = typeof startPosition != "object" || startPosition == undefined ? [0, 0, 0] : startPosition
		startScale = typeof startScale != "object" ? [100, 100, 100] : startScale
		startRotation = typeof startRotation != "object" ? [0, 0, 0] : startRotation
		startColor = typeof startColor != "object" ? [0, 0, 0] : startColor
		startForce = typeof startForce != "object" ? [0, 0, 0] : startForce
		startForceFieldForce = typeof startForceFieldForce != "object" ? [0, 0, 0] : startForceFieldForce
		spawnFrequency = typeof spawnFrequency != "number" ? 1 : spawnFrequency
		maxSpawnCount = typeof maxSpawnCount != "number" ? 1 : maxSpawnCount
		spawnOverTime = typeof spawnOverTime != "boolean" ? false : maxSpawnCount
		burstCount = typeof burstCount != "number" ? 1:burstCount
		const fill = (amount, value, arr) => {
			for (let i = 0; i < amount; i++) {
				arr[i] = value
			}
			return arr;
		}
	this.amount = amount
	this.startPosition = startPosition
	this.vertCount = 4
	this.items = { active: new Map(), inactive : new Map() }
	this.noise = 0
	this.pointCloud = []
	this.startPositionFromgeometry = false
	this.forcefield = fill(amount * 3, Infinity, new Array(amount * 3))
	this.force = new Array(startForce)
	this.forceFieldForce = new Array(startForceFieldForce)
	this.startValues = new Array(3)
	this.maxLifeTime = maxLifeTime
	this.lifeTime = fill(amount, 0, new Array(amount))
	this.attributesoverLifeTime = new Map()
	this.properties = new Map()
	this.spawFrequency =1
	this.maxSpawnCount =100
	this.spawnOverTime =true
	this.waitingtime = 0
	this.burstCount =burstCount
	this.additionalBurstCount =0
	this.evenFunctions =new Map()
	this.particleEventFunctions =new Map()
	
	const dictionaryItemAttributes = {
		distance: -1,
		parent: null
	}
	
		const geometry = mesh.geometry
	//++++++++++++++++++++++++++++  >>initialize objects<<  ++++++++++++++++++++++++++++++++++++
		const instancedGeometry = new THREE.InstancedBufferGeometry()
		this.instance = instancedGeometry
		instancedGeometry.index = geometry.index
		instancedGeometry.maxInstancedCount = this.amount
		instancedGeometry.instanceCount=spawnOverTime==true?maxSpawnCount:Infinity
		//+++++++++++++++++ >>passing the data to the dictionary<< ++++++++++++++++++++++++++++++
		const emissionArray = new Uint8Array(this.amount * 3)
		const colorArray = new Uint8Array(this.amount * 3)
		const morphtargetsArray = new Float32Array(71)
		const morphtargetsInfluencesArray = new Float32Array(this.amount)
		const matrixAttributeArray = []
		//+++++++++++++++++++++++ >>creating the instanceAttributes<<  +++++++++++++++++++++++++++++++++
		const emissiveAttribute = new THREE.InstancedBufferAttribute(emissionArray, 3, true)
		const colorAttribute = new THREE.InstancedBufferAttribute(colorArray, 3, true)
		const morphTargetsAttribute = new THREE.InstancedBufferAttribute(morphtargetsArray, 3, true)
		const morphTargetsinfluencesAttriute = new THREE.InstancedBufferAttribute(morphtargetsInfluencesArray, 1, true)
		emissiveAttribute.dynamic = true
		colorAttribute.dynamic = true
		morphTargetsinfluencesAttriute.dynamic = true
		morphTargetsAttribute.dynamic = true
		instancedGeometry.setAttribute(
			'morphTargetinfluences',
			morphTargetsinfluencesAttriute
		)
		instancedGeometry.setAttribute(
			'morphTargets',
			morphTargetsAttribute
		)
		instancedGeometry.setAttribute(
			'aInstanceColor',
			colorAttribute
		)
		instancedGeometry.setAttribute(
			'aInstanceEmissive',
			emissiveAttribute
		)
		const matArraySize = this.amount * 4
		const matrixArray = [
			new Float32Array(matArraySize),
			new Float32Array(matArraySize),
			new Float32Array(matArraySize),
			new Float32Array(matArraySize),
		]
		Object.keys(geometry.attributes).forEach(attributeName => {
			instancedGeometry.attributes[attributeName] = geometry.attributes[attributeName]
		})
		for (let i = 0; i < matrixArray.length; i++) {
			const attribute = new THREE.InstancedBufferAttribute(matrixArray[i], 4)
			attribute.dynamic = true
			matrixAttributeArray.push(attribute)
			instancedGeometry.setAttribute(
				`aInstanceMatrix${i}`,
				attribute
			)
		}
		const sourceValues = new Map()
		sourceValues.set("transform", [].concat(matrixArray))
		sourceValues.set("color", [].concat(colorArray))
		sourceValues.set("emission", [].concat(emissionArray))
		sourceValues.set("morphTargets", [].concat(morphtargetsArray))
		sourceValues.set("morphTargetInfluences", [].concat(morphtargetsInfluencesArray))
		sourceValues.set("rotation", startRotation)
		sourceValues.set("scale", startScale)
		sourceValues.set("forceFieldForce", startForceFieldForce)
		sourceValues.set("force", startForce);

		this.properties.set("sourceValues", sourceValues)
		this.properties.set("transform", { array: matrixArray, attribute: matrixAttributeArray })
		this.properties.set("color", { array: colorArray, attribute: colorAttribute })
		this.properties.set("emission", { array: emissionArray, attribute: emissiveAttribute })
		this.properties.set("morphTargets", { array: morphtargetsArray, attribute: morphTargetsAttribute })
		this.properties.set("morphTargetInfluences", { array: morphtargetsInfluencesArray, attribute: morphTargetsinfluencesAttriute })

		const intersectsScene = new THREE.Scene()
		//+++++++++++++++++++++ >>create subMesh<< +++++++++++++++++++++++++++
		//instancedGeometry.morphAttributes.position = [ morphTargetsAttribute ];
		for (let i = 0; i < this.amount; i++) {
			const object = mesh
			object.userData.index = i
			const color = new THREE.Color(Math.random() * 0xffffff)
			object.position.x = startPosition[0]
			object.position.y = startPosition[1]
			object.position.z = startPosition[2]
			object.rotation.x = startRotation[0]
			object.rotation.y = startRotation[1]
			object.rotation.z = startRotation[2]
			object.scale.x = startScale[0]
			object.scale.y = startScale[1]
			object.scale.z = startScale[2]
			delete (object.morphTargetsAttribute)
			delete (object.morphTargetsRelative)
			intersectsScene.add(object);
			//object.matrixWorldAutoUpdate = false
			object.updateMatrixWorld()
			for (let r = 0; r < 4; r++)
				for (let c = 0; c < 4; c++)
					matrixArray[r][i * 4 + c] = object.matrixWorld.elements[r * 4 + c] //fetch matrix value
			const colorArrayTemp = color.toArray().map(c => Math.floor(c * 255)) //remap color once
			object.userData.color = colorArrayTemp //store on graph
			if (this.startColor == "random") {
				for (let c = 0; c < 3; c++) {
					colorArray[i * 3 + c] = colorArrayTemp[c]
				}
			} else {
				for (let c = 0; c < 3; c++) {
					colorArray[i * 3 + c] = startColor[c]
				}

			}
			this.items.active.set(i, { ...dictionaryItemAttributes })
		}
		intersectsScene.updateMatrixWorld(true)
		const instanceMaterial = mesh.material

		//	mat4 aInstanceMatrix = mat4(aInstanceMatrix0,aInstanceMatrix1,aInstanceMatrix2,aInstanceMatrix3);
		//vec3 transformed = (aInstanceMatrix * vec4( position , 1. )).xyz;	
		//++++++++++++  >>shader<<  +++++++++++++ 

		instanceMaterial.onBeforeCompile = shader => {
			shader.vertexShader = `
					attribute vec4 aInstanceMatrix0;
					attribute vec4 aInstanceMatrix1;
					attribute vec4 aInstanceMatrix2;
					attribute vec4 aInstanceMatrix3;
					attribute vec3 aInstanceColor;
					attribute vec3 aInstanceEmissive;
					attribute vec3 morphTargets;
					attribute float morphTargetInfluences;
					varying vec3 Position;
					${shader.vertexShader.replace(
				'#include <begin_vertex>', `
				mat4 aInstanceMatrix = mat4(aInstanceMatrix0,aInstanceMatrix1,aInstanceMatrix2,aInstanceMatrix3);
				vec3 transformed = (aInstanceMatrix * vec4( position , 1. )).xyz;	
							`
			)}`
			shader.vertexShader = `
					varying vec3 vInstanceColor;
					varying vec3 vInstanceEmissive;
					varying vec3 vmorphTargets;
					varying float vmorphTargetInfluences;
					${shader.vertexShader.replace(
				`#include <color_vertex>`,
				`#include <color_vertex>
					   vInstanceColor = aInstanceColor;
					   vInstanceEmissive = aInstanceEmissive;
					    `
			)}`
			shader.fragmentShader = `
					varying vec3 vInstanceColor;
					${shader.fragmentShader.replace(
				'vec4 diffuseColor = vec4( diffuse, opacity );',
				'vec4 diffuseColor = vec4( vInstanceColor, opacity );'
			)}`
			shader.fragmentShader = `
					varying vec3 vInstanceEmissive;
					${shader.fragmentShader.replace(
				'vec3 totalEmissiveRadiance = emissive;',
				'vec3 totalEmissiveRadiance = vInstanceEmissive; '
			)}`
			shader.vertexShader = shader.vertexShader.replace(
				`#include  <begin_vertex>'`, `
					  mat4 _aInstanceMatrix = mat4(aInstanceMatrix0,aInstanceMatrix1,aInstanceMatrix2,aInstanceMatrix3);
					  Position = vec3(modelViewMatrix * vec4(position, 1.0));
					  vec3 morphed = vec3( 0.0 , 0 , 0.0 );
					   morphed += ( vmorphTargets - Position )*vmorphTargetInfluences;
					   morphed += position;
					 vec3  transformed = (aInstanceMatrix* vec4( morphed , 1. )).xyz;
					   transformed.x = (aInstanceMatrix0[0] + sin(position.y*100000.0));	
					 `
			)
			shader.vertexShader = shader.vertexShader.replace(
				`#include <beginnormal_vertex>`, `
					  mat4 _aInstanceMatrix = mat4(aInstanceMatrix0,aInstanceMatrix1,aInstanceMatrix2,aInstanceMatrix3);
					  vec3 objectNormal = (_aInstanceMatrix * vec4( normal, 0. ) ).xyz;
					 `
			)
		}
		console.log(instanceMaterial)
		//++++++++++++ >>add initialized instances to scene <<  ++++++++++++++++++
		const instaneMesh = new THREE.Mesh(
			instancedGeometry,
			instanceMaterial
		)
		console.log(instaneMesh)
		scene.add(instaneMesh)
	
}
}