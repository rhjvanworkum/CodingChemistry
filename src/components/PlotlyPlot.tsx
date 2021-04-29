import React from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import createPlotlyComponent from 'react-plotly.js/factory';

interface plotProps {
  width: number;
  height: number;
  selectedAxis: Array<boolean>;
  data: {
    x: Array<number>,
    y: Array<number>,
    z?: Array<Array<number>>,
  };
};

const PlotlyPlot : React.FC<plotProps> = (props : plotProps) => {
  const {currAxisValues, axis} = useSelector((state : any) => state.job, shallowEqual);

  const renderPlot = () => {
    const Plot = createPlotlyComponent(window.Plotly);

    if (props.selectedAxis.filter(value => value === true).length == 1) {
      const index = props.selectedAxis.indexOf(true, 0);
      const ax = axis[index];
      const colors = Array(props.data.x.length).fill('#296d98');
      colors[currAxisValues[index]] = '#ff0000';

      return (
        <Plot
          data={[
            {
              x: props.data.x,
              y: props.data.y,
              type: 'scatter',
              mode: 'lines+markers',
              marker: {color: colors},
            },
          ]}
          layout={{
            width: props.width,
            height: props.height,
            title: 'PES plot',
            xaxis: {
              title: ax.dof.length === 2 ? 'Bond length (Angstrom)' : 'Bend angle (Radians)',
            },
            yaxis: {
              title: 'Energy (Hartree)',
            },
          }}/>
      );
    } else if (props.selectedAxis.filter(value => value === true).length === 2) {
      const index1 = props.selectedAxis.indexOf(true, 0);
      const index2 = props.selectedAxis.indexOf(true, index1 + 1);
      const ax1 = axis[index1];
      const ax2 = axis[index2];
      const colors = Array(props.data.x.length).fill('rgba(255, 255, 255, 0)');
      colors[currAxisValues[index1]] = 'rgb(255, 0, 0)';

      return (
        <Plot
          data={[
            {
              x: props.data.x,
              y: props.data.y,
              z: props.data.z,
              type: 'surface',
            },
            {
              y: Array(props.data.y.length).fill(currAxisValues[index2] * ax2.interval + ax2.min),
              x: props.data.x,
              z: props.data.z![index2],
              type: 'scatter3d',
              mode: 'markers',
              marker: {size: 10, symbol: 'arrow-down-open', color: colors},
            },
          ]}
          layout={{
            width: props.width,
            height: props.height,
            title: 'PES plot',
            scene: {
              xaxis: {
                title: ax1.dof.length === 2 ? 'Bond length (Angstrom)' : 'Bend angle (Radians)',
              },
              yaxis: {
                title: ax2.dof.length === 2 ? 'Bond length (Angstrom)' : 'Bend angle (Radians)',
              },
              zaxis: {
                title: 'Energy (Hartree)',
              },
            },
          }}/>
      );
    };
  };

  return (
    <>
      {renderPlot()}
    </>
  );
};

export default PlotlyPlot;
