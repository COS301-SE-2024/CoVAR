// HelpDialog.tsx
'use client'
import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation'; 
import { getUserRole } from '../../../functions/requests';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

type HelpContent = {
  [key: string]: React.JSX.Element;
};

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
  const pathname = usePathname(); 
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 

  const redirectToLogin = useCallback(() => {
    router.replace('/login');
  }, [router]);
  
  const fetchUserRole = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const data = await getUserRole(accessToken);
        setRole(data.role);
        console.log(data.role);
      }
    } catch (error:any) {
      if (error.response?.status === 403) {
        redirectToLogin();
      }
    } finally {
      setLoading(false);
    }
  }, [redirectToLogin]); 

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  const helpContent: HelpContent = {
    '/dashboard': (
      <>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        {role === 'admin' && (
          <>
            <Typography variant="body1" paragraph>
              The Admin Dashboard enables administrators to effectively manage users and monitor system activity. Key features include:
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>User Metrics:</strong> Provides an overview of total users, including admins, vulnerability assessors (VAs), and clients.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Role Distribution:</strong> Insights into the distribution of user roles for better management.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Pending Invites:</strong> Lists user invitations along with their current status (accepted, rejected, or pending).
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Unauthorised Users (Last Week):</strong> Displays a list of unauthorised users who attempted access in the past week, including their details and actions, as well as the ability to Authorise them.
            </Typography>
            <Typography variant="body1" paragraph>
              Overall, the Admin Dashboard is a vital tool for user management and monitoring system security.
            </Typography>
          </>
        )}
        {role === 'va' && (
          <>
            <Typography variant="body1" paragraph>
              The VA Dashboard enables vulnerability assessors to efficiently manage assigned clients and organisations. Key features include:
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Report Metrics:</strong> A graphical representation of the number of reports associated with each client and organisation, allowing assessors to track progress and performance.
            </Typography>
            <Typography variant="body1" paragraph>
            <strong>Assigned Clients and Organisations:</strong> View a list of clients and organisations assigned to the assessor. 
            Each entry includes the date and time of the last report submitted, ensuring assessors stay updated on recent activities. 
            Additionally, assessors have the option to evaluate each their clients.
          </Typography>

            <Typography variant="body1" paragraph>
              Overall, the VA Dashboard is a critical tool for assessing and managing vulnerability reports for clients effectively.
            </Typography>
          </>
        )}
        {role === 'client' && (
          <>
             <Typography variant="body1" paragraph>
              The Client Dashboard provides a comprehensive view of your system&#39;s security posture by summarising vulnerabilities and their severities. Key features include:
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Severity Distribution:</strong> At a glance, the dashboard displays the distribution of vulnerabilities across different severity levels: Critical, High, Medium, and Low. This visual representation allows you to quickly assess the overall risk landscape and prioritise remediation efforts accordingly.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Vulnerabilities Over Time:</strong> The Vulnerabilities Over Time graph illustrates the trend of vulnerabilities across reports, enabling you to track improvements or identify recurring issues over specific periods. Each report is clearly labelled, allowing you to correlate vulnerability changes with remediation activities or changes in your environment.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Top Vulnerabilities:</strong> The dashboard highlights the most critical vulnerabilities impacting your systems. By focusing on these top vulnerabilities, you can take immediate action to enhance your security measures.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Filter by Severity:</strong> To streamline your review process, you can filter vulnerabilities based on their severity. This feature allows you to customise your view and concentrate on the vulnerabilities that matter most to your organisation, ensuring that your security efforts are targeted and efficient.
            </Typography>
          </>
        )}
      </>
    ),
    '/evaluate': (
      <>
        <Typography variant="h4" gutterBottom>
          Evaluate
        </Typography>
        <Typography variant="body1" paragraph>
          The Evaluate page is designed for vulnerability assessors to upload and manage vulnerability assessment reports for users or organisations. Key features include:
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Report Upload:</strong> Vulnerability assessors can upload assessment files in CSV, <code>.nessus</code>, or XML formats.
          <br />
          Assessors can select reports generated by Greenbone or Nessus from their local machine to submit for evaluation.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>File Management:</strong> Uploaded files are listed, allowing assessors to:
          <ul style={{ paddingLeft: '2vw' }}> 
            <li><strong>Download Files:</strong> Retrieve uploaded reports for review.</li>
            <li><strong>Delete Files:</strong> Remove unnecessary or incorrect files.</li>
            <li><strong>Add to Report:</strong> Select up to two reports for inclusion in the client’s final assessment.</li>
          </ul>
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Report Preview:</strong> A preview of the selected reports is displayed on the right-hand side, showing what will be included in the evaluation.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Next Steps:</strong> After uploading and selecting reports, assessors proceed to the Conflict Resolution page. This page identifies conflicts between the two uploaded reports and provides several options:
          <ul style={{ paddingLeft: '2vw' }}> 
            <li><strong>Manual Resolution:</strong> The assessor can manually resolve each conflict and choose which details to include in the final client assessment.</li>
            <li><strong>AI Conflict Resolution:</strong> The assessor can choose to let AI automatically resolve the conflicts based on predefined logic and assessment criteria.</li>
          </ul>
        </Typography>
        <Typography variant="body1" paragraph>
          The Evaluate page provides a streamlined process for uploading reports and preparing client assessments, with flexible options for handling conflicts either manually or with AI assistance.
        </Typography>

      </>
    ),
    '/vendorGraph': (
      <>
        <Typography variant="h4" gutterBottom>
          Vendor Graph
        </Typography>
        <Typography variant="body1" paragraph>
          The Vendor Graph page provides a visual representation of vulnerabilities associated with various software vendors and their respective fixes. This page allows you to explore how many vulnerabilities are tied to each vendor and version, as well as the specific CVEs related to them.
          Key Features Include:
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Select Report:</strong> Use the dropdown menu to choose a specific report date. The data visualisation will update accordingly, allowing you to track changes over time.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Vendor Fixes Visualisation:</strong> The tree graph displays the vendors and the versions of their software that have vulnerabilities. Each node represents a vendor, with child nodes representing specific versions and further branching into the related CVEs.
        </Typography>
        <Typography variant="body1" paragraph>
          Clicking on a CVE node will redirect you to its detailed page on the CVE Details website, providing you with comprehensive information about the vulnerability.
        </Typography>
        <Typography variant="body1" paragraph>
          By reviewing the vendor graph, you can gain insights into the vulnerabilities affecting your systems and make informed decisions about necessary updates or patches.
        </Typography>
      </>
    ),

    '/organisation': (
      <>
        <Typography variant="h4" gutterBottom>
          Organisation
        </Typography>
        <Typography variant="body1" paragraph>
          The Organisation page enables users to create, join, and manage their organisation efficiently. Organisation owners 
          can invite and remove members, update the organisation&#39;s name, and disband the organisation when needed. 
          Members have the ability to view details of other organisation members and leave the organisation at their discretion.
        </Typography>


      </>
    ),
    '/reports': (
        <>
          <Typography variant="h4" gutterBottom>
            Reports
          </Typography>
          <Typography variant="body1" paragraph>
            The Reports page provides an overview of all vulnerability assessment reports generated for your systems. Each report includes essential information to help you understand your security posture. Key features include:
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Report Overview:</strong> Each report is displayed in a table format, showing key details such as the Report ID, Date Created, and the counts of vulnerabilities categorised by severity (Critical, Medium, Low). This allows you to quickly assess the status of each report at a glance.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Actions:</strong> For each report, you have the option to download both the Technical Report and the Executive Report. The Technical Report provides detailed findings and recommendations, while the Executive Report summarises the key risks and necessary actions for stakeholders.
          </Typography>
          <Typography variant="body1" paragraph>
            By regularly reviewing your reports, you can ensure that you stay informed about your organisation&#39;s vulnerabilities and take proactive measures to enhance your security posture.
          </Typography>
        </>
      ),
    '/adminTools': (
      <>
        <Typography variant="h4" gutterBottom>
          Admin Tools
        </Typography>
        <Typography variant="body1" paragraph>
          The Admin Tools page provides functionalities for managing users and their roles within the system.
          Admins can view a list of users, authorise new users, assign or unassign vulnerability assessors and their clients, as well as search for users.
        </Typography>
      </>
    ),
  };

  return (
    <Dialog open={open} onClose={onClose}>

    <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {helpContent[pathname] || (
          <Typography variant="body1">No help information available for this page.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpDialog;
