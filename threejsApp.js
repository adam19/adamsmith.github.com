// import { 
//     PerspectiveCamera,
//     Color,
//     Mesh, 
//     SpotLight, 
//     Scene 
// } from './node_modules/three/build/three';

const container = document.querySelector("#scene-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color('skyblue');

const fov = 35;
const aspect = container.clientWidth / container.clientHeight;
const near = 0.1;
const far = 100;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 10);

const geom = new THREE.BoxBufferGeometry(2, 2, 2);
const mat = new THREE.MeshBasicMaterial();
const mesh = new THREE.Mesh(geom, mat);
scene.add(mesh);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

container.appendChild(renderer.domElement);

renderer.render(scene, camera);
