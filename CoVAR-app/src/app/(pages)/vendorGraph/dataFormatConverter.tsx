type TreeNode = {
    name: string;
    children?: TreeNode[];
    symbolSize?: number[];
    itemStyle?: { color: string, borderRadius?: number };
    symbol?: string;
    label?: {
        show?: boolean,
        position: string, 
        verticalAlign: string,
        align: string,
        fontSize: number,
    };
    tooltip?: {
        show: boolean,
        formatter: string,
    };
};

function calculateNodeColorAndSize(count: number, scale: number): { color: string; size: number } {
    const size = Math.min(15 + count * 5, 40);

    const midpoint = scale / 2;

    let red, green;

    if (count <= midpoint) {
        // Transition from green to yellow
        red = Math.floor((count / midpoint) * 255);
        green = 255;
    } else {
        // Transition from yellow to red
        red = 255;
        green = Math.floor((1 - ((count - midpoint) / midpoint)) * 255);
    }

    const color = `rgb(${red}, ${green}, 0)`;

    return { color, size };
}

function convertHashToTreeData(inputHash: any): TreeNode[] {
    const result: TreeNode[] = [];

    for (const [software, versions] of Object.entries(inputHash)) {
        const softwareNode: TreeNode = {
            name: software,
            children: [],
            symbol: 'rect',
            label: {
                show: true,
                position: 'inside', 
                verticalAlign: 'middle',
                align: 'center',
                fontSize: 12,
            }
        };

        for (const [version, cves] of Object.entries(versions as object)) {
            const cveEntries = Object.entries(cves as object);
            const versionNode: TreeNode = {
                name: version,
                children: [],
                symbol: 'rect',
                label: {
                    show: true,
                    position: 'inside', 
                    verticalAlign: 'middle',
                    align: 'center',
                    fontSize: 12,
                },
                tooltip: {
                    show: true,
                    formatter: `Click to expand/retract CVE's related to ${software}:${version}`
                }
            };

            cveEntries.forEach(([cve, count]) => {
                const { color, size } = calculateNodeColorAndSize(count as number, 7);
                const cveNode: TreeNode = {
                    name: `${cve}\nCount: ${count}`,
                    symbolSize: [size, size],
                    itemStyle: { color },
                    label: {
                        show: true,
                        position: 'inside', 
                        verticalAlign: 'middle',
                        align: 'center',
                        fontSize: 8,
                    },
                    tooltip: {
                        show: true,
                        formatter: `Click to view information about ${cve}`
                    }
                };
                versionNode.children!.push(cveNode);
            });

            // Calculate size and color for the version node based on the number of children
            const { color: versionColor, size: versionSize } = calculateNodeColorAndSize(versionNode.children!.length, 40);
            versionNode.symbolSize = [(versionNode.name.length * 8) + versionSize/4, versionSize];
            versionNode.itemStyle = { color: versionColor, borderRadius: 15 };

            softwareNode.children!.push(versionNode);
        }

        // Calculate size and color for the software node based on the number of children
        const leafCount = softwareNode.children!.reduce((acc, versionNode) => {
            return acc + versionNode.children!.length;
        }, 0);
          
        const { color: softwareColor, size: softwareSize } = calculateNodeColorAndSize(leafCount, 35);

        softwareNode.symbolSize = [(softwareNode.name.length * 8) + softwareSize/4, softwareSize];
        softwareNode.itemStyle = { color: softwareColor, borderRadius: 20 };

        result.push(softwareNode);
    }

    // Wrap the whole structure under a root node called "Vendor Issues" with a green color
    const rootNode: TreeNode = {
        name: "Vendor Issues",
        itemStyle: { color: 'green' },
        symbolSize: [90, 40],
        children: result,
        label: {
            show: true,
            position: 'inside', 
            verticalAlign: 'middle',
            align: 'center',
            fontSize: 12,
        }
    };

    const modifiedResult: TreeNode[] = [];

    return modifiedResult.concat(rootNode);
}
  
export default convertHashToTreeData;