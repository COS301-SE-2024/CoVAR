'use client'
import React from "react";
import ReportTable from "../reports/components/table";

interface Issue {
  severity: "Critical" | "Medium" | "Low";
  // Add other properties of the issue if there are any
}

interface ReportContent {
  issues: Issue[];
}

interface Report {
  report_id: string;p
  created_at: string;
  content: ReportContent;
}

interface ReportsPageProps {
  reports: Report[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ reports }) => {
  return (
    <div>
      <h1>Reports</h1>
      <p>Value based on Quality of Detection >= 70%</p>
      <ReportTable reports={reports} />
    </div>
  );
};

export default ReportsPage;