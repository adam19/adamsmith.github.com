// import { 
//     PerspectiveCamera,
//     Color,
//     Mesh, 
//     SpotLight, 
//     Scene 
// } from './node_modules/three/build/three';

import { RGBELoader } from './node_modules/three/examples/jsm/loaders/RGBELoader.js';
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';


var container;
var sceneRoot;
var renderer;
var textureLoader;
var rgbeTextureLoader;
var fbxLoader;

var cameraManager = {
	selectedCamera: null,
	cameraIndex: 0,
	cameraList: [],
	addCamera: function(newCamera)
	{
		if (newCamera != null)
		{
			this.cameraList.push(newCamera);
			this.selectedCamera = this.cameraList[this.cameraList.length - 1];
		}
	},
	selectCamera: function(camIndex)
	{
		if (camIndex > -1 && camIndex < this.cameraList.length)
		{
			this.cameraIndex = camIndex;
			this.selectedCamera = this.cameraList[this.cameraIndex];
		}
	},
	nextCamera: function()
	{
		this.cameraIndex++;
		this.cameraIndex = (this.cameraIndex >= this.cameraList.length) ? 0 : this.cameraIndex;

		this.selectedCamera = this.cameraList[this.cameraIndex];
	},
	prevCamera: function()
	{
		this.cameraIndex--;
		this.cameraIndex = (this.cameraIndex < 0) ? this.cameraList.length - 1 : this.cameraIndex;

		this.selectedCamera = this.cameraList[this.cameraIndex];
	}
};

var controls = {};
var player = {
    turnSpeed: .001,
	speed: 500.0,
	maxSpeed: 10000.0,
	accelerationScalar: 1.005,
	velocity: new THREE.Vector3(),
	direction: new THREE.Vector3(),
	camera: 0
};
var keyForward = '87';      		// 'w'
var keyBackward= '83';      		// 's'
var keyStrafeLeft = '65';			// 'a'
var keyStrafeRight = '68';			// 'd'
var keyMoveUp = '81';				// 'q'
var keyMoveDown = '69';				// 'e'
var keyCameraToggle = '67';			// 'c'
var keyMaterialWireframe = '90';	// 'z'
var keyMaterialTextured = '88';		// 'x'
var moveUp = false;
var moveDown = false;
var moveForward = false;
var moveBackward = false;
var strafeLeft = false;
var strafeRight = false;
var prevTime = 0;

var cube;
var cubeTexture;
var cubeMaterial;

var materialMode = 'wireframe';

var init = function()
{
    container = document.querySelector("#scene-container");
	sceneRoot = new THREE.Scene();
	// window.scene = scene;
    sceneRoot.background = new THREE.Color('skyblue');

    window.addEventListener('resize', onWindowResize);
    
    const fov = 35;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 10000;
    
    player.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	player.camera.position.set(10, 5, 10);
	player.camera.lookAt(0, 0, 0);
	cameraManager.addCamera(player.camera);


	initControls(container, player.camera);

	var gridGroup = new THREE.Group();
	initGrid(gridGroup, -5, 5, 1);
	initGrid(gridGroup, -5, 5, 10);
	gridGroup.name = "Grid";
	sceneRoot.add(gridGroup);
    
    const geom = new THREE.BoxBufferGeometry(10, 10, 10);
    //const mat = new THREE.MeshBasicMaterial();
    // const mat = new THREE.MeshStandardMaterial({color: 0xffff00});

    textureLoader = new THREE.TextureLoader();
    rgbeTextureLoader = new RGBELoader();
    rgbeTextureLoader.setType(THREE.FloatType);

    // cubeTexture = textureLoader.load('./scene/textures/rocks_albedo_a.png');
    cubeTexture = rgbeTextureLoader.load('./scene/textures/sunset.hdr');
    cubeTexture.encoding = THREE.sRGBEncoding;
    cubeTexture.anisotropy = 16;
    cubeMaterial = new THREE.MeshStandardMaterial({
		map: cubeTexture,
		wireframe: true
    });
    
    cube = new THREE.Mesh(geom, cubeMaterial);
	// scene.add(cube);

	// custom mesh loader ////////////////////////////////////
	// var scenePath = "./scene/CubeScene/ExportManifest.json";
	// var scenePath = "./scene/CaveScene/ExportManifest.json";
	var scenePath = "./scene/ShaderTestScene/ExportManifest.json";
	httpGetAsync(scenePath, function (data) {
		if (data)
		{
			console.log("Success!");

			var sceneData = JSON.parse(data);

			console.log("Num Meshes = " + sceneData.meshDataList.length);
			console.log("Num Mesh Instances = " + sceneData.meshInstanceList.length);
			console.log("Num Cameras = " + sceneData.cameraList.length);
			console.log("Num Lights = " + sceneData.lightList.length);
			console.log("Num Textures = " + sceneData.textureAssetList.length);
			console.log("Num Other Items = " + sceneData.otherItemsList.length);

			var meshList = [];
			var meshInstanceList = [];
			var cameraList = [];
			var lightList = [];
			var textureList = [];
			var otherItemsList = [];

			// Meshes
			for (var i=0; i<sceneData.meshDataList.length; i++)
			{
				var meshData = loadGeometry(sceneData.meshDataList[i]);
				meshList[meshData.id] = meshData;

				var newMesh = new THREE.Mesh(
					meshData.geometry,
					new THREE.MeshBasicMaterial(
						{
							color: 0x000,
							wireframe: true
						})
					);

				newMesh.name = "loaded " + sceneData.meshDataList[i].name;
			}

			for (var i=0; i<sceneData.meshInstanceList.length; i++)
			{
				var inst = sceneData.meshInstanceList[i];
				var newInst = {
					name: inst.name,
					tag: inst.tag,
					meshId: inst.meshId,
					textureId: inst.textureId,
					scale: inst.scale
				};

				newInst.xform = new THREE.Matrix4();
				newInst.xform.makeBasis(
					inst.xform.right,
					inst.xform.up,
					inst.xform.forward
				);
				newInst.xform.setPosition(inst.xform.position.x, inst.xform.position.y, inst.xform.position.z);

				// newInst.sceneRef = new THREE.Mesh(
				// 	meshList[newInst.meshId].geometry, 
				// 	new THREE.MeshBasicMaterial(
				// 		{
				// 			color: 0xff0000,
				// 			// color: 0xffffff,
				// 			// side: THREE.DoubleSide,
				// 			// vertexColors: THREE.VertexColors,
				// 			wireframe: true
				// 		})
				// 	);
				newInst.sceneRef = new THREE.Mesh(
					meshList[newInst.meshId].geometry, 
					new THREE.MeshLambertMaterial(
						{
							color: 0xfff,
							// side: THREE.DoubleSide,
							// vertexColors: THREE.VertexColors,
							wireframe: false
						})
					);

				// Set transform
				newInst.sceneRef.position.setFromMatrixPosition(newInst.xform);
				newInst.sceneRef.quaternion.setFromRotationMatrix(newInst.xform);
				newInst.sceneRef.scale.set(newInst.scale.x, newInst.scale.y, newInst.scale.z);
				newInst.sceneRef.name = newInst.name;

				sceneRoot.add(newInst.sceneRef);
				
				meshInstanceList[newInst.meshId] = newInst;
			}

			// Camera list
			// ToDo: 
			// cameraManager.addCamera(newCamera);

			// Lights
			for (var i=0; i<sceneData.lightList.length; i++)
			{
				var inst = sceneData.lightList[i];

				var xform = new THREE.Matrix4();
				xform = xform.makeBasis(
					inst.xform.right,
					inst.xform.up,
					inst.xform.forward
				);
				xform.setPosition(inst.xform.position.x, inst.xform.position.y, inst.xform.position.z);
				inst.xform = xform;

				var light = null;
				switch(inst.type)
				{
					case "Directional":
						light = new THREE.DirectionalLight(inst.color, inst.intensity);
						light.name = inst.name;

						var lightPos = inst.xform.getPosition();
						light.position.set(lightPos.x, lightPos.y, lightPos.z);

						var lightTarget = new THREE.Object3D();
						var dir = new THREE.Vector3(inst.direction.x, inst.direction.y, inst.direction.z);
						var targetPos = lightPos.add(dir);
						lightTarget.position.set(targetPos.x, targetPos.y, targetPos.z);
						scene.add(lightTarget);
						light.target = lightTarget;

						console.log("Directional Light: {" + inst.color + "} @ " + inst.intensity);
						break;
					// case "Spot":
					// 	light = new THREE.SpotLight(inst.color, inst.intensity, );
					// 	break;
				}

				sceneRoot.add(light);
			}
		}
	});
	//////////////////////////////////////////////////////////
    
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.gammaFactor = 2.2;
	renderer.gammaOutput = true;

    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.0;

    renderer.setAnimationLoop(() => {
        update();
        draw();
    });

    container.appendChild(renderer.domElement);
}

var LoadTestGeom = function(data)
{	
	var positions = [0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5];
	var indices = [0, 2, 3, 0, 3, 1, 8, 4, 5, 8, 5, 9, 10, 6, 7, 10, 7, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];
	var normals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0];
	var colors = [];

	for(var i=0; i<positions.length; i++)
	{
		positions[i] = positions[i];
	}

	var newGeom = new THREE.BufferGeometry();
	newGeom.setIndex(indices);
	newGeom.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3).onUpload(disposeArray));
	newGeom.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3).onUpload(disposeArray));
	newGeom.computeBoundingSphere();

	return newGeom;
}

function disposeArray()
{
	this.array = null;
}
var loadGeometry = function(data)
{
	var meshOutput = {};

	meshOutput.name = data.name;
	meshOutput.id = data.id;

	// Vertices
	meshOutput.verts = [];
	for (var v=0; v<data.verts.length; v++)
	{
		meshOutput.verts.push(data.verts[v].x, data.verts[v].y, data.verts[v].z);
	}
	
	// Vertex Indices
	meshOutput.indices = data.indices;
	
	// Vertex Normals
	meshOutput.vertNormals = [];
	for (var v=0; v<data.vertNormals.length; v++)
	{
		meshOutput.vertNormals.push(data.vertNormals[v].x, data.vertNormals[v].y, data.vertNormals[v].z);
	}
	
	// Vertex Colors
	if (data.vertColors.length == data.verts.length)
	{
		meshOutput.vertColors = [];
		for (var v=0; v<data.verts.length; v++)
		{
			meshOutput.vertColors.push(data.vertColors[v].x, data.vertColors[v].y, data.vertColors[v].z);
		}
	}
	
	// Texture Coordinates
	meshOutput.uvs0 = [];
	for (var v=0; v<data.uvs0.length; v++)
	{
		meshOutput.uvs0.push(data.uvs0[v].x, data.uvs0[v].y);
	}

	// Construct the geometry
	meshOutput.geometry = new THREE.BufferGeometry();
	meshOutput.geometry.setIndex(meshOutput.indices);
	meshOutput.geometry.addAttribute('position', new THREE.Float32BufferAttribute(meshOutput.verts, 3).onUpload(disposeArray));
	meshOutput.geometry.addAttribute('normal', new THREE.Float32BufferAttribute(meshOutput.vertNormals, 3).onUpload(disposeArray));
	
	if (meshOutput.vertColors != null && meshOutput.vertColors.length > 0)
	{
		meshOutput.geometry.addAttribute('color', new THREE.Float32BufferAttribute(meshOutput.vertColors, 3).onUpload(disposeArray));
	}

	meshOutput.geometry.computeBoundingSphere();
	meshOutput.geometry.computeBoundingBox();

	return meshOutput;
}

var processInput = function()
{
	moveUp = moveDown = moveForward = moveBackward = strafeLeft = strafeRight = false;

	// Movement
    if (controls[keyBackward])
    {
		moveForward = true;
    }
    if (controls[keyForward])
    {
		moveBackward = true;
    }
    if (controls[keyStrafeRight])
    {
		strafeRight = true;
    }
    if (controls[keyStrafeLeft])
    {
		strafeLeft = true;
	}
	if (controls[keyMoveUp])
	{
		moveUp = true;
	}
	if (controls[keyMoveDown])
	{
		moveDown = true;
	}
	if (controls[keyCameraToggle])
	{
		cameraManager.nextCamera();
	}

	// Material Swapping
	if (controls[keyMaterialWireframe])
	{
		materialMode = 'wireframe';
		
		for (var i=0; i<sceneRoot.children.length; i++)
		{
			if (sceneRoot.children[i].material != null && sceneRoot.children[i].material.wireframe != undefined)
			{
				sceneRoot.children[i].material.wireframe = true;
			}
		}
	}
	if (controls[keyMaterialTextured])
	{
		materialMode = 'textured';
		
		for (var i=0; i<sceneRoot.children.length; i++)
		{
			if (sceneRoot.children[i].material != null && sceneRoot.children[i].material.wireframe != undefined)
			{
				sceneRoot.children[i].material.wireframe = false;
			}
		}
	}
}

var handleMovement = function()
{
	var time = performance.now();
	var delta = (time - prevTime) / 1000.0;

	player.velocity.x -= player.velocity.x * delta * 10.0;
	player.velocity.y -= player.velocity.y * delta * 10.0;
	player.velocity.z -= player.velocity.z * delta * 10.0;
	player.direction.z = Number(moveForward) - Number(moveBackward);
	player.direction.y = Number(moveUp) - Number(moveDown);
	player.direction.x = Number(strafeRight) - Number(strafeLeft);
	player.direction.normalize();

	// Adjust the player speed
	// if (moveForward || moveBackward || strafeLeft || strafeRight || moveUp || moveDown)
	// {
	// 	player.speed = player.speed * player.accelerationScalar;
	// }
	// else
	// {
	// 	player.speed = player.minSpeed;
	// }

	if (moveForward || moveBackward)
	{
		player.velocity.z += player.direction.z * player.speed * delta;
	}
	if (strafeLeft || strafeRight)
	{
		player.velocity.x -= player.direction.x * player.speed * delta;
	}
	if (moveUp || moveDown)
	{
		player.velocity.y += player.direction.y * player.speed * delta;
	}

	if (player.velocity.length() > player.speed)
	{
		player.velocity = player.velocity.normalize() * player.speed;
	}

	controls.moveRight(-player.velocity.x * delta);
	controls.moveForward(-player.velocity.z * delta);
	controls.moveUp(-player.velocity.y * delta);

	prevTime = time;
}

var update = function()
{
	processInput();
	handleMovement();
}

var draw = function()
{
	renderer.toneMappingExposure = 2.0;
	renderer.render(sceneRoot, cameraManager.selectedCamera);
}

var onWindowResize = function()
{
	// ToDo: fix this to update every camera in the cameraManager list
    selectedCamera.aspect = container.clientWidth / container.clientHeight;
    selectedCamera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight)
}

var initControls = function(container, camera) 
{
	controls = new THREE.PointerLockControls(camera, container);

	controls.addEventListener('lock', function () {
		console.log("controls locked");
	});

	controls.addEventListener('unlock', function () {
		console.log("controls unlocked");
	});

	document.addEventListener('mousedown', function () {
		controls.lock();
	});

	document.addEventListener('mouseup', function () {
		controls.unlock();
	});

	document.addEventListener('keydown', ({ keyCode }) => {
		controls[keyCode] = true;
	});

	document.addEventListener('keyup', ({ keyCode }) => {
		controls[keyCode] = false;
	});

	sceneRoot.add(controls.getObject());
}

var initGrid = function(group, start, stop, scale)
{
	var gridMaterial = new THREE.LineBasicMaterial({ color: 0x404040 });
	var scale;
	scale = 10;
	for (var i=start; i<=stop; i++)
	{
		var line, lineGeom;

		// X-axis
		lineGeom = new THREE.Geometry();
		lineGeom.vertices.push(new THREE.Vector3(i * scale, 0, -5 * scale));
		lineGeom.vertices.push(new THREE.Vector3(i * scale, 0, 5 * scale));
		line = new THREE.Line(lineGeom, gridMaterial);
		group.add(line);
		
		// Z-Axis
		lineGeom = new THREE.Geometry();
		lineGeom.vertices.push(new THREE.Vector3(-5 * scale, 0, i * scale));
		lineGeom.vertices.push(new THREE.Vector3(5 * scale, 0, i * scale));
		line = new THREE.Line(lineGeom, gridMaterial);
		group.add(line);
	}

	scale = 100;
	for (var i=start; i<=stop; i++)
	{
		var line, lineGeom;

		// X-axis
		lineGeom = new THREE.Geometry();
		lineGeom.vertices.push(new THREE.Vector3(i * scale, 0, -5 * scale));
		lineGeom.vertices.push(new THREE.Vector3(i * scale, 0, 5 * scale));
		line = new THREE.Line(lineGeom, gridMaterial);
		group.add(line);
		
		// Z-Axis
		lineGeom = new THREE.Geometry();
		lineGeom.vertices.push(new THREE.Vector3(-5 * scale, 0, i * scale));
		lineGeom.vertices.push(new THREE.Vector3(5 * scale, 0, i * scale));
		line = new THREE.Line(lineGeom, gridMaterial);
		group.add(line);
	}
}

init();
draw();

window.scene = sceneRoot;