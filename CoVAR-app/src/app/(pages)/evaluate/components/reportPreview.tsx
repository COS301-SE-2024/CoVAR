import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Container, Button, Collapse } from '@mui/material';
import { mainContentStyles } from '../../../../styles/evaluateStyle';
import axios from 'axios';

const styles = {
  card: {
    padding: 16,
    marginBottom: 16,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
  },
  item: {
    marginBottom: 8,
  },
  description: {
    marginTop: 8,
  },
};


const ReportCard = ({ report, index }: { report: any[], index: number }) => {
  const [openItemIndex, setOpenItemIndex] = useState<number | null>(null);

  return (
    //for greenbone

    <Box sx={{ ...mainContentStyles }}>
      {report.map((item, idx) => (
        <Box key={idx} sx={{ marginTop: '10px' }}>
          <Typography variant="h6" sx={{ ...styles.header }}>
            Upload {idx + 1}
          </Typography>
          <Paper sx={{ padding: '16px' }}>
            <Typography variant="body2"><strong>IP:</strong> {item.IP}</Typography>
            <Typography variant="body2"><strong>Hostname:</strong> {item.Hostname}</Typography>
            <Typography variant="body2"><strong>Port:</strong> {item.Port}</Typography>
            <Typography variant="body2"><strong>Port Protocol:</strong> {item.portProtocol}</Typography>
            <Typography variant="body2"><strong>CVSS:</strong> {item.CVSS}</Typography>
            <Typography variant="body2"><strong>Severity:</strong> {item.Severity}</Typography>
            <Typography variant="body2"><strong>Solution Type:</strong> {item.solutionType}</Typography>
            <Typography variant="body2"><strong>NVT Name:</strong> {item.nvtName}</Typography>
            <Typography variant="body2"><strong>Summary:</strong> {item.Summary}</Typography>
            <Typography variant="body2"><strong>Specific Result:</strong> {item.specificResult}</Typography>
            <Typography variant="body2"><strong>NVT OID:</strong> {item.nvtOid}</Typography>
            <Typography variant="body2"><strong>CVEs:</strong> {item.CVEs}</Typography>
            <Typography variant="body2"><strong>Task ID:</strong> {item.taskId}</Typography>
            <Typography variant="body2"><strong>Task Name:</strong> {item.taskName}</Typography>
            <Typography variant="body2"><strong>Timestamp:</strong> {item.Timestamp}</Typography>
            <Typography variant="body2"><strong>Result ID:</strong> {item.resultId}</Typography>
            <Typography variant="body2"><strong>Impact:</strong> {item.Impact}</Typography>
            <Typography variant="body2"><strong>Solution:</strong> {item.Solution}</Typography>
            <Typography variant="body2"><strong>Affected Software/OS:</strong> {item.affectedSoftwareOs}</Typography>
            <Typography variant="body2"><strong>Vulnerability Insight:</strong> {item.vulnerabilityInsight}</Typography>
            <Typography variant="body2"><strong>Vulnerability Detection Method:</strong> {item.vulnerabilityDetectionMethod}</Typography>
            <Typography variant="body2"><strong>Product Detection Result:</strong> {item.productDetectionResult}</Typography>
            <Typography variant="body2"><strong>BIDs:</strong> {item.BIDs}</Typography>
            <Typography variant="body2"><strong>CERTs:</strong> {item.CERTs}</Typography>
            <Typography variant="body2"><strong>Other References:</strong> {item.otherReferences}</Typography>
          </Paper>
        </Box>
      ))}
    </Box>

    //for nessus
    // <Box sx={{ ...mainContentStyles }} key={index}>
    //   <Typography variant="h6" style={styles.header}>
    //     Upload {index + 1}
    //   </Typography>
    //   {report.map((item, idx) => (
    //     <Paper key={idx} style={{ marginTop: '10px' }}>
    //       <Typography variant="body2"><strong>Plugin ID:</strong> {item.pluginID}</Typography>
    //       <Typography variant="body2"><strong>CVE:</strong> {item.CVE}</Typography>
    //       <Typography variant="body2"><strong>CVSS v2.0 Base Score:</strong> {item.cvssBaseScore}</Typography>
    //       <Typography variant="body2"><strong>Risk:</strong> {item.Risk}</Typography>
    //       <Typography variant="body2"><strong>Host:</strong> {item.Host}</Typography>
    //       <Typography variant="body2"><strong>Protocol:</strong> {item.Protocol}</Typography>
    //       <Typography variant="body2"><strong>Port:</strong> {item.Port}</Typography>
    //       <Typography variant="body2"><strong>Name:</strong> {item.Name}</Typography>
    //       <Typography variant="body2"><strong>Synopsis:</strong> {item.Synopsis}</Typography>

    //       <Button
    //         variant="outlined"
    //         color="primary"
    //         onClick={() => setOpenItemIndex(openItemIndex === idx ? null : idx)}
    //         style={{ marginTop: 8 }}
    //       >
    //         {openItemIndex === idx ? 'Hide Description' : 'Show Description'}
    //       </Button>

    //       <Collapse in={openItemIndex === idx}>
    //         <Box style={styles.description}>
    //           <Typography variant="body2"><strong>Description:</strong> {item.Description}</Typography>
    //           <Typography variant="body2"><strong>Solution:</strong> {item.Solution}</Typography>
    //         </Box>
    //       </Collapse>
    //     </Paper>
    //   ))}
    // </Box>
  );
};

const ReportPreview = ({ reports, reportIds, client }: { reports: any[][], reportIds: Number[], client: String }) => {
  if (!reports || reports.length === 0) {
    return <Typography>No reports to display</Typography>;
  }
  
  const generateReport = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        '/api/uploads/generateReport',
        { reports, reportIds, client },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Report generated successfully:', response.data);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <>
      <Box sx={{ ...mainContentStyles }}>
        <Grid container spacing={2} sx={{ ...mainContentStyles }}>
          {reports.map((report, index) => (
            <Grid item xs={12} key={index}>
              <ReportCard report={report} index={index} />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{ position: 'fixed', bottom: '5vh', right: '20%' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={generateReport}
          sx={{ marginTop: 2 }}
        >
          Generate Report
        </Button>
      </Box>
    </>
  );
};

export default ReportPreview;
