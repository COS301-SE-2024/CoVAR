'use client'
import React from 'react';
import { Box, Typography, Paper, Select, MenuItem, Button, SelectChangeEvent } from '@mui/material';

interface FiltersProps {
    selectedSeverity: string;
    handleSeverityChange: (event: SelectChangeEvent<string>) => void;
    applyFilters: () => void;
}

const Filters: React.FC<FiltersProps> = ({ selectedSeverity, handleSeverityChange, applyFilters }) => {
    return (
        <Paper>
            <Box p={2} textAlign="center" sx={{ overflowY: 'auto', maxHeight: '400px' }}>
                <Typography variant="h6">Filters</Typography>
                <Select
                    fullWidth
                    value={selectedSeverity}
                    onChange={handleSeverityChange}
                >
                    <MenuItem value="">All Severities</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                </Select>
                <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} onClick={applyFilters}>
                    Apply Filters
                </Button>
            </Box>
        </Paper>
    );
};

export default Filters;
