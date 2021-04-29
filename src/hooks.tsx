import * as THREE from 'three';
import {axis, Elements} from './store/reducers';
import axios, { AxiosResponse } from "axios";

const PUBCHEM_API = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/";
const SIMPLE_MD_API = "https://whispering-castle-92590.herokuapp.com"
const ESMPY_API = "https://py-esm.herokuapp.com";

export const runJobMd = async (cellSize : number, density : number, temp : number, timeStep : number, steps : number, system : string, integrator : string, forces : string) => {
  let response = await axios.post(SIMPLE_MD_API + `/api/run_job`, {
    'N': cellSize,
    'density': density,
    'temperature': temp,
    'delta_t': timeStep,
    'steps': steps,
    'system': system,
    'integrator': integrator,
    'forces': forces
  }).catch((err) => {
    window.alert('An error occured: ,' + err);
  });

  return (response as AxiosResponse<any>).data;
}

export const nameToSmiles = async (name : string) => {
  let smiles = await axios.get(PUBCHEM_API + name + "/property/CanonicalSmiles/json").catch((err) => {
    window.alert('An error occured: ,' + err);
  });
  return (smiles as AxiosResponse<any>).data.PropertyTable.Properties[0].CanonicalSMILES;
}

export const loadMolecule = async (smiles : string) => {
  let molecule = await axios.get(ESMPY_API + '/api/set_molecule?smiles=' + smiles).catch((err) => {
    window.alert('An error occured: ,' + err);
  });

  return (molecule as AxiosResponse<any>).data;
}

export const setGeometry = async (value : number , dof : Array<number>) => {
  let response = await axios.post(ESMPY_API + '/api/set_geometry', {
    'value': value,
    'dof': dof
  }).catch((err) => {
    window.alert('An error occured: ,' + err);
  });

  return (response as AxiosResponse<any>).data;
}

export const runJob = async (axis: Array<axis>, method : string, basis : string) => {
  let response = await axios.post(ESMPY_API + '/api/run_job', {
    'axis': axis,
    'method': method,
    'basis': basis,
  }).catch((err) => {
    window.alert('An error occured: ,' + err);
  });

  return (response as AxiosResponse<any>).data;
}

export const getSlice = async (values : Array<number>, indices : Array<number>) => {
  let response = await axios.get(ESMPY_API + `/api/get_slice?indices=${indices}&values=${values}`).catch((err) => {
    window.alert('An error occured: ,' + err);
  });

  return (response as AxiosResponse<any>).data.output;
}

export const viewOrbitals = async (basis : string) => {
  let response = await axios.get(ESMPY_API + `/api/view_orbitals?basis=${basis}`).catch((err) => {
    window.alert('An error occured: ,' + err);
  });

  return (response as AxiosResponse<any>).data;
}


export const perspectiveCamera = (width: number, height: number) => {
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0,5,8);
  return camera;
}

export const pointLights = () => {
  var lights = [];
  lights[0] = new THREE.PointLight(0x304ffe, 1, 0);
  lights[1] = new THREE.PointLight(0xffffff, 1, 0);
  lights[2] = new THREE.PointLight(0xffffff, 1, 0);
  lights[0].position.set(0, 200, 0);
  lights[1].position.set(100, 200, 100);
  lights[2].position.set(-100, -200, -100);
  return lights;
}

export const hemiLight = () => {
  var lights = [];
  lights[0] = new THREE.HemisphereLight('#FFFFFF', '#000000', 1);
  return lights;
}


export const axisToArray = (axis: axis) : Array<number> => {
  const arr = [];
  for (let i = axis.min; i <= axis.max; i += axis.interval) {
    arr.push(i);
  };
  return arr;
};

export const convertDof = (dof : any) : Array<string> => {
  let newArray : Array<string> = [];

  dof.forEach((el: number) => {
    let name : any = Elements.name.get(el);
    newArray.push(name);
  });

  return newArray;
}