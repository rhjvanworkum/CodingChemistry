import { FormControl, Grid, Slider, Typography, Dialog, DialogTitle } from '@material-ui/core';
import React, { useState, Dispatch } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {axis, setAtomPositions, setCurrAxisValue, finishJob} from '../store/reducers';
import Modal from '../components/Modal';
import MolViewer from '../components/MolViewer';
import { ControlSelectComponent } from '../components/Select';
import MuiAlert from '@material-ui/lab/Alert';
import { resizeWindow, setLoading } from '../store/reducers';
import ClearIcon from '@material-ui/icons/Clear';
import BlueButton from '../components/Button';
import PES from '../components/PES';
import { useEffect } from 'react';
import {axisToArray, convertDof, setGeometry, runJob } from '../hooks';

const views = [
  "side-by-side",
  "picture-in-picture",
  "fullscreen"
];

const Pessenger : React.FC = (props) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(views[0]);
  const {size} = useSelector((state : any) => state.control, shallowEqual);
  const {currAxisValues, submitted, finished, axis, basisSet, method} = useSelector((state : any) => state.job, shallowEqual);

  const dispatch : Dispatch<any> = useDispatch();

  const handleSlideChange = (value : any, index : number) => {
    dispatch(setCurrAxisValue(value / 10, index));

    async function getGeometry() {
      dispatch(setLoading(true));
      let geometry = await setGeometry(value / 10, axis[index].dof);
      dispatch(setLoading(false));
      dispatch(setAtomPositions(geometry));
    };

    getGeometry();
  };

  useEffect(() => {
    async function getJob() {
      dispatch(setLoading(true));
      let data = await runJob(axis, method, basisSet);
      dispatch(setLoading(false));
      dispatch(finishJob());
    };
    if (submitted && !finished) {
      getJob();
    }

  }, [submitted]);

  return (
    <div>
      <h2>PESsenger</h2>
      <p>A tool to generate Potential Energy surfaces over molecular bond lengths and angle, using ab-initio electronic structure methods. One can search for molecules 
        by it's chemical name. The available Degrees of Freedom will be listed and the user can specify certain axis corresponding to a degree of freedom, along which
        the energy of the molecule will be sampled. The user can than control the different DOF's and see the result simultaneously in the 3D viewer as in the Potential 
        Energy Surface itself. The code for the backend can be found at: <a href="https://github.com/rhjvanworkum/pyEsm">https://github.com/rhjvanworkum/pyEsm</a>. 
      </p>

      <MuiAlert style={{marginBottom: '5%'}} elevation={6} variant="filled" severity="warning">Calculating a PES can take a lot of time. It is highly advices to only consider small molecules with minimal basis set's and few sample points unless you keep the browser open for a long time</MuiAlert>

      <b style={{marginRight: '2%'}}>Set View:</b>
      <ControlSelectComponent value={view} setValue={(value) => {
        dispatch(resizeWindow(value));
        setView(value);
      }} items={views} values={views} />

      <Grid container justify="center" style={{marginTop: "5%"}}>
        <BlueButton label="Start" clickHandler={() => {setOpen(true)}} />
      </Grid>

      <Dialog open={open} maxWidth="md">
        <DialogTitle>Set Settings</DialogTitle>
        <div style={{marginLeft: '94%', marginTop: '-5%'}}>
          <ClearIcon onClick={() => {setOpen(false)}}/>
        </div>

        <Modal onClose={() => {setOpen(false)}} />

      </Dialog>

      <Grid container justify="center" style={{marginTop: 4 + "%"}} spacing={2}>
          <Grid container>
            <Grid item>
              <MolViewer width={size.molViewer.width} height={size.molViewer.height} />
            </Grid>
            {finished &&
              <Grid item>
                <PES width={size.results.width} height={size.results.height}/>
              </Grid>
            }
          </Grid>

          {axis.map((ax : axis, index : number) => {
                return (
                  <FormControl key={index} style={{marginTop: 4 + "%"}}>
                    <Typography gutterBottom>{convertDof(ax.dof).map((item : any, index : number) => { return index < (ax.dof.length - 1) ? item + "-" : item})} {ax.dof.length == 2 ? "Bond length" : "Bend angle"}</Typography>
                    <Slider style={{width: window.innerWidth * 0.7}} value={(currAxisValues[index] * axis[index].interval + axis[index].min) * 10} min={ax.min * 10} max={ax.max * 10} 
                          step={ax.interval * 10} marks={axisToArray(ax).map(item => {
                            return {
                              value: item * 10,
                              label: JSON.stringify(item) + (ax.dof.length === 2 ? "Å" : "Rad")
                            }
                          })}
                          onChange={(event, value) => {handleSlideChange(value, index)}}/>
                </FormControl>
                )
          })}
      </Grid>
    </div>
  );
}

export default Pessenger;