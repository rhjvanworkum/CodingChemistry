import { Grid } from '@material-ui/core';
import React from 'react';

import BlueButton from '../components/Button';

const MolecularArt : React.FC = (props) => {

  const string = `
  <script src="three.min.js"></script>
  <script src="THREE.MeshLine.js"></script>
  <script src="utils.js"></script>
  <script src="art.js"></script>
  `;

  return (
    <>
      <h2>Molecular Art</h2>
      <p>Molecular art is an three.js animation scene based on chemistry: scene 1 is inspired by the model of atoms, scene 2 is 
        inspired by a Lennard-Jones particles simulation and scene 3 is inspired by diatomic gas particles interacting with a metal surface.</p>
      <Grid container spacing={3}>
        <Grid item>
          <BlueButton label="Load" clickHandler={() => window.location.reload()} />
        </Grid>
        <Grid item>
          <BlueButton label="Reload" clickHandler={() => window.location.reload()} />
        </Grid>
      </Grid>
      <iframe scrolling="no" srcDoc={string} width={0.9 * window.innerWidth} height={0.9 * window.innerHeight}></iframe>
    </>
  )
};

export default MolecularArt;
