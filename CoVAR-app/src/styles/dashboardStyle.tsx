'use client'
import { SxProps, Theme } from '@mui/material/styles';

export const chartContainerStyles: SxProps<Theme> = (theme) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  height: '100%',
  '& .recharts-wrapper': {
    fill: 'none',
  },
  '& .recharts-cartesian-axis-tick': {
    fill: theme.palette.text.secondary,
  },
  '& .recharts-cartesian-axis-line': {
    stroke: theme.palette.divider,
  },
  '& .recharts-cartesian-grid-line': {
    stroke: theme.palette.divider,
  },
});

// Updated listContainerStyles to use theme
export const listContainerStyles: SxProps<Theme> = (theme) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  height: '100%',
});
