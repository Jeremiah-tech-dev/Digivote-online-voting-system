import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { LinesChart, EffectScatterChart } from 'echarts/charts';
import { GeoComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CORRIDOR, FIVE_CITIES } from './cityData';
import { disposeChart, resizeChart } from '../../echartsLifecycle';

echarts.use([LinesChart, EffectScatterChart, GeoComponent, TooltipComponent, CanvasRenderer]);

const COLORS = {
  land: '#dfe6e1',
  landHover: '#cdd8d0',
  edge: '#a9b8ae',
  city: '#1f8a4c',
  cityEdge: '#0f5a30',
  glow: 'rgba(31, 138, 76, 0.55)',
  pin: '#e74c3c',
  pinInk: '#ffffff',
  trail: '#c0392b',
  trailFaint: 'rgba(192, 57, 43, 0.28)',
  equator: 'rgba(44, 62, 80, 0.35)',
  ink: '#2c3e50',
  muted: '#6b7b86',
  surface: '#ffffff'
};
const FONT = "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const KENYA_CENTER = [37.9, 0.15];
const fmt = (n) => n.toLocaleString('en-US');

const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Styles for the five highlighted counties; the active one gets a thicker border and stronger glow
const regions = (activeCounty, pulse, reduce) => FIVE_CITIES.map(c => ({
  name: c.county,
  itemStyle: {
    areaColor: COLORS.city,
    borderColor: COLORS.cityEdge,
    borderWidth: c.county === activeCounty ? 2.4 : 1,
    shadowColor: COLORS.glow,
    shadowBlur: reduce ? 14 : (pulse || c.county === activeCounty ? 30 : 10)
  },
  emphasis: { itemStyle: { areaColor: '#2aa35e', borderColor: COLORS.cityEdge }, label: { color: '#ffffff' } }
}));

const tooltipHTML = (name, codes) => {
  const city = FIVE_CITIES.find(c => c.county === name);
  const code = codes[name];
  const head =
    `<div style="font:600 10.5px ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${COLORS.muted}">County ${code ? String(code).padStart(3, '0') : ''}</div>` +
    `<div style="font:700 17px ${FONT};margin-top:2px;color:${COLORS.ink}">${name}</div>`;
  if (!city) {
    return head + `<div style="font:12.5px ${FONT};color:${COLORS.muted};margin-top:2px">Online voting not available yet</div>`;
  }
  return head +
    `<div style="font:13px ${FONT};color:${COLORS.muted}">${city.city}</div>` +
    `<div style="font:600 14px ${FONT};margin-top:6px;color:${COLORS.ink}">${fmt(city.pop)} people</div>` +
    `<div style="font:600 12px ${FONT};margin-top:4px;color:${COLORS.city}">✓ Digivote is open here</div>`;
};

const buildOption = (codes, showRoutes, reduce) => ({
  backgroundColor: 'transparent',
  animationDurationUpdate: reduce ? 300 : 1400,
  animationEasingUpdate: 'cubicInOut',
  tooltip: {
    trigger: 'item',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.edge,
    borderWidth: 1,
    padding: [10, 14],
    extraCssText: 'border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.18);',
    formatter: p => tooltipHTML(p.name && codes[p.name] ? p.name : (p.data && p.data.county), codes)
  },
  geo: {
    map: 'kenya',
    // No wheel/drag zoom: on a scrolling page it would trap the scroll. Cities zoom on click.
    roam: false,
    aspectScale: 1,
    layoutCenter: ['50%', '52%'],
    layoutSize: '92%',
    center: KENYA_CENTER,
    zoom: reduce ? 1 : 0.82,
    selectedMode: false,
    itemStyle: { areaColor: COLORS.land, borderColor: COLORS.edge, borderWidth: 0.8 },
    label: { show: false },
    emphasis: {
      itemStyle: { areaColor: COLORS.landHover, borderColor: COLORS.edge },
      label: { show: true, color: COLORS.ink, fontFamily: FONT, fontSize: 12, fontWeight: 600 }
    },
    regions: regions(null, false, reduce)
  },
  series: [
    {
      id: 'equator',
      type: 'lines',
      coordinateSystem: 'geo',
      silent: true,
      zlevel: 1,
      lineStyle: { color: COLORS.equator, width: 1, type: [4, 6], curveness: 0 },
      // The label would be cut off on narrow phone screens
      label: { show: window.innerWidth > 600, position: 'end', formatter: 'EQUATOR 0°', color: COLORS.muted, fontFamily: FONT, fontSize: 10 },
      data: [{ coords: [[33.6, 0], [42.4, 0]] }]
    },
    {
      id: 'corridor',
      type: 'lines',
      coordinateSystem: 'geo',
      silent: true,
      zlevel: 2,
      effect: { show: showRoutes && !reduce, period: 3.2, trailLength: 0.55, symbol: 'circle', symbolSize: 5, color: COLORS.trail },
      lineStyle: { color: COLORS.trailFaint, width: showRoutes ? 1.4 : 0, opacity: 1, curveness: 0.22 },
      data: CORRIDOR.map(([a, b]) => ({
        coords: [FIVE_CITIES.find(c => c.county === a).ll, FIVE_CITIES.find(c => c.county === b).ll]
      }))
    },
    {
      id: 'pins',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 3,
      showEffectOn: 'render',
      rippleEffect: { brushType: 'stroke', scale: reduce ? 1 : 5, period: 3.4, number: 3 },
      symbolSize: 9,
      itemStyle: { color: COLORS.pin, borderColor: COLORS.pinInk, borderWidth: 1.5, shadowBlur: 10, shadowColor: 'rgba(231,76,60,.5)' },
      label: {
        show: true,
        distance: 8,
        formatter: p => `{n|${p.data.pin}}`,
        rich: {
          n: { fontFamily: FONT, fontWeight: 700, fontSize: 12, color: COLORS.pinInk, backgroundColor: COLORS.pin, padding: [4, 8], borderRadius: 6 }
        }
      },
      data: FIVE_CITIES.map(c => ({
        name: c.pin,
        county: c.county,
        pin: c.pin,
        value: c.ll,
        label: { position: c.county === 'Kisumu' ? 'left' : (c.county === 'Uasin Gishu' ? 'top' : 'right') }
      }))
    }
  ]
});

const KenyaMap = ({ active, showRoutes, onSelectCity }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const geoInfoRef = useRef({ codes: {}, centers: {} });
  const activeCountyRef = useRef(null);
  const onSelectRef = useRef(onSelectCity);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  onSelectRef.current = onSelectCity;

  // Load the county outlines, then create the chart
  useEffect(() => {
    let disposed = false;
    let pulseTimer;
    let observer;
    const reduce = reducedMotion();

    fetch('/kenya-counties.json')
      .then(response => {
        if (!response.ok) throw new Error('Map data unavailable');
        return response.json();
      })
      .then(geo => {
        if (disposed) return;
        geo.features.forEach(f => {
          geoInfoRef.current.codes[f.properties.name] = f.properties.code;
          geoInfoRef.current.centers[f.properties.name] = f.properties.cp;
        });
        echarts.registerMap('kenya', geo);
        const chart = echarts.init(containerRef.current, null, { renderer: 'canvas' });
        chartRef.current = chart;
        chart.setOption(buildOption(geoInfoRef.current.codes, true, reduce));

        // Settle in from slightly zoomed out
        setTimeout(() => {
          if (!disposed) chart.setOption({ geo: { center: KENYA_CENTER, zoom: 1 } });
        }, 250);

        chart.on('click', p => {
          const name = p.componentType === 'geo' ? p.name : (p.data && p.data.county);
          const index = FIVE_CITIES.findIndex(c => c.county === name);
          if (index >= 0) onSelectRef.current(index);
        });

        // Gentle "breathing" glow on the five counties
        if (!reduce) {
          let pulse = false;
          pulseTimer = setInterval(() => {
            pulse = !pulse;
            chart.setOption({ geo: { regions: regions(activeCountyRef.current, pulse, reduce) } });
          }, 1500);
        }

        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(() => resizeChart(chart, containerRef.current));
          observer.observe(containerRef.current);
        }
        setReady(true);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      clearInterval(pulseTimer);
      if (observer) observer.disconnect();
      disposeChart(chartRef.current);
      chartRef.current = null;
    };
  }, []);

  // Zoom to the active city, or back to the whole country
  useEffect(() => {
    const chart = chartRef.current;
    if (!ready || !chart) return undefined;
    const reduce = reducedMotion();
    const previous = activeCountyRef.current;
    if (previous) chart.dispatchAction({ type: 'downplay', geoIndex: 0, name: previous });
    chart.dispatchAction({ type: 'hideTip' });

    const city = FIVE_CITIES[active];
    activeCountyRef.current = city ? city.county : null;
    chart.setOption({ geo: { regions: regions(activeCountyRef.current, false, reduce) } });

    if (!city) {
      chart.setOption({ geo: { center: KENYA_CENTER, zoom: 1 } });
      return undefined;
    }

    const cp = geoInfoRef.current.centers[city.county] || city.ll;
    chart.setOption({ geo: { center: [(cp[0] + city.ll[0]) / 2, (cp[1] + city.ll[1]) / 2], zoom: city.zoom } });
    const timer = setTimeout(() => {
      chart.dispatchAction({ type: 'highlight', geoIndex: 0, name: city.county });
      // Series 2 is the city pins (after the equator and corridor lines)
      chart.dispatchAction({ type: 'showTip', seriesIndex: 2, dataIndex: active });
    }, reduce ? 0 : 1250);
    return () => clearTimeout(timer);
  }, [active, ready]);

  // Turn the corridor trails on or off
  useEffect(() => {
    const chart = chartRef.current;
    if (!ready || !chart) return;
    chart.setOption({
      series: [{ id: 'corridor', effect: { show: showRoutes && !reducedMotion() }, lineStyle: { width: showRoutes ? 1.4 : 0 } }]
    });
  }, [showRoutes, ready]);

  if (failed) {
    return <p className="cities-map-loading">The map could not load. Please refresh the page to try again.</p>;
  }
  return <div ref={containerRef} className="cities-map-canvas" />;
};

export default KenyaMap;
