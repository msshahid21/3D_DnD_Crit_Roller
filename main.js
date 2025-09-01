// Imports
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Fixed Parameters
const planeX = window.innerWidth / 25;
const planeZ = window.innerHeight / 25;

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

// Perspective Camera Setup
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);

const fov = camera.fov * (Math.PI / 180);
const aspectRatio = window.innerWidth / window.innerHeight;

const heightForPlaneZ = (planeZ / 2) / Math.tan(fov / 2);
const heightForPlaneX = (planeX / 2) / (aspectRatio * Math.tan(fov / 2));

const cameraHeight = Math.max(heightForPlaneZ, heightForPlaneX);

camera.position.set(0, cameraHeight, 0);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer(
    {
        canvas: document.querySelector('#bg'),
        antialias: true
    }
);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio, 2);

// Physics
const world = new CANNON.World();
world.gravity.set(0, -9.8, 0);

// Objects
const objectsToUpdate = [];

// Dice Tray - Plane
// Geometry, Material, and Mesh
const planeGeometry = new THREE.PlaneGeometry(planeX, planeZ);
const planeMaterial = new THREE.MeshStandardMaterial({color: 0x755846});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI * 0.5;
scene.add(planeMesh);

// Physics
const planeShape = new CANNON.Plane();
const planeBody = new CANNON.Body({
        mass: 0,
        shape: planeShape
    }
);

planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(planeBody);

// Dice Tray - Walls
const wallMaterial = new THREE.MeshStandardMaterial({color: 0x0A0A0A});

// Function To Create Walls
/**
 * Creates a single wall for the dice tray.
 * @param {number} width - The width of the wall.
 * @param {number} height - The height of the wall.
 * @param {number} depth - The depth of the wall.
 * @param {object} position - An object with x, y, z coordinates.
 * @param {number} rotationY - The rotation of the wall on the Y axis.
 */

const createWall = (width, height, depth, position, rotationY) => {
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

    wallMesh.position.set(position.x, position.y, position.z);
    wallMesh.rotation.y = rotationY;
    scene.add(wallMesh);

    const wallShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const wallBody = new CANNON.Body(
        {
            mass: 0, 
            material: wallMaterial
        }
    );
    
    wallBody.addShape(wallShape);
    wallBody.position.set(position.x, position.y, position.z);
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationY);
    world.addBody(wallBody);
}

// Call the function to create the four walls of the tray
const wallHeight = 3;
const wallThickness = 0.3;

// Back Wall
createWall(planeX + wallThickness, wallHeight, wallThickness, { x: 0, y: wallHeight / 2, z: -planeZ / 2 }, 0);
// Front Wall
createWall(planeX + wallThickness, wallHeight, wallThickness, { x: 0, y: wallHeight / 2, z: planeZ / 2 }, 0);
// Left Wall
createWall(planeZ, wallHeight, wallThickness, { x: -planeX / 2, y: wallHeight / 2, z: 0 }, Math.PI / 2);
// Right Wall
createWall(planeZ, wallHeight, wallThickness, { x: planeX / 2, y: wallHeight / 2, z: 0 }, Math.PI / 2);

// D20 Dice - Icosahedron
// Geometry, Material and Mesh
const icosahedronGeometry = new THREE.IcosahedronGeometry(2, 0);
const icosahedronMaterial = new THREE.MeshStandardMaterial({color: 0x1F3D51});
const icosahedronMesh = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
scene.add(icosahedronMesh);

// Physics
const icosahedronShape = new CANNON.Sphere(1);
const icosahedronBody = new CANNON.Body(
    {
        mass: 1,
        shape: icosahedronShape,
        position: new CANNON.Vec3(10, 10, 0)
    }
);

world.addBody(icosahedronBody);

// Add Icosahedron to list of objects to update
objectsToUpdate.push(
    {
        mesh: icosahedronMesh,
        body: icosahedronBody
    }
);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Animation Loop
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // Update physics world
    world.step(1 / 60, deltaTime, 3);

    // Link to visuals
    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    }
}

// Render Scene
renderer.render(scene, camera);

// Call tick again on the next frame
window.requestAnimationFrame(tick);
tick();