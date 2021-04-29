import React, {useEffect, useState, Dispatch} from 'react';
import {Grid, Paper, Table, TableHead, TableBody, TableContainer, TableCell, TableRow, Dialog, DialogTitle} from '@material-ui/core';
import * as THREE from 'three';
import axios from 'axios';
import {hemiLight, perspectiveCamera, runJobMd} from '../hooks';
import ThreeAnimationScene from '../components/ThreeAnimationScene';
import BlueButton from '../components/Button';
import ControlSelectComponent from '../components/Select';
import ClearIcon from '@material-ui/icons/Clear';
import { useDispatch } from 'react-redux';
import {setLoading} from "../store/reducers";
import { NumberInput } from '../components/Input';

interface option {
  name: string;
  integrators: Array<string>;
  forces: Array<string>;
}

const options : Array<option> = [
  {name: "LJ", integrators: ["leapfrog", "verlet"], forces: ["PBP", "CD"]},
  {name: "TIP4P", integrators: ["leapfrog", "pred-corr"], forces: ["PBP"]}
];

interface setting {
  name: string;
  min: number;
  max: number;
  state: any;
  setState: any;
  type: string;
}

interface example {
  model: string;
  integrator: string;
  forces: string;
  density: string;
  temperature: string;
  timestep: string;
}

const examples : Array<example> = [
  {model: "LJ", integrator: "LeapFrog", forces: "CD", density: "1", temperature: "1", timestep: "0.005"},
  {model: "LJ", integrator: "Verlet", forces: "PBP", density: "1", temperature: "1.5", timestep: "0.001"},
  {model: "TIP4P", integrator: "LeapFrog", forces: "PBP", density: "1", temperature: "1", timestep: "0.001"},
  {model: "TIP4P", integrator: "Pred-Corr", forces: "PBP", density: "1", temperature: "1", timestep: "0.005"},
];

const geom = new THREE.SphereBufferGeometry(0.1, 32, 32);
const materials = [new THREE.MeshPhongMaterial( {color: "#cc0000"} ), new THREE.MeshPhongMaterial( {color: "#FFFFFF" } )]

const SimpleMDSimulator : React.FC = () => {
  // system settings
  const [system, setSystem] = useState('');
  const [integrator, setIntegrator] = useState('');
  const [forces, setForces] = useState('');
  // simulation settings
  const [cellSize, setCellSize] = useState(2);
  const [density, setDensity] = useState(1);
  const [temp, setTemp] = useState(1);
  const [timeStep, setTimeStep] = useState(0.005);
  const [steps, setSteps] = useState(1000);
  // traj data
  const [trajData, setTrajData] = useState<any>([]);
  // meshes
  const [meshes, setMeshes] = useState<Array<any>>([]);

  const [open, setOpen] = useState(false);

  const dispatch : Dispatch<any> = useDispatch();

  const settings : Array<setting> = [
    {name: "Cell Size", min: 2, max: 10, state: cellSize, setState: setCellSize, type: 'int'},
    {name: "Density", min: 0.2, max: 1.5, state: density, setState: setDensity, type: 'float'},
    {name: "Temperature", min: 0.5, max: 1.5, state: temp, setState: setTemp, type: 'float'},
    {name: "time step", min: 0.0005, max: 0.05, state: timeStep, setState: setTimeStep, type: 'float'},
    {name: "steps", min: 1000, max: 50000, state: steps, setState: setSteps, type: 'int'}
  ];

  const runJob = async () => {
    dispatch(setLoading(true));
    let data = await runJobMd(cellSize, density, temp, timeStep, steps, system, integrator, forces);
    setTrajData(data);
    dispatch(setLoading(false));
  }

  useEffect(() => {
    if (trajData.length > 0) {
      const meshes = [];
      if (system === "LJ") {
        meshes.push(new THREE.Mesh(geom, materials[0]));
      } else if (system === "TIP4P") {
        meshes.push(new THREE.Mesh(geom, materials[1]), new THREE.Mesh(geom, materials[0]));
      }

      let molecules : Array<any> = [];
      for (let i = 0; i < trajData[0].length; i++) {
        let mol : any;
        if (system === "LJ") {
            mol = meshes[0].clone();
        } else if (system === "TIP4P") {
            if (i % 3 === 0) {
                mol = meshes[0].clone();
            } else {
                mol = meshes[1].clone();
            }
        }
        molecules.push(mol);
        mol.position.set(trajData[0][i][0], trajData[0][i][1], trajData[0][i][2]);
      }

      setMeshes(molecules);
    }
  }, [trajData]);

  return (
    <div>
      <h2>Simple MD simulator</h2>
      <p>A simple MD simulator with a Lennard-Jones model of gas particles and a TIP-4P model of water(H2O). The available integrators are
        written using the Leapfrog, Verlet-Velocity and Predictor-Corrector method and the forces between the particles can be evaluated using
        a simple pair-by-pair evaluation(PBP) or a cell-devisioned(CD) evaluation. The code for the backend can be found at: <a href="https://github.com/rhjvanworkum/simpleMd">https://github.com/rhjvanworkum/simpleMD</a>. 
      </p>

      <p>A few examples of settings that work:</p>
      <TableContainer component={Paper} style={{marginBottom: '2%'}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell>Integrator</TableCell>
              <TableCell>Forces</TableCell>
              <TableCell>density</TableCell>
              <TableCell>temperature</TableCell>
              <TableCell>time step</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {examples.map((example : example, index : number) => {
              return (
                <TableRow key={index}>
                  <TableCell>{example.model}</TableCell>
                  <TableCell>{example.integrator}</TableCell>
                  <TableCell>{example.forces}</TableCell>
                  <TableCell>{example.density}</TableCell>
                  <TableCell>{example.temperature}</TableCell>
                  <TableCell>{example.timestep}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <b>You can click on the 3D scene and use your mouse to move around and scroll in on the scene</b>

      <Grid container justify="center" style={{marginTop: "5%"}}>
        <BlueButton label="Start" clickHandler={() => {setOpen(true)}} />
      </Grid>

      <Dialog open={open}>
        <DialogTitle>Set Settings</DialogTitle>
        <div style={{marginLeft: '94%', marginTop: '-8%'}}>
          <ClearIcon onClick={() => {setOpen(false)}}/>
        </div>

        <Grid container justify="center" style={{marginTop: '5%'}}>
          <Grid item xs={3}>
            <ControlSelectComponent value={system} setValue={setSystem} items={options.map((option: option) => {return option.name})} values={options.map((option: option) => {return option.name})} />
          </Grid>
          {system.length > 0 &&
            <>
              <Grid item xs={3}>
                <ControlSelectComponent value={integrator} setValue={setIntegrator} items={options.filter((option : option) => {return option.name === system})[0].integrators} values={options.filter((option : option) => {return option.name === system})[0].integrators} />
              </Grid>
              <Grid item xs={3}>
                <ControlSelectComponent value={forces} setValue={setForces} items={options.filter((option : option) => {return option.name === system})[0].forces} values={options.filter((option : option) => {return option.name === system})[0].forces} />
              </Grid>
            </>
          }
        </Grid>
          
        {system.length !== 0 &&
          <div style={{marginTop: '5%'}}>
            <Grid container justify="center">
              {settings.map((setting: setting) => {
                return (
                  <Grid item xs={2}>
                    <NumberInput value={setting.state} label={setting.name} setValue={(value) => { if (value >= setting.min && value <= setting.max) setting.setState(value); }} />
                  </Grid>
                );
              })}
            </Grid>

            <Grid container justify="center" style={{marginTop: '4%', marginBottom: '4%'}}>
              <BlueButton label="Submit Calculation" clickHandler={() => {setOpen(false); runJob();}} />
            </Grid>
          </div>
        }
      </Dialog>
      
      {meshes.length > 0 &&
        <Grid container justify="center">
          <ThreeAnimationScene width={0.9 * window.innerWidth} height={0.5 * window.innerHeight} camera={perspectiveCamera(0.9 * window.innerWidth, 0.5 * window.innerHeight)} lights={hemiLight()} meshes={meshes} timeSeries={trajData}></ThreeAnimationScene>
        </Grid>
      }
    </div>
  );
};

export default SimpleMDSimulator;



// import React, { useEffect, useState } from 'react';
// import Button from '@material-ui/core/Button';
// import Container from '@material-ui/core/Container';
// import Input from '@material-ui/core/Input';
// import Select from '@material-ui/core/Select';
// import MenuItem from '@material-ui/core/MenuItem';
// import * as THREE from 'three';

// import ThreeAnimationScene from '../components/ThreeAnimationScene';

// const perspectiveCamera = (width: number, height: number) => {
//   const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//   camera.position.set(0,5,8);
//   return camera;
// }

// const pointLights = () => {
//   var lights = [];
//   lights[0] = new THREE.PointLight(0x304ffe, 1, 0);
//   lights[1] = new THREE.PointLight(0xffffff, 1, 0);
//   lights[2] = new THREE.PointLight(0xffffff, 1, 0);
//   lights[0].position.set(0, 200, 0);
//   lights[1].position.set(100, 200, 100);
//   lights[2].position.set(-100, -200, -100);
//   return lights;
// }

// const MDVisualizer = () => {

//   const [selectedFile, setSelectedFile] = useState<any>();
//   const [model, setModel] = useState("");
//   const [data, setData] = useState<any>([]);
//   const [meshes, setMeshes] = useState<Array<any>>([]);
//   const modelTypes = ["LJ", "TIP4P"];

//   const changeHandler = (event : any) => {
//     setSelectedFile(event.target.files[0]);
//   }

//   const selectHandler = (event : any) => {
//     setModel(event.target.value);
//   }

//   const handleSubmission = (event : any) => {
//     var reader = new FileReader();
//     reader.onload = (event) => {
//         if (typeof reader.result === 'string') {
//             setData(JSON.parse(reader.result));
//         }
//     }
//     reader.readAsText(selectedFile);
//   }

//   useEffect(() => {
//     if (data.length > 0) {
//       // iniate geometries, materials and meshes
//       var geom = new THREE.SphereBufferGeometry(0.1, 32, 32);
//       if (model === "LJ") {
//           var mat = new THREE.MeshPhongMaterial( {color: "#cc0000"} );
//           var mesh : any = new THREE.Mesh(geom, mat);
//       } else if (model === "TIP4P") {
//           var mat_O = new THREE.MeshPhongMaterial( {color: "#FFFFFF" } );
//           var mat_H = new THREE.MeshPhongMaterial( {color: "#cc0000"} );
//           var mesh_O : any = new THREE.Mesh(geom, mat_O);
//           var mesh_H : any = new THREE.Mesh(geom, mat_H);
//       }

//       let molecules = [];
//       // initiate all the particles
//       for (let i = 0; i < data[0].length; i++) {
//         let mol : any;
//         if (model === "LJ") {
//             mol = mesh.clone();
//         } else if (model === "TIP4P") {
//             if (i % 3 === 0) {
//                 mol = mesh_O.clone();
//             } else {
//                 mol = mesh_H.clone();
//             }
//         }
//         molecules.push(mol);
//         mol.position.set(data[0][i][0], data[0][i][1], data[0][i][2]);
//       }

//       setMeshes(molecules);
//     }
//   }, [data]);



//   return (
//         <div>
//           <Container>
//                 <Input type="file" name="file" onChange={changeHandler} />
//                 <Select value={model} onChange={selectHandler}>
//                     {modelTypes.map((value, index) => {
//                         return (
//                             <MenuItem key={index} value={value}>{value}</MenuItem>
//                         )
//                     })}
//                 </Select>
//                 <Button onClick={handleSubmission}>Submit</Button>
//             </Container>
//             {meshes.length !== 0 && 
//               <ThreeAnimationScene width={800} height={800} camera={perspectiveCamera(800, 800)} lights={pointLights()} meshes={meshes} timeSeries={data}></ThreeAnimationScene>
//             }
//         </div>
//   )
// }

// export default MDVisualizer;