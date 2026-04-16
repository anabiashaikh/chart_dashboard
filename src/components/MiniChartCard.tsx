'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartConfig } from '@/data/chartsData';

function downloadCSV(config: ChartConfig) {
  const isQuarterly = config.id.includes('quarter');
  const header = [isQuarterly ? 'Quarter' : 'Year', config.title, isQuarterly ? 'QoQ Change (%)' : 'YoY Change (%)'];
  const rows = config.data.map(d => [
    d.period,
    d.value.toFixed(1),
    `${d.growth >= 0 ? '+' : ''}${d.growth}%`
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.id}-data.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


interface MiniChartProps {
  config: ChartConfig;
  onClick: () => void;
}

export default function MiniChartCard({ config, onClick }: MiniChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const container = d3.select(chartRef.current);
    container.selectAll('*').remove();

    const data = config.data;
    const cRect = chartRef.current.getBoundingClientRect();
    const totalW = cRect.width || 280;
    const totalH = 130;
    const m = { top: 22, right: 48, bottom: 18, left: 4 };
    const W = totalW - m.left - m.right;
    const H = totalH - m.top - m.bottom;


    const svgEl = container.append('svg')
      .attr('viewBox', `0 0 ${totalW} ${totalH}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%').style('height', `${totalH}px`).style('overflow', 'visible');

    const svg = svgEl.append('g').attr('transform', `translate(${m.left},${m.top})`);
    const activeColor = config.gradients.future.top;

    const x = d3.scaleBand().domain(data.map(d => d.period)).range([0, W]).padding(0.3);
    const y = d3.scaleLinear().domain([0, config.yMax]).range([H, 0]);

    const futureStartIdx = data.findIndex(d => d.status === 'future');
    if (futureStartIdx > 0) {
      const sepX = (x(data[futureStartIdx - 1].period)! + x(data[futureStartIdx].period)!) / 2 + (x.bandwidth() / 2);
      svg.append('rect').attr('x', sepX).attr('y', -m.top).attr('width', W - sepX)
        .attr('height', H + m.top).attr('fill', activeColor).attr('opacity', 0.06);
      svg.append('text').attr('x', sepX - 5).attr('y', -8).attr('text-anchor','end')
        .attr('font-size','8px').attr('font-weight','600').attr('fill','#94a3b8').text('Past');
      svg.append('text').attr('x', sepX + 5).attr('y', -8).attr('text-anchor','start')
        .attr('font-size','8px').attr('font-weight','600').attr('fill', activeColor).text('Future');
    }

    svg.append('g').attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(x)
        .tickValues(x.domain().filter((_, i) => i % Math.ceil(data.length / 5) === 0))
        .tickSize(0).tickPadding(4))
      .attr('font-size','7px').attr('color','#94a3b8').select('.domain').remove();

    const projY = y(config.projectionTarget);
    svg.append('g').attr('transform', `translate(${W},0)`)
      .call(d3.axisRight(y).ticks(4).tickFormat(d => {
        const abs = Math.abs(d as number);
        if (abs === 0) return '';
        if (abs >= 100) return `$${Math.round(abs)}B`;
        if (abs >= 10) return `$${abs.toFixed(0)}B`;
        return `$${abs.toFixed(1)}B`;
      }).tickSize(0).tickPadding(3))
      .attr('font-size','7px').attr('color','#94a3b8').select('.domain').remove();

    const hG = svg.append('g').attr('transform', `translate(${W + 4},${projY})`);
    hG.append('rect').attr('x',0).attr('y',-7).attr('width',40).attr('height',14).attr('rx',3)
      .attr('fill', activeColor);
    const rawTarget = config.projectionTarget;
    const labelTxt = rawTarget >= 100 ? `$${Math.round(rawTarget)}B` : rawTarget >= 10 ? `$${rawTarget.toFixed(0)}B` : `$${rawTarget.toFixed(1)}B`;
    hG.append('text').attr('x',4).attr('y',3.5).attr('fill','white').attr('font-size','7px').attr('font-weight','700').text(labelTxt);

    svg.selectAll('.mini-bar').data(data).enter().append('rect')
      .attr('class','mini-bar')
      .attr('x', d => x(d.period)!).attr('width', x.bandwidth())
      .attr('y', H).attr('height',0).attr('rx',1.5).attr('ry',1.5)
      .attr('fill', activeColor)
      .transition().duration(900).ease(d3.easeCubicOut)
      .attr('y', d => y(d.value)).attr('height', d => H - y(d.value));

    const labelData = data.slice(-4);
    svg.selectAll('.mini-val-label').data(labelData).enter().append('text')
      .attr('class','mini-val-label')
      .attr('x', d => x(d.period)! + x.bandwidth() / 2).attr('y', d => y(d.value) - 8)
      .attr('text-anchor','middle').attr('font-size','6.5px').attr('font-weight','700').attr('fill','#101828').attr('opacity',0)
      .text(d => d.value >= 100 ? `$${Math.round(d.value)}B` : d.value >= 10 ? `$${d.value.toFixed(0)}B` : `$${d.value.toFixed(1)}B`)
      .transition().delay(800).duration(400).attr('opacity',1);

    svg.selectAll('.mini-gr-label').data(labelData).enter().append('text')
      .attr('class','mini-gr-label')
      .attr('x', d => x(d.period)! + x.bandwidth() / 2).attr('y', d => y(d.value) - 1)
      .attr('text-anchor','middle').attr('font-size','5.5px').attr('font-weight','700')
      .attr('fill', d => d.growth >= 0 ? '#2ecc71' : '#e74c3c').attr('opacity',0)
      .text(d => `${d.growth > 0 ? '+' : ''}${d.growth}%`)
      .transition().delay(900).duration(400).attr('opacity',1);

    // Indicator dash connecting the last bar to the edge
    const lastBarX = x(data[data.length - 1].period)! + x.bandwidth();
    svg.append('line').attr('x1', lastBarX).attr('x2', W).attr('y1', projY).attr('y2', projY)
      .attr('stroke', activeColor).attr('stroke-width', 1.2).attr('stroke-dasharray', '2,3');

  }, [config]);

  return (
    <div className="mini-card" onClick={onClick}>
      <div className="mini-card-header">
        <div className="mini-logo">
          <span style={{ background: '#f35325' }}></span>
          <span style={{ background: '#81bc06' }}></span>
          <span style={{ background: '#05a6f0' }}></span>
          <span style={{ background: '#ffba08' }}></span>
        </div>
        <div className="mini-title">{config.title}</div>
        <div className="mini-icons">
          <span className="mini-icon" title="Bar Chart" onClick={onClick}>📊</span>
          <span className="mini-icon" title="Table" onClick={onClick}>📋</span>
          <span
            className="mini-icon mini-icon-download"
            title="Download CSV"
            onClick={(e) => { e.stopPropagation(); downloadCSV(config); }}
          >⬇️</span>
          <span className="mini-icon mini-icon-more" title="More">⋮</span>
        </div>
      </div>
      <div className="mini-subtitle">{config.subtitle}</div>
      <div ref={chartRef} className="mini-chart-area" />
    </div>
  );
}
