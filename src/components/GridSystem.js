import React from 'react';
import { Grid as MuiGrid } from '@mui/material';
import { motion } from 'framer-motion';

// Create a wrapper for Grid that handles proper props
export const Grid = ({ children, container, item, xs, sm, md, lg, xl, ...props }) => {
  // Transform old props to new syntax
  const newProps = { ...props };
  
  if (container) {
    newProps.container = true;
  }
  
  if (xs) {
    newProps.xs = xs;
  }
  
  if (sm) {
    newProps.sm = sm;
  }
  
  if (md) {
    newProps.md = md;
  }
  
  if (lg) {
    newProps.lg = lg;
  }
  
  if (xl) {
    newProps.xl = xl;
  }
  
  return <MuiGrid {...newProps}>{children}</MuiGrid>;
};

// Create a motion version of Grid
export const MotionGrid = motion(Grid);

export default Grid; 