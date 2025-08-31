// Imports
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

// Perspective Camera Setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

camera.position.z = 25;
camera.position.y = 35;
camera.rotation.x = -1;

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
const planeGeometry = new THREE.PlaneGeometry(50, 30);
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
const planeX = 50;
const planeZ = 30;


// Back Wall
createWall(planeX, wallHeight, wallThickness, { x: 0, y: wallHeight / 2, z: -planeZ / 2 }, 0);
// Front Wall
createWall(planeX, wallHeight, wallThickness, { x: 0, y: wallHeight / 2, z: planeZ / 2 }, 0);
// Left Wall
createWall(planeZ, wallHeight, wallThickness, { x: -planeX / 2, y: wallHeight / 2, z: 0 }, Math.PI / 2);
// Right Wall
createWall(planeZ, wallHeight, wallThickness, { x: planeX / 2, y: wallHeight / 2, z: 0 }, Math.PI / 2);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Render Scene
renderer.render(scene, camera);