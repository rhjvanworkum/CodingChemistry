import { Grid, TextField, Dialog, DialogTitle, makeStyles } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import {ControlSelectComponent} from '../components/Select';
import BlueButton from '../components/Button';
import React, {useState, Dispatch, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import { moleculeReducer, setLoading, setMolecule } from '../store/reducers';
import { hemiLight, loadMolecule, nameToSmiles, perspectiveCamera, viewOrbitals } from '../hooks';
import ThreeScene from '../components/ThreeScene';

import * as THREE from 'three';
import { AirlineSeatLegroomExtraRounded } from '@material-ui/icons';
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

  const [loaded, setLoaded] = useState(false);

  const [E, setE] = useState([]);
  const [C, setC] = useState([]);
  const [basisfunctions, setBasisfunctions] = useState<Array<basisFunction>>([]);

  const [index, setIndex] = useState(0);
  const [moIndex, setMoIndex] = useState(0);

  const dispatch : Dispatch<any> = useDispatch();

  const classes = useStyles();


  const handleChange = (event : any) => {
    setName((event.target as HTMLFormElement).value);
  }

  const submitName = async (event : any) => {
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
    setLoaded(true);
    dispatch(setLoading(false));
  }

  return (
    <div>
      <h2>MO Viewer</h2>
      <p>A tool to look at how Molecular Orbitals arise in the Self-consisten field algorithm using HF. 
        The code for the backend can be found at: www.github.com/rhjvanworkum/pyEsm. 
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
            <BlueButton label="Insert" clickHandler={submitName} /> 
          </Grid>
          <Grid item>
            <ControlSelectComponent value={basisSet} setValue={(value) => {
              setBasisSet(value);
            }} items={basisSets} values={basisSets} />
          </Grid>
        </Grid>
      </Dialog>

      {loaded && 
        <>
          <Grid container justify="center" style={{marginTop: "5%"}}>
            <BlueButton label="Previous" clickHandler={() => {index === 0 ? setIndex(E.length - 1) : setIndex(index - 1)}} />
            <BlueButton label="Next" clickHandler={() => {index === (E.length - 1) ? setIndex(0) : setIndex(index + 1)}} />
            <ControlSelectComponent value={moIndex} setValue={(value) => {
                  setMoIndex(value);
                }} items={E} values={E.map((item : any, index : number) => index)} />
          </Grid>

          <OrbitalViewer moCoeffiecents={C[index][0]} basisFunctions={basisfunctions} box={box}/> 
        </>
      }
    
    </div>
  );
};

export default MoViewer;

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


const OrbitalViewer: React.FC<orbital> = (props : orbital) => {

  const box = props.box;

  const resolution = 0.5;
  const reach = 2;

  const vertices = [];
  const colors = [];

  console.log(props.basisFunctions);
  console.log(box);
  console.log(props.moCoeffiecents);

  for (let x = box[0][0] - reach; x < box[1][0] + reach; x += resolution) {
    for (let y = box[0][1] - reach; y < box[1][1] + reach; y += resolution) {
      for (let z = box[0][2] - reach; z < box[1][2] + reach; z += resolution) {
          vertices.push(x,y,z);
          let c1 = Math.abs(getColor(x, y, z, props.moCoeffiecents, props.basisFunctions));
          colors.push(255, 255 - c1 * 255, 255 - c1 * 255);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial( { vertexColors: true, size: 0.1 } );
  const points = new THREE.Points(geometry, material);

  return (
    <>
      <ThreeScene width={800} height={800} camera={perspectiveCamera(800, 800)} lights={hemiLight()} meshes={[points]} />
    </>
  )
}