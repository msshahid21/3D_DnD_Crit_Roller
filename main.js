// =========== IMPORTS ===========
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// =========== SET UP THE SCENE, CAMERA, AND RENDERER ===========
// Container for 3D Objects
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 12; // Move the camera back so we can see the objects
camera.position.y = 20;
camera.rotation.x = -1;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'), // Link canvas ID
  antialias: true // Smoothens the edges of objects
});

renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer to full screen
renderer.setPixelRatio(window.devicePixelRatio, 2); // Use device's pixel ratio
renderer.shadowMap.enabled = true; // Enable shadows

// Orbital Controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; // Makes the controls feel smoother

// =========== SET UP PHYSICS ===========
const world = new CANNON.World();
world.gravity.set(0, -9.8, 0); // Set gravity

// =========== MATERIALS ===========
const groundMaterial = new CANNON.Material('ground');
const diceMaterial = new CANNON.Material('dice');

// Define the interaction between the two materials
const contactMaterial = new CANNON.ContactMaterial(
    groundMaterial,
    diceMaterial,
    {
        friction: 0.1,    // How much friction is between the dice and the ground
        restitution: 0.5  // How much the dice will bounce
    }
);
world.addContactMaterial(contactMaterial);


// =========== CREATE OBJECTS ===========
// Array to track objects to update
const objectsToUpdate = [];

// ---- Icosahedron ----
// --- Geometry ---
const icosahedronGeometry = new THREE.IcosahedronGeometry(2, 0);

// --- Material & Mesh ---
const icosahedronMaterial = new THREE.MeshStandardMaterial({ color: 0x1F3D51 });
const icosahedronMesh = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
scene.add(icosahedronMesh);

// --- Physics ---
const icosahedronShape = new CANNON.Sphere(1); // Half of the geometry's size
const icosahedronBody = new CANNON.Body({
    mass: 1, // (0 = Static Object, 1 = Dynamic Object)
    shape: icosahedronShape,
    position: new CANNON.Vec3(0, 7, 0) // Starting position
});
world.addBody(icosahedronBody);

// Add icosahedron to list of objects to update
objectsToUpdate.push({ mesh: icosahedronMesh, body: icosahedronBody });

// ---- The Box ----
// --- Geometry ---
const planeGeometry = new THREE.PlaneGeometry(50, 30);

// --- Material & Mesh ---
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI * 0.5; // Rotate it to be flat
scene.add(planeMesh);

// --- Physics ---
const planeShape = new CANNON.Plane();
const planeBody = new CANNON.Body({
    mass: 0,
    shape: planeShape,
    position: new CANNON.Vec3(0, 0, 0)
});

// Rotate the physics plane to match the visual one
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(planeBody);


// =========== LIGHTS ===========
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);


// =========== ANIMATION LOOP ===========
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // --- Update Physics World ---
    world.step(1 / 60, deltaTime, 3);

    // --- Link Physics to Visuals ---
    // For each object, copy the position and rotation from the physics body
    // to the Three.js mesh.
    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    }
    
    // controls.update();

    // --- Render the Scene ---
    renderer.render(scene, camera);

    // --- Call tick again on the next frame ---
    window.requestAnimationFrame(tick);
};

// Camera position capture
window.addEventListener('keydown', (event) => {
    if (event.key === 'p') { // Press 'p' to print
        console.log('Camera Position:', camera.position);
    }
});

// Start the animation loop!
tick();