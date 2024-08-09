import React from "react";

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

interface ReportTableProps {
  reports: Report[];
}

const ReportTable: React.FC<ReportTableProps> = ({ reports }) => {
  return (
    <div className="table-container">
      <table className="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Severity</th>
            <th>Critical</th>
            <th>Medium</th>
            <th>Low</th>
            <th>Log</th>
            <th>Executive PDF</th>
            <th>Technical PDF</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => {
            const criticalCount = report.content.issues.filter(
              (issue) => issue.severity === "Critical"
            ).length;
            const mediumCount = report.content.issues.filter(
              (issue) => issue.severity === "Medium"
            ).length;
            const lowCount = report.content.issues.filter(
              (issue) => issue.severity === "Low"
            ).length;
            const logCount = report.content.issues.length;

            return (
              <tr key={report.report_id}>
                <td>{new Date(report.created_at).toLocaleString()}</td>
                <td>{criticalCount + mediumCount + lowCount > 0 ? "⚠️" : ""}</td>
                <td>{criticalCount}</td>
                <td>{mediumCount}</td>
                <td>{lowCount}</td>
                <td>{logCount}</td>
                <td>
                  <a
                    href={`/download/executive/${report.report_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄
                  </a>
                </td>
                <td>
                  <a
                    href={`/download/technical/${report.report_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
