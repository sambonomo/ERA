import { motion } from 'framer-motion';
import { Box, Paper, Card } from '@mui/material';

// Using motion.create() instead of motion() to avoid deprecation warnings
export const MotionBox = motion.create(Box);
export const MotionPaper = motion.create(Paper);
export const MotionCard = motion.create(Card);

// Define common animations
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default {
  MotionBox,
  MotionPaper,
  MotionCard,
  fadeInUp,
  fadeIn,
  staggerContainer
}; 