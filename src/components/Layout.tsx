import React from 'react';
import { Link } from 'react-router-dom';
import GitHubIcon from '@material-ui/icons/GitHub';
import LinkedInIcon from '@material-ui/icons/LinkedIn';

import '../layout.scss';

const Layout : React.FC = ({ children }) => {

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="site-title">
          <Link to="/">Home</Link>
        </div>
        <nav className="navigation"> 
          <Link to="/pessenger">Pessenger</Link>
          <Link to="/mo-viewer">MO Viewer</Link>
          <Link to="/simple-md-simulator">simple MD Simulator</Link>
          <Link to="/molecular-art">Molecular Art</Link>
        </nav>
      </header>
      {children}
      <footer className="site-footer">
        <a href="https://github.com/rhjvanworkum/CodingChemistry">Find the code for this website here</a>
        <p style={{marginTop: '1%'}}>&copy; {new Date().getFullYear()} A website by Ruard van Workum</p>
        <a href="https://github.com/rhjvanworkum"><GitHubIcon></GitHubIcon></a>
        <a href="https://www.linkedin.com/in/ruard-van-workum-6a9889174/"><LinkedInIcon></LinkedInIcon></a>
      </footer>
    </div>
  )
}

export default Layout;