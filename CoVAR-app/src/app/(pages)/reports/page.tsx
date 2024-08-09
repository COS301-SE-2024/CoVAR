'use client';
import React, { useEffect, useState } from "react";
import ReportTable from "../reports/components/table";
import { populateReportsTable } from "@/functions/requests"; 

interface Issue {
  severity: "Critical" | "Medium" | "Low";
  // Add other properties of the issue if there are any
}

interface ReportContent {
  issues: Issue[];
}

interface Report {
  report_id: string;
  created_at: string;
  content: ReportContent;
}

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await populateReportsTable();
        if (response && response.data) {
          setReports(response.data.reports);  // Assuming the API returns { reports: [...] }
        }
      } catch (error) {
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Reports</h1>
      <p>Value based on Quality of Detection >= 70%</p>
      <ReportTable reports={reports} />
    </div>
  );
};

export default ReportsPage;
