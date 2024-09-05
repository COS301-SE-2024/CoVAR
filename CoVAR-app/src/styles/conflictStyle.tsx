'use client'

import { Box, Card, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ReportsContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    overflow: 'auto',
}));

export const MatchedPair = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

export const ReportRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
}));

export const ReportCard = styled(Card)(({ theme }) => ({
    width: '48%',
}));

export const ButtonGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: theme.spacing(2, 0),
    width: '10%',
    gap: theme.spacing(1),
}));
export const UnmatchedButtonGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    gap: theme.spacing(1),
}));

export const UnmatchedReports = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

export const UnmatchedReportCard = styled(Card)(({ theme, selected }: { theme: any; selected: boolean }) => ({
    marginBottom: theme.spacing(2),
    border: selected ? `4px solid ${theme.palette.success.main}` : 'none',
}));

const l5 = keyframes`
  0%    {inset:0    35px 35px 0   }
  12.5% {inset:0    35px 0    0   }
  25%   {inset:35px 35px 0    0   }
  37.5% {inset:35px 0    0    0   }
  50%   {inset:35px 0    0    35px}
  62.5% {inset:0    0    0    35px}
  75%   {inset:0    0    35px 35px}
  87.5% {inset:0    0    35px 0   }
  100%  {inset:0    35px 35px 0   }
`;

const LoaderWrapper = styled('div') `
  width: 65px;
  aspect-ratio: 1;
  position: relative;

  &:before,
  &:after {
    content: "";
    position: absolute;
    border-radius: 50px;
    box-shadow: 0 0 0 3px inset #fff;
    animation: ${l5} 2.5s infinite;
  }

  &:after {
    animation-delay: -1.25s;
    border-radius: 0;
  }
`;

export const Loader = () => {
  return <LoaderWrapper className="loader" />;
};

