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
var scene;
var camera;
var renderer;
var textureLoader;
var rgbeTextureLoader;
var fbxLoader;

var controls = {};
var player = {
    turnSpeed: .001,
	speed: 500.0,
	maxSpeed: 10000.0,
	accelerationScalar: 1.005,
	velocity: new THREE.Vector3(),
	direction: new THREE.Vector3()
};
var keyForward = '87';      // 'w'
var keyBackward= '83';      // 's'
var keyStrafeLeft = '65';	// 'a'
var keyStrafeRight = '68';	// 'd'
var keyMoveUp = '81';		// 'q'
var keyMoveDown = '69';		// 'e'
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

var sceneScale = 1;

var init = function()
{
    container = document.querySelector("#scene-container");
	scene = new THREE.Scene();
	// window.scene = scene;
    scene.background = new THREE.Color('skyblue');

    window.addEventListener('resize', onWindowResize);
    
    const fov = 35;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 10000;
    
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(10, 5, 10);
	camera.lookAt(0, 0, 0);

	initControls(container);

	initGrid(-5, 5, 1);
	initGrid(-5, 5, 10);


	// var meshPath = './scene/meshes/rock_b.fbx';
	// var meshPath = './scene/meshes/dancing.fbx';
	// var meshPath = './scene/meshes/Palm_Tree.fbx';
	// loadModel(meshPath, function(object) {
	// 	console.log("Loaded model '" + meshPath + "'");

	// 	//object.scale = new Vector3(0.1, 0.1, 0.1);
	// 	scene.add(object);
	// });

    
    const geom = new THREE.BoxBufferGeometry(10, 10, 10);
    //const mat = new THREE.MeshBasicMaterial();
    const mat = new THREE.MeshStandardMaterial({color: 0xffff00});

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
	httpGetAsync("./scene/ExportManifest.json", function (data) {
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

			var meshPos = {x: 0, y: 10, z: 0};
			for (var i=0; i<sceneData.meshDataList.length; i++)
			{
				var meshData = {};
				loadMesh(sceneData.meshDataList[i], meshData);
				meshList[meshData.id] = meshData;

				var newMesh = new THREE.Mesh(
					meshData.geometry, 
					new THREE.MeshBasicMaterial(
						{
							color: 0x000,
							wireframe: true
						})
					);

				meshPos.x += 10;
				newMesh.position.set(meshPos.x, meshPos.y, meshPos.z);

				scene.add(newMesh);
			}

			for (var i=0; i<sceneData.meshInstanceList.length; i++)
			{
				var inst = sceneData.meshInstanceList[i];
				var newInst = {
					name: inst.name,
					tag: inst.tag,
					meshId: inst.meshId,
					textureId: inst.textureId
				};

				newInst.xform = new THREE.Matrix4();
				newInst.xform.makeBasis(
					inst.xform.right,
					inst.xform.up,
					inst.xform.forward
				);
				newInst.xform.setPosition(inst.xform.position * sceneScale);

				newInst.sceneRef = new THREE.Mesh(
					meshList[newInst.meshId].geometry, 
					new THREE.MeshBasicMaterial(
						{
							color: 0x000,
							// color: 0xffffff,
							// side: THREE.DoubleSide,
							// vertexColors: THREE.VertexColors,
							wireframe: true
						})
					);
				newInst.sceneRef.position.set(inst.xform.position.x, inst.xform.position.y, inst.xform.position.z);
				// scene.add(newInst.sceneRef);

				var boxSize = new THREE.Vector3();
				meshList[newInst.meshId].geometry.boundingBox.getSize(boxSize);
				var boxMesh = new THREE.Mesh(
					new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z),
					new THREE.MeshBasicMaterial({color:0x000, wireframe: true}));
				boxMesh.position.set(inst.xform.position.x, inst.xform.position.y, inst.xform.position.z);
				// scene.add(boxMesh);

				console.log("Pos[" + inst.xform.position.x + ", " + inst.xform.position.y + ", " + inst.xform.position.z + "] [" + boxSize.x + ", " + boxSize.y + ", " + boxSize.z + "]");
				
				meshInstanceList[newInst.meshId] = newInst;
			}
		}
	});
	//////////////////////////////////////////////////////////
	
	// custom mesh ////////////////////////////////////////////////////////////////////////////////
	// *** MOVE THIS TO LOADMODEL() FUNCTION ***
	var mesh;
	var geometry = new THREE.BufferGeometry();
	var positions = [0.43622398376464846, -0.19999998807907105, -0.09186500310897827, 0.3182329833507538, 0.8713930249214172, -0.07845299690961838, 0.09272400289773941, 0.7124689221382141, 0.36972400546073916, -0.41748297214508059, 0.27617397904396059, -0.3247329890727997, -0.1017720028758049, 0.31874901056289675, -0.36397498846054079, -0.4547869861125946, -0.20000001788139344, -0.3599330186843872, 0.16333800554275514, -0.19999998807907105, 0.45219600200653078, 0.09272400289773941, 0.7124689221382141, 0.36972400546073916, -0.2687549889087677, 0.6452930569648743, 0.24261897802352906, 0.43622398376464846, -0.19999998807907105, -0.09186500310897827, 0.28380098938941958, -0.19999998807907105, -0.296550989151001, 0.22846299409866334, 0.8555870056152344, -0.24279800057411195, -0.3621709644794464, 0.26649799942970278, -0.07406900078058243, -0.11200699210166931, 0.5691570043563843, -0.2532989978790283, -0.1017720028758049, 0.31874901056289675, -0.36397498846054079, -0.2687549889087677, 0.6452930569648743, 0.24261897802352906, 0.09272400289773941, 0.7124689221382141, 0.36972400546073916, 0.3182329833507538, 0.8713930249214172, -0.07845299690961838, 0.16333800554275514, -0.19999998807907105, 0.45219600200653078, 0.43622398376464846, -0.19999998807907105, -0.09186500310897827, 0.09272400289773941, 0.7124689221382141, 0.36972400546073916, -0.33065903186798098, -0.19999998807907105, 0.29423898458480837, 0.16333800554275514, -0.19999998807907105, 0.45219600200653078, -0.2687549889087677, 0.6452930569648743, 0.24261897802352906, 0.3182329833507538, 0.8713930249214172, -0.07845299690961838, 0.43622398376464846, -0.19999998807907105, -0.09186500310897827, 0.22846299409866334, 0.8555870056152344, -0.24279800057411195, -0.4547869861125946, -0.20000001788139344, -0.3599330186843872, -0.33065903186798098, -0.19999998807907105, 0.29423898458480837, -0.41748297214508059, 0.27617397904396059, -0.3247329890727997, -0.2687549889087677, 0.6452930569648743, 0.24261897802352906, 0.3182329833507538, 0.8713930249214172, -0.07845299690961838, 0.22846299409866334, 0.8555870056152344, -0.24279800057411195, -0.2687549889087677, 0.6452930569648743, 0.24261897802352906, -0.11200699210166931, 0.5691570043563843, -0.2532989978790283, -0.3786419630050659, 0.5216950178146362, -0.07245299965143204, -0.2687549889087677, 0.6452930569648743, 0.24261897802352906, -0.3786419630050659, 0.5216950178146362, -0.07245299965143204, -0.33065903186798098, -0.19999998807907105, 0.29423898458480837, 0.22846299409866334, 0.8555870056152344, -0.24279800057411195, 0.28380098938941958, -0.19999998807907105, -0.296550989151001, -0.1017720028758049, 0.31874901056289675, -0.36397498846054079, 0.22846299409866334, 0.8555870056152344, -0.24279800057411195, -0.11200699210166931, 0.5691570043563843, -0.2532989978790283, -0.2687549889087677, 0.6452930569648743, 0.24261897802352906, -0.33065903186798098, -0.19999998807907105, 0.29423898458480837, -0.3621709644794464, 0.26649799942970278, -0.07406900078058243, -0.41748297214508059, 0.27617397904396059, -0.3247329890727997, -0.3621709644794464, 0.26649799942970278, -0.07406900078058243, -0.1017720028758049, 0.31874901056289675, -0.36397498846054079, -0.41748297214508059, 0.27617397904396059, -0.3247329890727997, -0.11200699210166931, 0.5691570043563843, -0.2532989978790283, 0.22846299409866334, 0.8555870056152344, -0.24279800057411195, -0.1017720028758049, 0.31874901056289675, -0.36397498846054079, -0.3786419630050659, 0.5216950178146362, -0.07245299965143204, -0.11200699210166931, 0.5691570043563843, -0.2532989978790283, -0.3621709644794464, 0.26649799942970278, -0.07406900078058243, -0.4547869861125946, -0.20000001788139344, -0.3599330186843872, -0.1017720028758049, 0.31874901056289675, -0.36397498846054079, 0.28380098938941958, -0.19999998807907105, -0.296550989151001, -0.3786419630050659, 0.5216950178146362, -0.07245299965143204, -0.3621709644794464, 0.26649799942970278, -0.07406900078058243, -0.33065903186798098, -0.19999998807907105, 0.29423898458480837];
	var indices = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62];
	var normals = [0.8763512969017029, 0.09058903902769089, 0.4730771481990814,0.8763512969017029, 0.09058903902769089, 0.4730771481990814,0.8763512969017029, 0.09058903902769089, 0.4730771481990814,-0.13399899005889893, 0.08349400013685227, -0.9874579310417175,-0.13399899005889893, 0.08349400013685227, -0.9874579310417175,-0.13399899005889893, 0.08349400013685227, -0.9874579310417175,-0.3407970070838928, 0.05843499302864075, 0.9383190274238586,-0.3407970070838928, 0.05843499302864075, 0.9383190274238586,-0.3407970070838928, 0.05843499302864075, 0.9383190274238586,0.7999498248100281, 0.07227098196744919, -0.595698893070221,0.7999498248100281, 0.07227098196744919, -0.595698893070221,0.7999498248100281, 0.07227098196744919, -0.595698893070221,-0.7428157329559326, 0.24501992762088777, -0.6230489015579224,-0.7428157329559326, 0.24501992762088777, -0.6230489015579224,-0.7428157329559326, 0.24501992762088777, -0.6230489015579224,-0.24943795800209046, 0.9454059600830078, 0.2097339630126953,-0.24943795800209046, 0.9454059600830078, 0.2097339630126953,-0.24943795800209046, 0.9454059600830078, 0.2097339630126953,0.888534426689148, 0.1090429276227951, 0.4456636905670166,0.888534426689148, 0.1090429276227951, 0.4456636905670166,0.888534426689148, 0.1090429276227951, 0.4456636905670166,-0.3035810887813568, 0.08021103590726853, 0.9494234323501587,-0.3035810887813568, 0.08021103590726853, 0.9494234323501587,-0.3035810887813568, 0.08021103590726853, 0.9494234323501587,0.8689038753509522, 0.10175498574972153, -0.48440900444984438,0.8689038753509522, 0.10175498574972153, -0.48440900444984438,0.8689038753509522, 0.10175498574972153, -0.48440900444984438,-0.9805144667625427, 0.06306102871894837, 0.18605008721351624,-0.9805144667625427, 0.06306102871894837, 0.18605008721351624,-0.9805144667625427, 0.06306102871894837, 0.18605008721351624,-0.3183201253414154, 0.9443383812904358, 0.08305003494024277,-0.3183201253414154, 0.9443383812904358, 0.08305003494024277,-0.3183201253414154, 0.9443383812904358, 0.08305003494024277,-0.3277939260005951, 0.9127659201622009, -0.243740975856781,-0.3277939260005951, 0.9127659201622009, -0.243740975856781,-0.3277939260005951, 0.9127659201622009, -0.243740975856781,-0.9507812261581421, 0.08777803182601929, 0.29717010259628298,-0.9507812261581421, 0.08777803182601929, 0.29717010259628298,-0.9507812261581421, 0.08777803182601929, 0.29717010259628298,0.25281408429145815, 0.062419019639492038, -0.9654993414878845,0.25281408429145815, 0.062419019639492038, -0.9654993414878845,0.25281408429145815, 0.062419019639492038, -0.9654993414878845,-0.6076409220695496, 0.7334520220756531, -0.3046649992465973,-0.6076409220695496, 0.7334520220756531, -0.3046649992465973,-0.6076409220695496, 0.7334520220756531, -0.3046649992465973,-0.97005695104599, 0.10672400146722794, 0.21817299723625184,-0.97005695104599, 0.10672400146722794, 0.21817299723625184,-0.97005695104599, 0.10672400146722794, 0.21817299723625184,-0.1253119856119156, 0.9899289011955261, 0.06586198508739472,-0.1253119856119156, 0.9899289011955261, 0.06586198508739472,-0.1253119856119156, 0.9899289011955261, 0.06586198508739472,-0.2899899482727051, 0.37694889307022097, -0.8796676993370056,-0.2899899482727051, 0.37694889307022097, -0.8796676993370056,-0.2899899482727051, 0.37694889307022097, -0.8796676993370056,-0.5573041439056397, -0.030715005472302438, -0.8297401070594788,-0.5573041439056397, -0.030715005472302438, -0.8297401070594788,-0.5573041439056397, -0.030715005472302438, -0.8297401070594788,0.08531703054904938, -0.06580502539873123, -0.9941784143447876,0.08531703054904938, -0.06580502539873123, -0.9941784143447876,0.08531703054904938, -0.06580502539873123, -0.9941784143447876,-0.9979149699211121, -0.06443200260400772, 0.003771000076085329,-0.9979149699211121, -0.06443200260400772, 0.003771000076085329,-0.9979149699211121, -0.06443200260400772, 0.003771000076085329];
	var colors = [];

	for(var i=0; i<positions.length; i++)
	{
		positions[i] = positions[i] * sceneScale;
	}

	// positions.push(-10, -10, 0);
	// positions.push( 10, -10, 0);
	// positions.push( 10,  10, 0);
	// positions.push(-10,  10, 0);

	// normals.push(0, 0, 1);
	// normals.push(0, 0, 1);
	// normals.push(0, 0, 1);
	// normals.push(0, 0, 1);

	// // colors.push(1, 0.25, 0.25);
	// // colors.push(0.25, 1, 0.25);
	// // colors.push(0.25, 0.25, 1);
	// colors.push(1, 0.0, 0.0);
	// colors.push(0.0, 1, 0.0);
	// colors.push(0.0, 0.0, 1);
	// colors.push(1, 1, 1);

	// indices.push(0, 1, 2);
	// indices.push(0, 2, 3);


	geometry.setIndex(indices);
	geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3).onUpload(disposeArray));
	geometry.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3).onUpload(disposeArray));
	// geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3).onUpload(disposeArray));
	geometry.computeBoundingSphere();

	// var customMat = new THREE.MeshPhongMaterial(
	// {
	// 	side: THREE.DoubleSide,
	// 	vertexColors: THREE.VertexColors
	// });
	var customMat = new THREE.MeshBasicMaterial(
		{
			side: THREE.DoubleSide,
			vertexColors: THREE.VertexColors,
			wireframe: true
		});

	mesh = new THREE.Mesh(
		geometry, 
		new THREE.MeshBasicMaterial({color:0x000, wireframe: true}));
	scene.add(mesh);
	//////////////////////////////////////////////////////////////////////////////////


	var testCubeGeo = new THREE.BoxGeometry(15, 15, 15);
	var lineMat = new THREE.MeshBasicMaterial({
		wireframe: true,
		color: 0x000
	});
	var testCubeMesh = new THREE.Mesh(testCubeGeo, lineMat);
	testCubeMesh.position.set(0, 20, 0);
	scene.add(testCubeMesh);


    const light = new THREE.DirectionalLight(0xffffff, 5.0)
    light.position.set(10, 10, 10);
    scene.add(light);
    
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

function disposeArray()
{
	this.array = null;
}
var loadMesh = function(data, meshOutput)
{
	meshOutput.name = data.name;
	meshOutput.id = data.id;

	// Vertices
	meshOutput.verts = [];
	for (var v=0; v<data.verts.length; v++)
	{
		meshOutput.verts.push(data.verts[v].x * sceneScale, data.verts[v].y * sceneScale, data.verts[v].z * sceneScale);
	}
	
	// Vertex Indices
	meshOutput.indices = [];
	meshOutput.indices.push(data.indices);
	
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
}

var processInput = function()
{
	moveUp = moveDown = moveForward = moveBackward = strafeLeft = strafeRight = false;

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
    renderer.render(scene, camera);
}

var onWindowResize = function()
{
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight)
}

var initControls = function(container) 
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

	scene.add(controls.getObject());
}

var initGrid = function(start, stop, scale)
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
		scene.add(line);
		
		// Z-Axis
		lineGeom = new THREE.Geometry();
		lineGeom.vertices.push(new THREE.Vector3(-5 * scale, 0, i * scale));
		lineGeom.vertices.push(new THREE.Vector3(5 * scale, 0, i * scale));
		line = new THREE.Line(lineGeom, gridMaterial);
		scene.add(line);
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
		scene.add(line);
		
		// Z-Axis
		lineGeom = new THREE.Geometry();
		lineGeom.vertices.push(new THREE.Vector3(-5 * scale, 0, i * scale));
		lineGeom.vertices.push(new THREE.Vector3(5 * scale, 0, i * scale));
		line = new THREE.Line(lineGeom, gridMaterial);
		scene.add(line);
	}
}

init();
draw();
