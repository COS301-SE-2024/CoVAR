import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Container, Button, Collapse, Skeleton } from '@mui/material';
import { mainContentStyles } from '../../../../styles/evaluateStyle';
import ReportPreviewSkeleton from '../components/reportPreviewSkeleton';

const ReportCard = ({ report, index, loading, reportNames }: { report: any[], index: number, loading: boolean, reportNames: String[] }) => {

  const slicedReport = report.slice(0, 4);
  return (
    <Box sx={{ ...mainContentStyles, overflow: 'hidden' }}>
      {slicedReport.map((item, idx) => (
        <Box key={idx} sx={{ marginTop: '0.8vh' }}>
          <Paper sx={{ padding: '1vh' }}>
            <Typography variant="h6" style={{ textAlign: 'center', padding: '1vh' }}>
              {index === 0 ? reportNames[0] : reportNames[1]}
            </Typography>
            <Typography variant="h6" style={{ textAlign: 'center', padding: '1vh' }}>
              Vulnerability {idx + 1}
            </Typography>
            <Typography variant="body2">
              <strong>IP:</strong> {loading ? <Skeleton width="30%" /> : item.IP}
            </Typography>
            <Typography variant="body2">
              <strong>Hostname:</strong> {loading ? <Skeleton width="40%" /> : item.Hostname}
            </Typography>
            <Typography variant="body2">
              <strong>Port:</strong> {loading ? <Skeleton width="20%" /> : item.Port}
            </Typography>
            <Typography variant="body2">
              <strong>Port Protocol:</strong> {loading ? <Skeleton width="30%" /> : item.portProtocol}
            </Typography>
            <Typography variant="body2">
              <strong>CVSS:</strong> {loading ? <Skeleton width="20%" /> : item.CVSS}
            </Typography>
            <Typography variant="body2">
              <strong>Severity:</strong> {loading ? <Skeleton width="30%" /> : item.Severity}
            </Typography>
            <Typography variant="body2">
              <strong>Solution Type:</strong> {loading ? <Skeleton width="40%" /> : item.solutionType}
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {loading ? <Skeleton width="50%" /> : item.nvtName}
            </Typography>
            <Typography variant="body2">
              <strong>Summary:</strong> {loading ? <Skeleton width="100%" /> : item.Summary}
            </Typography>
            <Typography variant="body2">
              <strong>Specific Result:</strong> {loading ? <Skeleton width="100%" /> : item.specificResult}
            </Typography>
            <Typography variant="body2">
              <strong>NVT OID:</strong> {loading ? <Skeleton width="40%" /> : item.nvtOid}
            </Typography>
            <Typography variant="body2">
              <strong>CVEs:</strong> {loading ? <Skeleton width="60%" /> : item.CVEs}
            </Typography>
            <Typography variant="body2">
              <strong>Task ID:</strong> {loading ? <Skeleton width="30%" /> : item.taskId}
            </Typography>
            <Typography variant="body2">
              <strong>Task Name:</strong> {loading ? <Skeleton width="50%" /> : item.taskName}
            </Typography>
            <Typography variant="body2">
              <strong>Timestamp:</strong> {loading ? <Skeleton width="50%" /> : item.Timestamp}
            </Typography>
            <Typography variant="body2">
              <strong>Result ID:</strong> {loading ? <Skeleton width="40%" /> : item.resultId}
            </Typography>
            <Typography variant="body2">
              <strong>Impact:</strong> {loading ? <Skeleton width="100%" /> : item.Impact}
            </Typography>
            <Typography variant="body2">
              <strong>Solution:</strong> {loading ? <Skeleton width="100%" /> : item.Solution}
            </Typography>
            <Typography variant="body2">
              <strong>Affected Software/OS:</strong> {loading ? <Skeleton width="100%" /> : item.affectedSoftwareOs}
            </Typography>
            <Typography variant="body2">
              <strong>Vulnerability Insight:</strong> {loading ? <Skeleton width="100%" /> : item.vulnerabilityInsight}
            </Typography>
            <Typography variant="body2">
              <strong>Vulnerability Detection Method:</strong> {loading ? <Skeleton width="100%" /> : item.vulnerabilityDetectionMethod}
            </Typography>
            <Typography variant="body2">
              <strong>Product Detection Result:</strong> {loading ? <Skeleton width="100%" /> : item.productDetectionResult}
            </Typography>
            <Typography variant="body2">
              <strong>BIDs:</strong> {loading ? <Skeleton width="60%" /> : item.BIDs}
            </Typography>
            <Typography variant="body2">
              <strong>CERTs:</strong> {loading ? <Skeleton width="60%" /> : item.CERTs}
            </Typography>
            <Typography variant="body2">
              <strong>Other References:</strong> {loading ? <Skeleton width="80%" /> : item.otherReferences}
            </Typography>
          </Paper>
        </Box>

      ))}
    </Box>
  );
};

const ReportPreview = ({ reports, reportIds, client, reportNames }: { reports: any[][], reportIds: Number[], client: String, reportNames: String[] }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    console.log('report names', reportNames);
  }, [reportNames]);


  if (loading) {
    return (
      <ReportPreviewSkeleton />
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Typography variant="h6" align="center">
        Add Reports to Preview.
      </Typography>
    );
  }

  return (
    <Box sx={{ ...mainContentStyles }}>
      <Grid container spacing={2} sx={{ ...mainContentStyles }}>
        {reports.map((report, index) => (
          <Grid item xs={12} key={index}>
            <ReportCard report={report} index={index} loading={loading} reportNames={reportNames} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportPreview;
