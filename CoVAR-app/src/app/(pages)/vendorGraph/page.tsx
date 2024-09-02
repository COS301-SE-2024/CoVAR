'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import { getAllReports } from '@/functions/requests';
import { VulnerabilityReport } from '../dashboard/page';
import { chartContainerStyles } from '@/styles/dashboardStyle';

type versionCount = {
	[version: string]: number,
}

type vendorFixes = {
	[vendor: string]: versionCount,
}

const VendorGraph: React.FC = () => {
	const [vendorFixes, setVendorFixes] = useState<vendorFixes>();
	const [reports, setReports] = useState<any[]>([]);
	const [reportMap, setReportMap] = useState<any>({});
	const [selectedReport, setSelectedReport] = useState('');
    const initialMount = useRef(true);

	const createVendorFixes = (report:any) => {
		const vendors: vendorFixes = {};
		const vulnerabilities: VulnerabilityReport[] = report.content.finalReport;

		for (const vulnerability of vulnerabilities) {
			if(vulnerability.solutionType != "VendorFix"){
				continue;
			}

			let vendor = vulnerability.nvtName.split(" ")[0];
			vendor = vendor.replace(/:$/, "");

			if (!vendors[vendor]) {
				vendors[vendor] = {};
			}

			const installedVersionMatch = vulnerability.specificResult.match(/Installed version:\s*([\d.]+)/);
			if (installedVersionMatch) {
				const installedVersion = installedVersionMatch[1];

				if (!vendors[vendor][installedVersion]) {
					vendors[vendor][installedVersion] = 1;
				} else {
					vendors[vendor][installedVersion]++;
				}
			}
		}

		setVendorFixes(vendors);
	}

	const changeReport = (reportDate: string) => {
		if (reportMap[reportDate] === undefined) {
			return;
		}

		const report = reports[reportMap[reportDate]];
		createVendorFixes(report);
		setSelectedReport(reportDate);
	}

	const fetchReports = async () => {
		try {
			const responseData = await getAllReports();
			setReports(responseData);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (initialMount.current) {
            fetchReports();
            initialMount.current = false;
        }
	}, []);

	useEffect(() => {
		if(reports?.length == undefined || reports.length < 1){
			return;
		}
		
		let firstReport = '';
		const reportMap: any = {};

		reports.forEach((report, index) => {
			const createDate = report.created_at;

			if (index === 0) {
				firstReport = createDate;
			}

			reportMap[createDate] = index;
		});

		setReportMap(reportMap);

		// if (reportMap[firstReport] !== undefined) {
		// changeReport(firstReport);
		// }

	}, [reports]);

	return (
		<Box sx={mainContentStyles}>
			<FormControl fullWidth>
				<InputLabel id="report-select-label">Select Report</InputLabel>
				<Select
				labelId="report-select-label"
				value={selectedReport}
				label="Select Report"
				onChange={(e) => changeReport(e.target.value as string)}
				>
				{reportMap && Object.keys(reportMap).map((reportDate) => (
					<MenuItem key={new Date(reportDate).toLocaleString()} value={reportDate}>
						{new Date(reportDate).toLocaleString()}
					</MenuItem>
				))}
				</Select>
			</FormControl>
			<Paper sx={chartContainerStyles}>
				<Typography variant="h6">{JSON.stringify(vendorFixes, null, 2)}</Typography>
			</Paper>
		</Box>
	);
};

export default VendorGraph;
