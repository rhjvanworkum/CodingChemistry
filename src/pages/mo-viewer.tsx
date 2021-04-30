import { Grid, TextField, Dialog, DialogTitle, makeStyles, Typography } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import {ControlSelectComponent} from '../components/Select';
import BlueButton from '../components/Button';
import React, {useState, Dispatch, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import { setLoading } from '../store/reducers';
import { hemiLight, loadMolecule, nameToSmiles, perspectiveCamera, viewOrbitals } from '../hooks';
import ThreeScene from '../components/ThreeScene';

import * as THREE from 'three';
import * as math from 'mathjs';
import { NumberInput } from '../components/Input';


const basisSets = [
  'sto-3g',
  '3-21g',
  '6-31g',
  'cc-pvdz',
  'cc-pvqz',
  'cc-pvtz',
  'aug-cc-pvdz',
  'aug-cc-pvqz',
  'aug-cc-pvtz',
];

interface basisFunction {
  coeffiecents: Array<number>;
  ang_mom: Array<number>;
  exponents: Array<number>;
  origin: Array<number>
}

interface orbital {
  moCoeffiecents: Array<number>;
  basisFunctions: Array<basisFunction>;
  box: Array<Array<number>>
}

const getNorm = (vec1 : Array<number>, vec2 : Array<number>) => {
  return (vec2[0] - vec1[0]) ** 2 + (vec2[1] - vec1[1]) ** 2 + (vec2[2] - vec1[2]) ** 2;
};

const getColor = (x : number, y : number, z : number, mo : Array<number>, bfs : Array<basisFunction>) => {
  let result = 0;
  for (let i = 0; i < mo.length; i++) {
    let bf : basisFunction = bfs[i];
    let GTO = 0;

    for (let j = 0; j < bf.coeffiecents.length; j++) {
      let i = bf.ang_mom[0];
      let j = bf.ang_mom[1];
      let k = bf.ang_mom[2];
      let norm = (2 * bf.exponents[j] / Math.PI) ** (3/4) * ((8*bf.exponents[j])**(i+j+k) * math.factorial(i) * math.factorial(j) * math.factorial(k) / (math.factorial(2*i) * math.factorial(2*j) * math.factorial(2*k)) ) ** (1/2);
      GTO += bf.coeffiecents[j] * norm * x ** bf.ang_mom[0] * y ** bf.ang_mom[1] * z ** bf.ang_mom[2] * 
      Math.exp(-1 * bf.exponents[j] * getNorm([x, y, z], bf.origin));
    }

    result += mo[i] * GTO;
  }
  return result;
}

const useStyles = makeStyles({
  Input: {
    height: '43px',
    width: '150px',
    borderRadius: '5px',
    BackgroundColor: '#1D7DFF',
  }
});

const MoViewer : React.FC = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('name');
  const [basisSet, setBasisSet] = useState(basisSets[0]);
  const [box, setBox] = useState([]);

  const [E, setE] = useState<Array<Array<number>>>([]);
  const [C, setC] = useState([]);
  const [basisfunctions, setBasisfunctions] = useState<Array<basisFunction>>([]);

  const [index, setIndex] = useState(0);
  const [moIndex, setMoIndex] = useState(0);
  const [resolution, setResolution] = useState(0.1);
  const [reach, setReach] = useState(2);

  const [points, setPoints] = useState<THREE.Points | null>(null);

  const dispatch : Dispatch<any> = useDispatch();
  const classes = useStyles();

  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial( { vertexColors: true, size: 0.05 } );

  const handleChange = (event : any) => {
    setName((event.target as HTMLFormElement).value);
  }

  const submitName = async () => {
    dispatch(setLoading(true));
    let smiles = await nameToSmiles(name);
    let object = await loadMolecule(smiles);
    let data = await viewOrbitals(basisSet);
    setE(data.E)
    setC(data.C)
    setBasisfunctions(data.basis_functions.map((bf : Array<any>) : basisFunction => {
      return {coeffiecents: bf[2], ang_mom: bf[1], exponents: bf[3], origin: bf[0]}
    }));
    setBox(data.box)
    dispatch(setLoading(false));
  }

  useEffect(() => {
    if (box.length > 0) {
      const vertices = [];
      const colors = [];
  
      for (let x = box[0][0] - reach; x < box[1][0] + reach; x += resolution) {
        for (let y = box[0][1] - reach; y < box[1][1] + reach; y += resolution) {
          for (let z = box[0][2] - reach; z < box[1][2] + reach; z += resolution) {
              let c = getColor(x, y, z, C[index][moIndex], basisfunctions);
              if (Math.abs(c) > 0.05) {
                vertices.push(x,y,z);
    
                if (c >= 0) {
                  colors.push(c * 255, 0, 0);
                } else {
                  colors.push(0, 0, -1 * c * 255);
                }
              }
          }
        }
      }
    
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      setPoints(new THREE.Points(geometry, material));
    }
  }, [index, moIndex, resolution, reach, box])

  return (
    <div>
      <h2>MO Viewer</h2>
      <p>A tool to look at how Molecular Orbitals arise in the Self-consisten field algorithm using HF. 
        The code for the backend can be found at: <a href="https://github.com/rhjvanworkum/pyEsm">https://github.com/rhjvanworkum/pyEsm</a>.  
      </p>

      <Grid container justify="center" style={{marginTop: "5%"}}>
        <BlueButton label="Start" clickHandler={() => {setOpen(true)}} />
      </Grid>

      <Dialog open={open} maxWidth="md">
        <DialogTitle>Set Settings</DialogTitle>
        <div style={{marginLeft: '94%', marginTop: '-5%'}}>
          <ClearIcon onClick={() => {setOpen(false)}}/>
        </div>

        <Grid container justify="flex-start" spacing={2} style={{marginLeft: '4%'}}> 
          <Grid item>
            <TextField className={classes.Input} InputProps={{disableUnderline: true}} label="molecule" onChange={handleChange} />
          </Grid>
          <Grid item>
            <BlueButton label="Insert" clickHandler={() => { setOpen(false); submitName(); }} /> 
          </Grid>
          <Grid item>
            <ControlSelectComponent value={basisSet} setValue={(value) => {
              setBasisSet(value);
            }} items={basisSets} values={basisSets} />
          </Grid>
        </Grid>
      </Dialog>

      {box.length > 0 && 
        <>
          <Grid container justify="flex-start" style={{marginTop: "5%"}}>

              <Grid container justify="center" style={{marginTop: "2%"}}>
                <Grid item xs={1}>
                  <ControlSelectComponent value={moIndex} setValue={(value) => {
                    setMoIndex(value);
                  }} items={E[index].map((item : any, index : number) => `MO ${index}`)} values={E[index].map((item : any, index : number) => index)} />
                </Grid>
                <Grid item xs={3}>
                  <b>MO Energy: {E[index][moIndex]}</b>
                </Grid>
              </Grid>

              <Grid container justify="center" style={{marginTop: "2%"}}>
                <Grid item xs={2}>
                    <BlueButton label="Previous" clickHandler={() => {index === 0 ? setIndex(E.length - 1) : setIndex(index - 1)}} />
                </Grid>
                <Grid item xs={1}>
                  <Typography>Iteration: {index}</Typography>
                </Grid>
                <Grid item xs={1}>
                  <BlueButton label="Next" clickHandler={() => {index === (E.length - 1) ? setIndex(0) : setIndex(index + 1)}} />
                </Grid>
              </Grid>
            </Grid>

            <Grid container justify="center" style={{marginTop: "2%"}}>
              <Grid item xs={2}>
                <NumberInput value={resolution} label="Resolution" setValue={(value) => { if (value !== 0) setResolution(value)}} />
              </Grid>
              <Grid item xs={2}>
                <NumberInput value={reach} label="Reach" setValue={(value) => { if (value < 5) setReach(value)}} />
              </Grid>
            </Grid>

            {points !== null && <Grid container justify="center" style={{marginTop: "3%"}}>
              <ThreeScene width={window.innerWidth * 0.5} height={window.innerHeight * 0.7} camera={perspectiveCamera(window.innerWidth * 0.5, window.innerHeight * 0.7)} lights={hemiLight()} meshes={[points]} color={'#000000'}/>
            </Grid>}
        </>
      }
    
    </div>
  );
};

export default MoViewer;


// const OrbitalViewer: React.FC<orbital> = (props : orbital) => {

//   const box = props.box;

//   const vertices = [];
//   const colors = [];

//   for (let x = box[0][0] - reach; x < box[1][0] + reach; x += resolution) {
//     for (let y = box[0][1] - reach; y < box[1][1] + reach; y += resolution) {
//       for (let z = box[0][2] - reach; z < box[1][2] + reach; z += resolution) {
//           let c = getColor(x, y, z, props.moCoeffiecents, props.basisFunctions);
//           if (Math.abs(c) > 0.05) {
//             vertices.push(x,y,z);

//             if (c >= 0) {
//               colors.push(c * 255, 0, 0);
//             } else {
//               colors.push(0, 0, -1 * c * 255);
//             }
//           }
//       }
//     }
//   }

//   const geometry = new THREE.BufferGeometry();
//   geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
//   geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
//   const material = new THREE.PointsMaterial( { vertexColors: true, size: 0.05 } );
//   const points = new THREE.Points(geometry, material);

//   return (
//     <>
      
//     </>
//   )
// }