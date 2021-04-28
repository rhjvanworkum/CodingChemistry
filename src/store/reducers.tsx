export const RESIZE_WINDOW = "RESIZE_WINDOW";
export const SET_CURR_AXIS_VALUE = "SET_CURR_AXIS_VALUE";
export const SET_MOLECULE = "SET_MOLECULE";
export const SET_ATOM_POSITIONS = "SET_ATOM_POSITIONS";
export const SET_METHOD = "SET_METHOD";
export const SUBMIT_JOB = "SUBMIT_JOB";
export const FINISH_JOB = "FINISH_JOB";
export const ADD_AXIS = "ADD_DOF_AXIS"
export const REMOVE_AXIS = "REMOVE_DOF_AXIS";
export const CHANGE_AXIS = "CHANGE_AXIS";
export const SET_LOADING = "SET_LOADING";
export const SET_BASIS_SET = "SET_BASIS_SET";

export const dispatchState = (action: any) => {
  return (dispatch: any) => {
    dispatch(action);
  };
};

interface size {
  molViewer: {
    width: number;
    height: number;
  },
  results: {
    width: number;
    height: number;
  }
}

interface controlState {
  size : size;
  loading : boolean;
}

const initialControlState : controlState = {
  size: {
    molViewer: {
      width: 0.45 * window.innerWidth,
      height: 0.5 * window.innerHeight,
    },
    results: {
      width: 0.45 * window.innerWidth,
      height: 0.5 * window.innerHeight,
    }
  },
  loading: false,
};

export const controlReducer = (
  state: controlState = initialControlState,
  action: any
) : controlState => {
  switch (action.type) {
    case RESIZE_WINDOW:
      let size : any;
      if (action.mode === 'side-by-side') {
        size = {
          molViewer: {
            width: window.innerWidth * 0.45,
            height: window.innerWidth * 0.5
          },
          results: {
            width: window.innerWidth * 0.45,
            height: window.innerWidth * 0.5
          }
        };
      } else if (action.mode === "picture-in-picture") {
        size = {
          molViewer: {
            width: window.innerWidth * 0.2,
            height: window.innerWidth * 0.2
          },
          results: {
            width: window.innerWidth * 0.8,
            height: window.innerWidth * 0.5
          }
        };
      } else if (action.mode === "fullscreen") {
        size = {
          molViewer: {
            width: 0,
            height: 0,
          },
          results: {
            width: window.innerWidth,
            height: window.innerHeight * 0.5,
          },
        };
      }
      return {
        ...state,
        size: size
      };
    case SET_LOADING: 
      return {
        ...state,
        loading: action.bool
      }
  }
  return state;
}

export const resizeWindow = (mode : string) => {
  const action : any = {
    type: RESIZE_WINDOW,
    mode,
  };

  return dispatchState(action);
}

export const setLoading = (bool : boolean) => {
  const action: any = {
    type: SET_LOADING,
    bool,
  }

  return dispatchState(action);
}

export interface atom {
  atomNumber: number;
  elem: string | undefined;
  mass: number | undefined;
  position: Array<number>;
}

export interface bond {
  atomIndices: Array<number>;
  bondOrder: number;
}

export interface molecule {
  atoms: Array<atom>;
  bonds: Array<bond>;
  dofs: Array<Array<number>>;
}

const initialMoleculeState : molecule = {
  atoms: [],
  bonds: [],
  dofs: []
};

export const moleculeReducer = (
  state: molecule = initialMoleculeState,
  action: any
) : molecule => {
  switch (action.type) {
    case SET_MOLECULE:
      return {
        ...state,
        atoms: action.molecule.atoms,
        bonds: action.molecule.bonds,
        dofs: action.molecule.dofs
      };
    case SET_ATOM_POSITIONS:
      return {
        ...state,
        atoms: action.atoms
      }
  }
  return state;
}

export const Elements : {
  name: Map<number, string>,
  mass: Map<number, number>,
} = {
  name: new Map([
    [1, "H"],
    [2, "He"],
    [3, "Li"],
    [4, "Be"],
    [5, "B"],
    [6, "C"],
    [7, "N"],
    [8, "O"],
    [9, "F"]
  ]),
  mass: new Map([
    [1, 1.0001],
    [2, 2],
    [3, 3],
    [4, 4],
    [5, 5],
    [6, 6],
    [7, 7],
    [8, 8],
    [9, 9],
  ])
};

export const setMolecule = (object : any) => {
  const molecule : molecule = {
    atoms: object.atoms.map((atom : any) : atom => {
      return {atomNumber: atom[0], elem: Elements.name.get(atom[0]), mass: Elements.mass.get(atom[0]), position: atom[1]}
    }),
    bonds: object.bonds.map((bond: any, index : number) : bond => {
      return {atomIndices : bond, bondOrder: object.bond_orders[index]}
    }),
    dofs: object.dofs
  };

  const action : any = {
    type: SET_MOLECULE,
    molecule,
  };

  return dispatchState(action);
}

export const setAtomPositions = (object : any) => {
  const atoms: Array<atom> = object.atoms.map((atom : any) : atom => {
    return {atomNumber: atom[0], elem: Elements.name.get(atom[0]), mass: Elements.mass.get(atom[0]), position: atom[1]}
  })

  const action : any = {
    type: SET_ATOM_POSITIONS,
    atoms
  }

  return dispatchState(action);
}

export interface axis {
  min: number;
  max: number;
  interval: number;
  dof: Array<string | number>;
}

interface job {
  method: string;
  basisSet: string;
  numAxis: number;
  submitted: boolean;
  finished: boolean;
  axis: Array<axis>;
  currAxisValues: Array<number>;
}

const initialJobState : job = {
  method: "Hartree-Fock",
  basisSet: "sto-3g",
  numAxis: 0,
  submitted: false,
  finished: false,
  axis: [],
  currAxisValues: []
};

export const jobReducer = (
  state: job = initialJobState,
  action: any
) : job => {
  switch (action.type) {
    case SET_METHOD:
      return {
        ...state,
        method: action.method
      };
    case SET_BASIS_SET:
      return {
        ...state,
        basisSet: action.basis
      }
    case SUBMIT_JOB:
      return {
        ...state,
        submitted: true,
        finished: false
      };
    case FINISH_JOB:
      return {
        ...state,
        submitted: false,
        finished: true
      }
    case ADD_AXIS:
      return {
        ...state,
        numAxis: state.numAxis + 1,
        axis: [...state.axis, action.axis],
        currAxisValues: [...state.currAxisValues, action.axis.min]
      };
    case REMOVE_AXIS:
      state.axis.splice(action.index, 1);
      state.currAxisValues.splice(action.index, 1);
      return {
        ...state,
        numAxis: state.numAxis - 1
      };
    case CHANGE_AXIS:
      return {
        ...state,
        axis: state.axis.map((ax : axis, index : number) => {
          return index === action.index ? action.axis : ax
        }),
        currAxisValues : state.currAxisValues.map((value : number, index : number) => {
          return index === action.index ? 0 : value
        })
      }
    case SET_CURR_AXIS_VALUE:
      return {
        ...state,
        currAxisValues: state.currAxisValues.map((value: number, index : number) => {
          return index === action.index ? ((action.value - state.axis[index].min) / state.axis[index].interval) : value
        })
      }
  }
  return state;
}

export const setMethod = (method : string) => {
  const action : any = {
    type: SET_METHOD,
    method,
  };

  return dispatchState(action);
};

export const setBasisSet = (basis : string) => {
  const action : any = {
    type: SET_BASIS_SET,
    basis,
  };

  return dispatchState(action);
};

export const addAxis = (axis: axis) => {
  const action : any = {
    type: ADD_AXIS,
    axis
  };

  return dispatchState(action);
}

export const removeAxis = (index : number) => {
  const action : any = {
    type: REMOVE_AXIS,
    index
  };

  return dispatchState(action);
}

export const changeAxis = (index: number, axis : axis) => {
  const action : any = {
    type: CHANGE_AXIS,
    index,
    axis
  };

  return dispatchState(action);
}

export const submitJob = () => {
  const action : any = {
    type: SUBMIT_JOB,
  };

  return dispatchState(action);
}

export const finishJob = () => {
  const action : any = {
    type: FINISH_JOB,
  };

  return dispatchState(action);
}

export const setCurrAxisValue = (value : number, index : number) => {
  const action : any = {
    type: SET_CURR_AXIS_VALUE,
    index,
    value
  }

  return dispatchState(action);
}