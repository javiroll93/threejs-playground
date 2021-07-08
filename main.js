import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const gui = new dat.GUI();
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader;

window.scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  alpha: true,
});


/**
 * Sizes for camera view size
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(sizes.width, sizes.height);
camera.position.setZ(3);

renderer.render(scene, camera);

/**
 * DICE MODEL LOADER
 */
let dice_model = undefined;
let dice_rotation_speed = {
  x: 0,
  y: 0.01,
  z: 0.01
}
loadDice();

let ambientLight, pointLight1, pointLight2;
const pointLightsPalette = {
  light1: 0x49CE28,
  light2: 0xB42607
};
loadLights();
const particles_objs = loadParticles();
scene.add(particles_objs);



loadDebugHelpers();


//Mouse orbit controls
//const controls = new OrbitControls(camera, renderer.domElement);

/**
 * Scroll behaviour
*/
let lastScrollTop = 0
window.addEventListener('scroll', () => {
  console.log('scroll detected')
  var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
  if (st > lastScrollTop) {
    // downscroll
    if (typeof dice_model !== "undefined") {
      dice_model.rotateY(0.05);
      dice_model.rotateX(0.05);
    }
  } else {
    // upscroll
    if (typeof dice_model !== "undefined") {
      dice_model.rotateY(-0.05);
      dice_model.rotateX(-0.05);
    }
  }
  lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
});


///////////////////////
//FRAME UPDATE SCENE//
/////////////////////
function animate() {
  requestAnimationFrame(animate);

  //Main asset movement
  //icosahedron.rotation.y += 0.01;
  if (typeof dice_model !== "undefined") {
    dice_model.rotateY(dice_rotation_speed.y);
    dice_model.rotateZ(dice_rotation_speed.z);
  }
  renderer.render(scene, camera);
}

animate();



/**
 * FUNCITONS
*/

function loadDice() {
  gltfLoader.load('static/textures/dice/scene.gltf',
    (gltf) => {
      dice_model = gltf.scene.children[0];
      dice_model.lookAt(1, 0, 0);
      scene.add(dice_model);
    },
    (progress) => {
      console.log(`${progress.loaded / progress.total} % loaded`);
    },
    (e) => {
      console.error(e);
    }
  );
}


function loadLights() {
  ambientLight = new THREE.AmbientLight(0x404040);
  pointLight1 = new THREE.PointLight(0x8928ce, 10);
  pointLight1.position.set(5, 2, 1);
  pointLight2 = new THREE.PointLight(0xB42607, 20);
  pointLight2.position.set(-5, -2, 1);

  scene.add(ambientLight, pointLight1, pointLight2);
}

function loadParticles() {
  const particles_geometry = new THREE.BufferGeometry;
  const particles_cnt = 1000;
  const posArray = new Float32Array(particles_cnt * 3);
  const star_point = textureLoader.load('./star-point.png');

  for (let i=0; i < particles_cnt * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 5;
  }

  particles_geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particles_material = new THREE.PointsMaterial({
    size: 0.005,
    transparent: true
  });
  
  const particles_mesh = new THREE.Points(particles_geometry, particles_material);
  
  return particles_mesh;
}

//GUI & VISUAL HELPERS
function loadDebugHelpers() {
  const light1_gui_folder = gui.addFolder('Light 1');
  light1_gui_folder.add(pointLight1.position, 'x');
  light1_gui_folder.add(pointLight1.position, 'y');
  light1_gui_folder.add(pointLight1.position, 'z');
  light1_gui_folder.add(pointLight1, 'intensity');
  light1_gui_folder.addColor(pointLightsPalette, 'light1')
    .onChange(() => {
      pointLight1.color.set(pointLightsPalette.light1);
    });

  const light2_gui_folder = gui.addFolder('Light 2');
  light2_gui_folder.add(pointLight2.position, 'x');
  light2_gui_folder.add(pointLight2.position, 'y');
  light2_gui_folder.add(pointLight2.position, 'z');
  light2_gui_folder.add(pointLight2, 'intensity');
  light2_gui_folder.addColor(pointLightsPalette, 'light2')
    .onChange(() => {
      pointLight2.color.set(pointLightsPalette.light2);
    });

  const dice_gui_folder = gui.addFolder('Dice');
  dice_gui_folder.add(dice_rotation_speed, 'y');
  dice_gui_folder.add(dice_rotation_speed, 'z');

  const lightHelper1 = new THREE.PointLightHelper(pointLight1);
  const lightHelper2 = new THREE.PointLightHelper(pointLight2);
  //const gridHelper = new THREE.GridHelper(50, 50);

  scene.add(lightHelper1, lightHelper2);
}
