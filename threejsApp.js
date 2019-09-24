// import { 
//     PerspectiveCamera,
//     Color,
//     Mesh, 
//     SpotLight, 
//     Scene 
// } from './node_modules/three/build/three';

import { RGBELoader } from './node_modules/three/examples/jsm/loaders/RGBELoader.js';

var scene;
var camera;
var renderer;
var textureLoader;
var rgbeTextureLoader;

var controls = {};
var player = {
    turnSpeed: .001,
    speed: .1,
    velocity: 0
};
var keyForward = '87';
var keyBackward= '83';
var keyStrafeLeft = '65';
var keyStrafeRight = '68';

var cube;
var cubeTexture;
var cubeMaterial;

var init = function()
{
    const container = document.querySelector("#scene-container");
    scene = new THREE.Scene();
    scene.background = new THREE.Color('skyblue');

    window.addEventListener('resize', onWindowResize);
    
    const fov = 35;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 100;
    
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 10);
    // camera.position.set(-4, 4, 10);

    controls = new THREE.FirstPersonControls(camera, container);
    // controls = new THREE.FlyControls(camera, container);
    
    document.addEventListener('keydown', ({ keyCode }) => {
        controls[keyCode] = true;
    });
    document.addEventListener('keyup', ({ keyCode }) => {
        controls[keyCode] = false;
    });
    // document.addEventListener('mousemove', ({ event }) => {
    //     if (!event)
    //     {
    //         event = window.event;
    //     }

    //     var x = event.clientX;
    //     var y = event.clientY;

    //     controls.isMouseMoving = true;

    //     controls.prevMouseX = controls.currMouseX;
    //     controls.prevMouseY = controls.currMouseY;
        
    //     controls.currMouseX = x;
    //     controls.currMouseY = y;
    // });

    
    const geom = new THREE.BoxBufferGeometry(2, 2, 2);
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
        map: cubeTexture
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

var update = function()
{
    if (controls[keyBackward])
    {
        console.log("forward");
        camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
        camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
    }
    if (controls[keyForward])
    {
        console.log("backward");
        camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
    }
    if (controls[keyStrafeRight])
    {
        console.log("strafe left");
        camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
    }
    if (controls[keyStrafeLeft])
    {
        console.log("strafe right");
        camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
    }

    // if (controls.isMouseMoving)
    // {
    //     var dx = controls.currMouseX - controls.prevMouseX;
    //     var dy = controls.currMouseY - controls.prevMouseY;

    //     console.log("D(" + dx + "," + dy + ")");

    //     camera.rotation.y += (dy * player.turnSpeed);
    // }
    // controls.isMouseMoving = false;
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

init();
draw();