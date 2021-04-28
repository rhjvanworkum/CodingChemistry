import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import Layout from './components/Layout';
import Home from './pages/home';
import MolecularArt from './pages/molecular-art';
import SimpleMDSimulator from './pages/simple-md-simulator';
import Pessenger from './pages/pessenger';
import MoViewer from './pages/mo-viewer';
import { shallowEqual, useSelector } from 'react-redux';


const App: React.FC = () => {
  const {loading} = useSelector((state : any) => state.control, shallowEqual);

  return (
    <Router>
      <Layout>
        <div className="App">
          {loading && <LinearProgress />}
          <Route path="/" exact component={Home} />
          <Route path="/molecular-art" exact component={MolecularArt} />
          <Route path="/simple-md-simulator" exact component={SimpleMDSimulator} />
          <Route path="/pessenger" exact component={Pessenger} />
          <Route path="/mo-viewer" exact component={MoViewer} />
        </div>
      </Layout>
    </Router>
  );
}

export default App;
