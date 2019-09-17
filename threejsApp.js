// import { 
//     PerspectiveCamera,
//     Color,
//     Mesh, 
//     SpotLight, 
//     Scene 
// } from './node_modules/three/build/three';

var scene;
var camera;
var renderer;

var cube;

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
    
    const geom = new THREE.BoxBufferGeometry(2, 2, 2);
    //const mat = new THREE.MeshBasicMaterial();
    const mat = new THREE.MeshStandardMaterial({color: 0xffff00});
    cube = new THREE.Mesh(geom, mat);
    scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 5.0)
    light.position.set(10, 10, 10);
    scene.add(light);
    
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setAnimationLoop(() => {
        update();
        draw();
    });

    container.appendChild(renderer.domElement);


}

var update = function()
{
    cube.rotation.z += 0.01;
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
}

var draw = function()
{
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