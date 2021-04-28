import React from 'react';
import {Link} from 'react-router-dom';
import { Grid } from '@material-ui/core';

const Home : React.FC = () => {
  return (
    <>
      <h2>Comp Chem projects by Ruard van Workum</h2>
        <Grid container justify="center">
          <Grid container spacing={5}>
            <Grid item>
              <Link to="/pessenger">
                <article className="post" style={{width: window.innerWidth * 0.4, margin: '3%'}}>
                  <div className="post-thumbnail">
                    <h1 className="post-title">Pessenger</h1>
                    <div className="post-meta">A PES generator Tool</div>
                  </div>
                </article>
              </Link>
            </Grid>
            <Grid item>
              <Link to="/mo-viewer">
                <article className="post" style={{width: window.innerWidth * 0.4, margin: '3%'}}>
                  <div className="post-thumbnail">
                    <h1 className="post-title">MO Viewer</h1>
                    <div className="post-meta">A SCF procedure molecular orbital viewer</div>
                  </div>
                </article>
              </Link>
            </Grid>
          </Grid>
          <Grid container spacing={5}>
            <Grid item>
              <Link to="/simple-md-simulator">
                <article className="post" style={{width: window.innerWidth * 0.4, margin: '3%'}}>
                  <div className="post-thumbnail">
                    <h1 className="post-title">Simple MD Simulator</h1>
                    <div className="post-meta">A lennard-jones and TIP-4P MD simulator</div>
                  </div>
                </article>
              </Link>
            </Grid>
            <Grid item>
              <Link to="/molecular-art">
                <article className="post" style={{width: window.innerWidth * 0.4, margin: '3%'}}>
                  <div className="post-thumbnail">
                    <h1 className="post-title">Molecular Art</h1>
                    <div className="post-meta">A three.js web animation inspired by chemistry</div>
                  </div>
                </article>
              </Link>
            </Grid>
          </Grid>
        </Grid>
    </>
  )
}

export default Home;