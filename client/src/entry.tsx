import React, { useState, useEffect } from 'react';
import './index.css';
import App from './App';
import { RuntimeProvider } from './runtime/index';
import { Dimensions } from './runtime/interfaces';

const use_dimensions = (): Dimensions => {
  const [height, setHeight] = useState((window && window.innerHeight) || 1000);
  const [width, setWidth] = useState((window && window.innerWidth) || 1000);
  const adjustWindowSize = () => {
    setHeight(window.innerHeight);
    setWidth(window.innerWidth);
  }; 
  useEffect(() => {
    window.addEventListener('resize', adjustWindowSize);
    return () => window.removeEventListener('resize', adjustWindowSize);
  }, []);
  return {
    height,
    width
  };
}

const Entry = () => {
  const dimensions = use_dimensions();
  return(
    <React.StrictMode>
      <RuntimeProvider dimensions={dimensions}>
        <App dimensions={dimensions}/>
      </RuntimeProvider>
    </React.StrictMode>
  );
};

export default Entry;
