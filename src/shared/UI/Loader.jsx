import { CircularProgress } from '@mui/material';
import React from 'react';

const Loader = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', 
    }}>
      <CircularProgress color="#000"  />
    </div>
  );
};

export default Loader;
