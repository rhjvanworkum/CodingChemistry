import React, { useEffect, useRef } from "react";
import * as Three from 'three';
import Button from '@material-ui/core/Button';
import BlueButton from './Button';
import {OrbitControls} from '@avatsaev/three-orbitcontrols-ts'
import { Grid } from "@material-ui/core";

interface ThreeSceneProps {
  width: number;
  height: number;
  camera: Three.Camera;
  lights: Array<Three.Light>;
  meshes: Array<THREE.Mesh | undefined>;
  timeSeries: Array<Array<Array<number>>>;
}

const ThreeAnimationScene : React.FC<ThreeSceneProps> = (props : ThreeSceneProps) => {
    const canvas = useRef<HTMLDivElement>(null);
    const reload = false;

    const Scene: Three.Scene = new Three.Scene();
    const Renderer: Three.WebGLRenderer = new Three.WebGLRenderer({ antialias: true });

    const { width, height, camera, lights, meshes, timeSeries} = props;

    var timeIdx = 0;
    var timeLength = timeSeries.length;
    var rendering = false;
    var reset = false;

    const renderScene = () => {
        requestAnimationFrame( renderScene );

        if (rendering) {
            if (timeIdx < timeLength) {
                for (let i = 0; i < meshes.length; i++) {
                    (meshes[i] as THREE.Mesh).position.set(timeSeries[timeIdx][i][0], timeSeries[timeIdx][i][1], timeSeries[timeIdx][i][2]);
                }
        
                timeIdx += 1;
            } else {
                reset = true;
            }
          }
      
          if (reset) {
              for (let i = 0; i < meshes.length; i++) {
                  (meshes[i] as THREE.Mesh).position.set(timeSeries[0][i][0], timeSeries[0][i][1], timeSeries[0][i][2]);
              }
              timeIdx = 0;
              rendering = false;
              reset = false; 
          }

        Renderer.render( Scene, camera )
    }


    useEffect(() => {
      if (canvas.current) {
        // remove DOM node
        if (canvas.current.children.length !== 0) {
          canvas.current.removeChild(canvas.current.children[0]);
        }
        // remove previous meshes
        while (Scene.children.length > lights.length) {
          Scene.remove(Scene.children[Scene.children.length - 1]);
        }
        // Add Renderer
        Renderer.setClearColor('#ffffff');
        Renderer.sortObjects = false;
        Renderer.setPixelRatio( window.devicePixelRatio );
        Renderer.setSize(width, height);
        Renderer.shadowMap.enabled = true;
        Renderer.shadowMap.type = Three.PCFSoftShadowMap;
        canvas.current.appendChild(Renderer.domElement);
        
        // Add Camera Controls
        const controls = new OrbitControls(camera, Renderer.domElement);
        controls.target.set( 0, 0, 0 );
        controls.update();

        // add lights
        for (let i = 0; i < lights.length; i++) {
          Scene.add(lights[i]);
        }
        
        // Add meshes
        for (let i = 0; i < meshes.length; i++) {
          Scene.add((meshes[i] as THREE.Mesh));
        }
  
        Renderer.render( Scene, camera );

        renderScene();
      }
    });

    return (
        <div>
            <div style={{ width: width, height: height}} ref={canvas}></div>
            <Grid container justify="center" spacing={3}>
              <Grid item>
                <BlueButton label="Play" clickHandler={() => rendering = true} />
              </Grid>
              <Grid item>
                <BlueButton label="Stop" clickHandler={() => rendering = false} />
              </Grid>
              <Grid item>
                <BlueButton label="Reset" clickHandler={() => reset = true} />
              </Grid>
            </Grid>
        </div>
    )
}

export default ThreeAnimationScene;
