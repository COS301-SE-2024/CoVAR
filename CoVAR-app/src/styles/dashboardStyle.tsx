import { SxProps } from '@mui/material/styles';

export const chartContainerStyles: SxProps = {
  padding: 2,
  backgroundColor: '#2D3E44',
  color: '#CAD2C5',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center', // Center content horizontally
  alignItems: 'center', // Center content vertically
  flex: 1,
  '& .recharts-wrapper': {
    fill: 'none',
  },
  '& .recharts-cartesian-axis-tick': {
    fill: '#CAD2C5',
  },
  '& .recharts-cartesian-axis-line': {
    stroke: '#CAD2C5',
  },
  '& .recharts-cartesian-grid-line': {
    stroke: '#3E4E56',
  },
};


export const listContainerStyles: SxProps = {
  padding: 2,
  backgroundColor: '#2D3E44',
  color: '#CAD2C5',
  height: '100%',
};
