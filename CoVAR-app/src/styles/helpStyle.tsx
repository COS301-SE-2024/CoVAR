'use client'
import { SxProps, Theme } from '@mui/material/styles';

export const helpBoxStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: (theme) => theme.spacing(3),
  padding: (theme) => theme.spacing(3),
  backgroundColor: (theme) => theme.palette.background.default,
};

export const helpPaperStyles: SxProps<Theme> = {
  padding: (theme) => theme.spacing(2),
  backgroundColor: (theme) => theme.palette.background.paper,
};

export const helpHeadingStyles: SxProps<Theme> = {
  color: (theme) => theme.palette.text.primary,
};

export const helpTextStyles: SxProps<Theme> = {
  color: (theme) => theme.palette.text.primary,
};
