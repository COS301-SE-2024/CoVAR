'use client'

import { Box, Card } from '@mui/material';
import { styled } from '@mui/system';

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