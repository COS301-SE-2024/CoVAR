import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
  },
  tableHeader: {
    margin: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableRow: {
    margin: 5,
    fontSize: 10,
  },
});

// Create Document Component
const MyDocument = ({ reports }: { reports: any[][] }) => (
  <Document>
    {reports.map((report, index) => (
      <Page size="A4" style={styles.page} key={index}>
        <Text style={styles.header}>Report {index + 1}</Text>
        <View style={styles.section}>
          <Text style={styles.tableHeader}>Plugin ID | CVE | CVSS v2.0 Base Score | Risk | Host | Protocol | Port | Name | Synopsis | Description | Solution | Risk Factor</Text>
          {report.map((item, idx) => (
            <Text style={styles.tableRow} key={idx}>
              {`${item.pluginID} | ${item.CVE} | ${item.cvssBaseScore} | ${item.Risk} | ${item.Host} | ${item.Protocol} | ${item.Port} | ${item.Name} | ${item.Synopsis} | ${item.Description} | ${item.Solution} | ${item.riskFactor}`}
            </Text>
          ))}
        </View>
      </Page>
    ))}
  </Document>
);

const ReportPreview = ({ reports }: { reports: any[][] }) => {
  if (!reports || reports.length === 0) {
    return <div>No reports to display</div>;
  }

  return (
    <PDFViewer width="100%" height="600px">
      <MyDocument reports={reports} />
    </PDFViewer>
  );
};

export default ReportPreview;