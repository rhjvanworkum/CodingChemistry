import {Checkbox, FormControlLabel, FormHelperText, Select} from '@material-ui/core';
import React, {useState, useEffect} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import PlotlyPlot from './PlotlyPlot';
import {axis} from '../store/reducers';
import {axisToArray, convertDof, getSlice} from '../hooks';

const PES : React.FC<any> = (props : any) => {
  const {currAxisValues, axis} = useSelector((state : any) => state.job, shallowEqual);
  const [selectedAxis, setSelectedAxis] = useState(Array(axis.length).fill(false)); //useState(Array(1).fill(true).concat(Array(axis.length - 1).fill(false)));
  const [data, setData] = useState([]);

  const handleAxis = (event : any, index : number) => {
    const newAxis = selectedAxis.map((ax : boolean, id : number) => {
      return (id === index ? !ax : ax);
    });

    if (newAxis.filter(value => value).length <= 2) {
      setSelectedAxis(newAxis);
      console.log(newAxis, index, selectedAxis);
      obtainSlice(currAxisValues, getTrueIndices(newAxis));
    }
  };

  const getTrueIndices = (arr: Array<boolean>) => {
    const newArr : Array<number> = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]) newArr.push(i);
    }
    return newArr;
  }

  useEffect(() => {
    obtainSlice(currAxisValues, getTrueIndices(selectedAxis));
  }, [currAxisValues])

  async function obtainSlice(values : Array<number>, indices : Array<number>) {
    let data = await getSlice(values, indices);
    setData(data.output);
  }

  const generatePlotData = () : {
    x: Array<number>;
    y: Array<number>;
    z?: Array<Array<number>>;
  } => {
    let plotData : {
      x: Array<number>;
      y: Array<number>;
      z?: Array<Array<number>>;
    } = {
      x: [],
      y: [],
    };
    const dim = selectedAxis.filter((value : boolean) => value === true).length;

    if (dim === 1) {
      const index = selectedAxis.indexOf(true, 0);
      plotData = {
        x: axisToArray(axis[index]),
        y: data,
      };
    } else if (dim === 2) {
      const index1 = selectedAxis.indexOf(true, 0);
      const index2 = selectedAxis.indexOf(true, index1 + 1);
      plotData = {
        x: axisToArray(axis[index1]),
        y: axisToArray(axis[index2]),
        z: data,
      };
    };
    return plotData;
  };

  return (
    <div style={{width: props.width, height: props.height}}>
      <Select disableUnderline>
        {axis.map((ax : axis, index : number) => {
          return (
            <FormControlLabel
              key={index + 1}
              control={<Checkbox checked={selectedAxis[index]} onChange={(event) => handleAxis(event, index)} />}
              label={convertDof(ax.dof)}
            />
            );
          })}
        </Select>
        <FormHelperText>Choose Axis</FormHelperText>
        {data.length !== 0 && <PlotlyPlot width={props.width} height={props.height} selectedAxis={selectedAxis} data={generatePlotData()}/>}
    </div>
  );
};

export default PES;
