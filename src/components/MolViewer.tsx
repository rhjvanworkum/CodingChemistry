import React, { useEffect, useState } from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import * as THREE from 'three';

import {hemiLight, perspectiveCamera} from '../hooks';
import ThreeScene from './ThreeScene';

const Colors : Map<string, THREE.Material> = new Map([
  ['H', new THREE.MeshLambertMaterial({color: 'rgb(220, 220, 220)'})],
  ['C', new THREE.MeshLambertMaterial({color: 'rgb(0, 0, 0)'})],
  ['O', new THREE.MeshLambertMaterial({color: 'rgb(255, 0, 0)'})],
]);

const MolViewer : React.FC<any> = (props : any) => {
  const [meshes, setMeshes] = useState<Array<any>>([]);
  const {atoms} = useSelector((state : any) => state.molecule, shallowEqual);

  const geometry = new THREE.SphereBufferGeometry(1, 32, 32);

  useEffect(() => {
    if (atoms.length !== 0) {
      let atom_meshes : Array<any> = [];

      console.log('hi');
      console.log(atoms);
  
      for (let i = 0; i < atoms.length; i++) {
          let geom = geometry.clone();
          let mesh = new THREE.Mesh(geom, Colors.get(atoms[i].elem));
          mesh.position.set(atoms[i].position[0],
                      atoms[i].position[1],
                      atoms[i].position[2]);
          atom_meshes[i] = mesh;
      }
  
      setMeshes(atom_meshes);
    }
  }, [atoms]);

  return (
    <ThreeScene width={props.width} height={props.height} camera={perspectiveCamera(props.width, props.height)} lights={hemiLight()} meshes={meshes} />
  );
};

export default MolViewer;
