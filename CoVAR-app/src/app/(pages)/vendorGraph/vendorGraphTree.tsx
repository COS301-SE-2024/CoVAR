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
            left: '7%',
            bottom: '5%',
            right: '15%',
            symbol: 'circle',
            symbolSize: 30,
            layout: 'orthogonal',
            orient: 'TB',
            label: {
              position: 'top',
              verticalAlign: 'middle',
              align: 'center',
              fontSize: 12,
            },
            leaves: {
              label: {
                position: 'top',
                verticalAlign: 'middle',
                align: 'center',
              },
            },
            expandAndCollapse: true,
            initialTreeDepth: 2,
            animationDurationUpdate: 750,
          },
        ],
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
        },
      };

      chartInstance.setOption(option);
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
