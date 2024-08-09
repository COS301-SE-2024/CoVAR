'use client'
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { helpBoxStyles, helpPaperStyles, helpHeadingStyles, helpTextStyles } from '../../../styles/helpStyle';
import { mainContentStyles } from '../../../styles/sidebarStyle';

const Help: React.FC = () => {
    const theme = useTheme(); 

    return (
        <Box sx={mainContentStyles}>
            <Box sx={{ ...helpBoxStyles, backgroundColor: theme.palette.background.default }}>
                <Paper sx={helpPaperStyles}>
                <Typography variant="h4" fontWeight={600} gutterBottom sx={{ ...helpHeadingStyles, textAlign: 'center' }}
                    >
                        Help and Information
                    </Typography>
                </Paper>

                <Paper sx={helpPaperStyles} elevation={3}>
                    <Typography variant="h4" gutterBottom sx={helpHeadingStyles}>
                        Dashboard
                    </Typography>
                    <Typography variant="body1" paragraph sx={helpTextStyles}>
                        The Dashboard page displays various charts and lists to provide an overview of important data.
                    </Typography>
                </Paper>

                <Paper sx={helpPaperStyles} elevation={3}>
                    <Typography variant="h4" gutterBottom sx={helpHeadingStyles}>
                        Evaluate
                    </Typography>
                    <Typography variant="body1" paragraph sx={helpTextStyles}>
                        The Evaluate page allows users to upload a vulnerability assessment in PDF or CSV format. 
                        Users can select a file from their local machine, view the selected file name, and submit the file 
                        for evaluation.
                    </Typography>
                </Paper>

          
                <Paper sx={helpPaperStyles} elevation={3}>
                    <Typography variant="h4" gutterBottom sx={helpHeadingStyles}>
                        Organisation
                    </Typography>
                    <Typography variant="body1" paragraph sx={helpTextStyles}>
                        The Organisation page allows users to manage their organisation, including adding and removing members,
                        changing the organisation name, and disbanding the organisation. Users can also view a list of current
                        members and their roles. Owners have additional privileges such as adding new members and disbanding
                        the organisation.
                    </Typography>
                </Paper>

                <Paper sx={helpPaperStyles} elevation={3}>
                    <Typography variant="h4" gutterBottom sx={helpHeadingStyles}>
                        Admin Tools
                    </Typography>
                    <Typography variant="body1" paragraph sx={helpTextStyles}>
                        The Admin Tools page provides functionalities for managing users and their roles within the system. 
                        Admins can view a list of users, toggle user roles between &apos;VA&apos; and &apos;Client&apos;, assign or unassign clients 
                        and organisations to users, and search for specific users or organisations.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Help;
