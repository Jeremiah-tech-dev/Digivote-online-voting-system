import React, { useEffect, useRef } from 'react';
// Import only the ECharts pieces we use, to keep the bundle small
import * as echarts from 'echarts/core';
import { BarChart, PieChart, GaugeChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, GraphicComponent, AriaComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart, PieChart, GaugeChart, LineChart,
  GridComponent, TooltipComponent, LegendComponent, GraphicComponent, AriaComponent,
  CanvasRenderer
]);

// A thin React wrapper around an ECharts instance.
// Updates are merged into the existing chart, so live refreshes animate smoothly.
const EChart = ({ option, height = 300, ariaLabel }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(containerRef.current, null, { renderer: 'canvas' });
    chartRef.current = chart;

    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => chart.resize());
      observer.observe(containerRef.current);
    }
    return () => {
      if (observer) observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  // Formatter functions don't survive JSON.stringify, but the data does,
  // which is exactly what decides whether the chart needs updating
  const optionKey = JSON.stringify(option);
  useEffect(() => {
    if (chartRef.current) chartRef.current.setOption(option);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionKey]);

  return <div ref={containerRef} className="echart" style={{ height }} role="img" aria-label={ariaLabel} />;
};

export default EChart;
