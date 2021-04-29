import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from '@avatsaev/three-orbitcontrols-ts'

interface scenePropsType {
  width: number,
  height: number,
  camera: THREE.Camera,
  lights: Array<THREE.Light>,
  meshes: Array<THREE.Mesh | THREE.Points>,
  color?: string
}

const ThreeScene : React.FC<scenePropsType> = (props : scenePropsType) => {
  const canvas = useRef<HTMLDivElement>(null);

  const {width, height, camera, lights, meshes, color} = props;

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({antialias: true});

  const renderScene = () : void => {
    requestAnimationFrame( renderScene );

    renderer.render( scene, camera );
  }

  useEffect(() => {
    if (canvas.current) {
      // remove DOM node
      if (canvas.current.children.length !== 0) {
        canvas.current.removeChild(canvas.current.children[0]);
      }
      // remove previous meshes
      while (scene.children.length > lights.length) {
        scene.remove(scene.children[scene.children.length - 1]);
      }
      // Add Renderer
      renderer.setClearColor(color === undefined ? '#ffffff' : color);
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      canvas.current.appendChild(renderer.domElement);
      // Add Camera Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set( 0, 0, 0 );
      controls.update();
      
      // add lights
      for (let i = 0; i < lights.length; i++) {
        scene.add(lights[i]);
      }

      // Add meshes
      for (let i = 0; i < meshes.length; i++) {
        scene.add((meshes[i] as THREE.Mesh));
      }

      renderer.render( scene, camera );

      controls.addEventListener('change', () => renderer.render( scene, camera ));
    }
  }, [meshes, height, width]);

  return (
    <>
      <div style={{width: width, height: height}} ref={canvas} />
    </>
  );
};

export default ThreeScene;