var orbitals = [2, 6, 10]

var e_colors = [
  0xf4b3b3,
  0xe95d5d,
  0xc91616,
  0x730f0f,
];

var p_colors = [
  0xb4e2f4,
  0x5ec1e8,
  0x1c98c7,
  0x105672
];

var n_colors = [
  0xb4f4d0,
  0x5ee89a,
  0x1cc767,
  0x10723a
];

//
// main code
//
var scene, camera, renderer, controls, resolution, light;
var mouseIsPressed, mouseX, mouseY, pmouseX, pmouseY;
var width, height;
var scenes = [loadScene1, loadScene2, loadScene3];
var index = 0;
var mouseScrollable = false;
scene_objects = [];
var data;

init();

scenes[index]();

//
// init callback
//
function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color("rgb(255, 255, 255)");

  scene_objects = [];
  
  width = window.innerWidth;
  height = window.innerHeight;
  
  camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, -height, height );
  camera.position.set(0, 0, 200);
  camera.lookAt(new THREE.Vector3 (0,0,0));
  
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.sortObjects = false;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( width, height );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.fog = new THREE.Fog( 0x23272a, 0.5, 1700, 4000 );

  window.onload = function() {
      document.body.appendChild(renderer.domElement);
  }
  
  resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
  
  light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
  scene.add( light );
  
}

function clean_scene() {
  scene_objects.forEach((object) => {
      object.remove();
  })
  scene_objects.splice(0, scene_objects.length);
}


function loadScene1() {
  scene_objects.push(new Particle_2D(p_colors, new THREE.Vector3(-100,-100,0), 1, 0.5, 200));
  scene_objects.push(new Particle_2D(p_colors, new THREE.Vector3(100,100,0), 1, 0.5, 200));
  scene_objects.push(new Particle_2D(n_colors, new THREE.Vector3(-100,100,0), 1, 0.5, 200));
  scene_objects.push(new Particle_2D(n_colors, new THREE.Vector3(100,-100,0), 1, 0.5, 200));

  scene_objects.push(new DrawingParticle([300, 0, 0], e_colors[3], 500));
  scene_objects.push(new DrawingParticle([500, 500, 0], e_colors[2], 500));
  
  renderScene1();

}

function renderScene1() {

  scene_objects.forEach((object) => {
      object.draw();
  })

  if (camera.zoom > 0) {
      camera.zoom -= 0.001;
      camera.updateProjectionMatrix();

      requestAnimationFrame( renderScene1 );
  } else {
      loadScene2();
  }

  renderer.render( scene, camera );
}

function loadScene2() {
  clean_scene();
  fetch("./traj_1.json").then(response => response.json()).then((json) => {
      data = json;
      console.log(data.length, data[0].length, data[0][0].length);

      scene_objects.push(new Particles_scattered(data, p_colors[3]));

      renderScene2();
  });
}

function renderScene2() {

  scene_objects.forEach((object) => {
      object.draw();
  })

  camera.zoom = 40;
  camera.position.set(20, 20, 200);
  camera.updateProjectionMatrix();

  if (scene_objects[0].isReady()) {
      loadScene3();
  } else {
      requestAnimationFrame( renderScene2 );
  }

  renderer.render( scene, camera );
}

function loadScene3() {
  clean_scene();
  fetch("traj_4.json").then(response => response.json()).then((json) => {
      for (let i = 0; i < json[0].length; i++) {
          scene_objects.push(new Pendulum(json, i, p_colors[3], p_colors[2]));
      }

      scene_objects.push(new surface([-30, -30, 0], [30, 30], p_colors[1]));

      renderScene3();
  });
}

function renderScene3() {

  if (!scene_objects[0].isReady()) {
    requestAnimationFrame( renderScene3 );
  }

  scene_objects.forEach((object) => {
      object.draw();
  })

  camera.zoom = 8;
  camera.position.set(-10, -20, 20);
  camera.lookAt(new THREE.Vector3(0,0,0));
  camera.updateProjectionMatrix();

  renderer.render( scene, camera );
}