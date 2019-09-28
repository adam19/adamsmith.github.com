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
    speed: .1,
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
	camera.position.set(100, 50, 100);
	camera.lookAt(0, 0, 0);

	initControls(container);

	initGrid(-5, 5, 10);
	initGrid(-5, 5, 100);


	// var meshPath = './scene/meshes/rock_b.fbx';
	// var meshPath = './scene/meshes/dancing.fbx';
	var meshPath = './scene/meshes/Palm_Tree.fbx';
	loadModel(meshPath, function(object) {
		console.log("Loaded model '" + meshPath + "'");

		//object.scale = new Vector3(0.1, 0.1, 0.1);
		scene.add(object);
	});

    
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
    scene.add(cube);


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

var loadModel = function(path, success)
{
	if (!fbxLoader)
	{
		fbxLoader = new FBXLoader();
	}
	
	fbxLoader.load(path, function(object) {
		console.log("Loaded object!");
		success(object);
	}, function(progress) {
		console.log("Progress: " + (100.0 * progress.loaded / progress.total) + "%");
	}), function(error) {
		console.log("Error: " + error);
	};
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

	if (moveForward || moveBackward)
	{
		player.velocity.z += player.direction.z * 300.0 * delta;
	}
	if (strafeLeft || strafeRight)
	{
		player.velocity.x -= player.direction.x * 300.0 * delta;
	}
	if (moveUp || moveDown)
	{
		player.velocity.y += player.direction.y * 300.0 * delta;
	}

	if (player.velocity.length() > 300.0)
	{
		player.velocity = player.velocity.normalize() * 300.0;
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
