'use client';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface VendorGraphTreeProps {
  data: any[];
}

const VendorGraphTree: React.FC<VendorGraphTreeProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let chartInstance: echarts.ECharts | null = null;
    if (chartRef.current) {
      chartInstance = echarts.init(chartRef.current);

      const option = {
        series: [
          {
            type: 'tree',
            data: data,
            top: '5%',
            left: '1%',
            bottom: '5%',
            right: '1%',
            symbol: 'circle',
            symbolSize: 30,
            layout: 'orthogonal',
            orient: 'TB',
            expandAndCollapse: true,
            initialTreeDepth: 2,
            animationDurationUpdate: 750,
            lineStyle: {
              width: 1.5,
              curveness: 0,
            },
          },
        ],
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
        },
      };

      chartInstance.setOption(option);

      chartInstance.on('click', function (params) {
        const nodeData = params?.data as { children?: any[]; name: string };
        if (!nodeData?.children) {
          const cveName = nodeData.name.split('\n')[0];
          const url = `https://www.cvedetails.com/cve/${cveName}/`;
          window.open(url, '_blank');
        }
      });
    }

    return () => {
      chartInstance?.dispose();
    };
  }, [data]);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '100%', border: '1px solid gray' }}
    ></div>
  );
};

export default VendorGraphTree;
