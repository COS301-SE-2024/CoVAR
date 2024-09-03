'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import { getAllReports } from '@/functions/requests';
import { VulnerabilityReport } from '../dashboard/page';
import { chartContainerStyles } from '@/styles/dashboardStyle';
import VendorGraphTree from './vendorGraphTree';
import convertHashToTreeData from './dataFormatConverter';

type cveCount = {
	[cve: string]: number,
}

type versionCount = {
	[version: string]: cveCount,
}

type vendorFixes = {
	[vendor: string]: versionCount,
}

const VendorGraph: React.FC = () => {
	const [vendorFixes, setVendorFixes] = useState<any[]>([]);
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
			let installedVersion = 'X.X';
			if (installedVersionMatch) {
				installedVersion = installedVersionMatch[1];
			}

			const cves = vulnerability.CVEs.split(',');

			if (!vendors[vendor][installedVersion]) {
				vendors[vendor][installedVersion] = {};
			}

			console.log(cves);
			if (cves.length != 0 && cves[0] == '') {
				const cve = 'CVE-XXXX-XXXX';
				if (!vendors[vendor][installedVersion][cve]) {
					vendors[vendor][installedVersion][cve] = 1;
				} else {
					vendors[vendor][installedVersion][cve]++;
				}
			}else{
				cves.forEach((cve) => {
					if (!vendors[vendor][installedVersion][cve]) {
						vendors[vendor][installedVersion][cve] = 1;
					} else {
						vendors[vendor][installedVersion][cve]++;
					}
				});
			}
			
		}

		const treeDataFormat = convertHashToTreeData(vendors);
		console.log(treeDataFormat);
		setVendorFixes(treeDataFormat);
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
				<VendorGraphTree data={vendorFixes}/>
			</Paper>
		</Box>
	);
};

export default VendorGraph;
