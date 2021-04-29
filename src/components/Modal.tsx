import {Dispatch, useState} from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import ClearIcon from '@material-ui/icons/Clear';
import { makeStyles, Typography } from '@material-ui/core';
import BlueButton from './Button';
import { setMolecule, setMethod, addAxis, removeAxis, axis, changeAxis, submitJob, setLoading, setBasisSet } from '../store/reducers';
import { ControlSelectComponent } from './Select';
import { NumberInput } from './Input';
import { convertDof, nameToSmiles, loadMolecule } from '../hooks';

const methods = [
  "Hartree-Fock",
  "MP2",
  "CCSD",
  "DFT-LSDA"
];

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
  Menu: {
    // flexDirection: 'column',
    // justifyContent: 'flex-start',
    // alignItems: 'center',
    marginTop: '4%',
    width: '100%',
    // padding: '20.0205px',
    // position: 'absolute',
    // height: '30%',
    // left: '5%',
    // bottom: '5%',
    // boxShadow: '0px 5.83932px 39.2068px rgba(111, 123, 142, 0.2)',
    // borderRadius: '8px',
    // zIndex: 2,
    overflowX: 'auto',
    overflowY: 'auto',
  },
  Input: {
    height: '43px',
    width: '150px',
    borderRadius: '5px',
    BackgroundColor: '#1D7DFF',
  },
  input : {

  },
  Button: {
    height: '43px',
    width: '120px',
    BorderRadius: '6px',
    color: "#ffffff",
    backgroundColor: '#1D7DFF',
  },
  label: {
    width: "70%"
  }
});


const Modal : React.FC<any> = (props : any) => {
    const [name, setName] = useState('name');
    const {dofs} = useSelector((state : any) => state.molecule, shallowEqual);
    const {basisSet, method, numAxis, axis} = useSelector((state : any) => state.job, shallowEqual);

    const dispatch : Dispatch<any> = useDispatch();

    const classes = useStyles();


    const handleChange = (event : any) => {
      setName((event.target as HTMLFormElement).value);
    }

    const submitName = async (event : any) => {
      dispatch(setLoading(true));
      let smiles = await nameToSmiles(name);
      let object = await loadMolecule(smiles);
      dispatch(setLoading(false));
      dispatch(setMolecule(object));
    }

    return (
        <div className={classes.Menu}>
            <Grid container justify="flex-start" spacing={2} style={{marginLeft: '4%'}}> 
                <Grid item>
                  <TextField className={classes.Input} InputProps={{disableUnderline: true}} label="molecule" onChange={handleChange} />
                </Grid>
                <Grid item>
                  <BlueButton label="Insert" clickHandler={submitName} /> 
                </Grid>
                <Grid item>
                  <ControlSelectComponent value={method} setValue={(value) => {
                    dispatch(setMethod(value));
                  }} items={methods} values={methods} />
                </Grid>
                <Grid item>
                  <ControlSelectComponent value={basisSet} setValue={(value) => {
                    dispatch(setBasisSet(value));
                  }} items={basisSets} values={basisSets} />
                </Grid>
                <Grid item>
                  {dofs.length > 0 && <BlueButton label="Add Axis" clickHandler={() => {
                      let newAxis : axis = {min: 1, max: 3, interval: 0.5, dof: dofs[0]};
                      dispatch(addAxis(newAxis));
                    }} 
                  />}
                </Grid>
                
                {dofs.length > 0 &&
                <>
                  <Grid container justify="flex-start" style={{marginTop: '1%'}} spacing={8}>
                    <Grid item xs={2}>
                        <Typography className={classes.label}></Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography className={classes.label}>Min</Typography>
                    </Grid>
                        <Grid item xs={2}>
                    <Typography className={classes.label}>Max</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography className={classes.label}>Interval</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography className={classes.label}>DOF</Typography>
                    </Grid>
                    <Grid item xs={1}>
                    </Grid>
                  </Grid>
                
                  <Grid>
                    {axis.map((ax : axis, index : number) => {
                      return (
                        <Grid key={index} container justify="flex-start" spacing={8} >
                          <Grid item xs={2}>
                              <Typography className={classes.label}>Axis {index + 1}</Typography>
                          </Grid>
                          <Grid item xs={2}>
                              <NumberInput value={JSON.stringify(ax.min)} setValue={(value : any) => {
                                let newAxis = ax;
                                newAxis.min = value;
                                dispatch(changeAxis(index, newAxis));
                              }} />
                          </Grid>
                          <Grid item xs={2}>
                              <NumberInput value={JSON.stringify(ax.max)} setValue={(value : any) => {
                                let newAxis = ax;
                                newAxis.max = value;
                                dispatch(changeAxis(index, newAxis));
                              }} />
                          </Grid>
                          <Grid item xs={2}>
                              <NumberInput value={JSON.stringify(ax.interval)} setValue={(value : any) => {
                                let newAxis = ax;
                                newAxis.interval = value;
                                dispatch(changeAxis(index, newAxis));
                              }} />
                          </Grid>
                          <Grid item xs={2}>
                              <ControlSelectComponent value={ax.dof} setValue={(value) => {
                                let newAxis = ax;
                                newAxis.dof = value;
                                dispatch(changeAxis(index, newAxis));
                              }} values={dofs} items={dofs.map((dof : any) => convertDof(dof))} />
                          </Grid>
                          <Grid item xs={1}>
                              <ClearIcon style={{marginLeft: '5%', color: '#1D7DFF'}} onClick={() => {
                                dispatch(removeAxis(index));
                              }} />
                          </Grid>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {numAxis > 0 && <Grid container justify="center" style={{paddingTop: '5%'}}>
                    <BlueButton label="submit job" clickHandler={() => {
                      props.onClose();
                      dispatch(submitJob());
                    }} />
                   </Grid>}

                </>
                }
          </Grid>
        </div>
    )
}

export default Modal;