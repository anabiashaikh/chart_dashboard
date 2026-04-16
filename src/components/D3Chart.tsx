'use client';

import React, { useEffect, useRef, useCallback, memo } from 'react';
import * as d3 from 'd3';
import { ChartConfig, DataPoint } from '@/data/chartsData';

interface D3ChartProps {
  config: ChartConfig;
  isPlaying: boolean;
  playIndex: number;
  onPlayStep?: (index: number) => void;
  onPlayFinish: () => void;
  onHover?: (data: DataPoint | null) => void;
  onBarClick?: (index: number) => void;
  showLabels: boolean;
  showPct: boolean;
  showTooltip: boolean;
  showGrid: boolean;
  barColor: string | null;
}

const D3ChartComponent = ({
  config,
  isPlaying,
  playIndex,
  onPlayStep,
  onPlayFinish,
  onHover,
  onBarClick,
  showLabels,
  showPct,
  showTooltip,
  showGrid,
  barColor,
}: D3ChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const xRef = useRef<d3.ScaleLinear<number, number> | null>(null);
  const yRef = useRef<d3.ScaleLinear<number, number> | null>(null);
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, HTMLElement, undefined> | null>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const hasAnimatedRef = useRef(false);
  const lastWidthRef = useRef(0);
  const onPlayFinishRef = useRef(onPlayFinish);
  onPlayFinishRef.current = onPlayFinish;
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;
  const onBarClickRef = useRef(onBarClick);
  onBarClickRef.current = onBarClick;
  const onPlayStepRef = useRef(onPlayStep);
  onPlayStepRef.current = onPlayStep;

  // Use a ref for barColor to allow buildChart to access the latest value 
  // without triggering a full rebuild on every color move.
  const barColorRef = useRef(barColor);
  barColorRef.current = barColor;

  // Refs to avoid stale closures in interaction handlers
  const showTooltipRef = useRef(showTooltip);
  showTooltipRef.current = showTooltip;
  const showLabelsRef = useRef(showLabels);
  showLabelsRef.current = showLabels;
  const showPctRef = useRef(showPct);
  showPctRef.current = showPct;

  const buildChart = useCallback(() => {
    if (!containerRef.current) return;
    const currentBarColor = barColorRef.current;
    const container = d3.select(containerRef.current);
    container.selectAll('*').remove();

    const rect = containerRef.current.getBoundingClientRect();
    const totalWidth = rect.width || 900;
    const data = config.data;

    const isMobile = totalWidth <= 640;
    const margin = {
      top: 80,
      right: isMobile ? 45 : 100,
      bottom: 50,
      left: isMobile ? 1 : 30
    };

    // Responsive grid height based on screen size
    let rowHeight = 115; // Desktop (tall)
    if (totalWidth <= 640) {
      rowHeight = 70; // Mobile (compact)
    } else if (totalWidth <= 1024) {
      rowHeight = 90; // Tablet
    }
    const numRows = 4;
    const innerH = numRows * rowHeight;

    widthRef.current = totalWidth - margin.left - margin.right;
    heightRef.current = innerH;
    const W = widthRef.current;
    const H = heightRef.current;

    const svgEl = container.append('svg')
      .attr('viewBox', `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('animation', 'chartFadeIn 0.4s ease');

    const svg = svgEl.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    svgRef.current = svg;

    // Define Gradients in <defs>
    const defs = svgEl.append('defs');
    const gradId = `barGradient-${config.id.replace(/\s+/g, '-')}`;
    const activeColor = currentBarColor || config.gradients.future.top;

    const barGrad = defs.append('linearGradient')
      .attr('id', gradId)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', W).attr('y2', 0);

    barGrad.append('stop')
      .attr('class', 'stop-left')
      .attr('offset', '0%')
      .attr('stop-color', activeColor)
      .attr('stop-opacity', 0.8);

    barGrad.append('stop')
      .attr('class', 'stop-right')
      .attr('offset', '100%')
      .attr('stop-color', activeColor);

    // Define Future Section Gradient (Very soft tint)
    const futureGradId = `futureGradient-${config.id.replace(/\s+/g, '-')}`;
    const futureGrad = defs.append('linearGradient')
      .attr('id', futureGradId)
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');

    futureGrad.append('stop')
      .attr('class', 'future-stop-top')
      .attr('offset', '0%')
      .attr('stop-color', activeColor)
      .attr('stop-opacity', 0.08);

    futureGrad.append('stop')
      .attr('class', 'future-stop-bottom')
      .attr('offset', '100%')
      .attr('stop-color', activeColor)
      .attr('stop-opacity', 0.02);

    const x = d3.scaleBand()
      .domain(data.map(d => d.period.toString()))
      .range([0, W])
      .paddingInner(isMobile ? 0.35 : 0.4)
      .paddingOuter(0.2);

    const y = d3.scaleLinear().domain([0, config.yMax]).range([H, 0]);

    xRef.current = x as any;
    yRef.current = y;

    // Grid rendering (rendered first to be at the bottom layer)
    const vGrid = svg.append('g').attr('class', 'grid grid-vertical').attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(x).tickSize(-H).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f8fafc');
    svg.select('.grid-vertical .domain').remove();
    vGrid.style('display', showGrid ? 'block' : 'none');

    const step = config.yMax / numRows;
    const tickValues = [0, step, step * 2, step * 3, config.yMax];

    const hGrid = svg.append('g').attr('class', 'grid grid-horizontal')
      .call(d3.axisLeft(y).tickValues(tickValues).tickSize(-W).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f1f5f9');
    svg.select('.grid-horizontal .domain').remove();
    hGrid.style('display', showGrid ? 'block' : 'none');

    // Future overlay & Indicators
    const futureStartIndex = data.findIndex(d => d.status === 'future');
    if (futureStartIndex > 0) {
      const sepX = (x(data[futureStartIndex - 1].period.toString())! + x(data[futureStartIndex].period.toString())!) / 2 + (x.bandwidth() / 2);

      // Background gradient tint
      svg.append('rect').attr('x', sepX).attr('y', 0).attr('width', W - sepX)
        .attr('height', H).attr('fill', `url(#${futureGradId})`);

      // Projection dash connecting the last bar to the pill
      const projY = y(config.projectionTarget);
      const lastBarX = x(data[data.length - 1].period.toString())! + x.bandwidth();
      svg.append('line').attr('class', 'projection-dash')
        .attr('x1', lastBarX).attr('x2', W + 12).attr('y1', projY).attr('y2', projY)
        .attr('stroke', activeColor).attr('stroke-width', 2).attr('stroke-dasharray', '3,3');

      // Structural Border Lines (Medium Grey)
      const borderColor = '#94a3b8';

      // Vertical Border Line at the end
      svg.append('line').attr('class', 'future-border-line')
        .attr('x1', W).attr('x2', W).attr('y1', 0).attr('y2', H)
        .attr('stroke', borderColor).attr('stroke-width', 1.5);

      // Top Border Line for Future Section (at the very top) - Stay Themed
      svg.append('line').attr('class', 'future-top-line').attr('x1', sepX).attr('x2', W).attr('y1', 0).attr('y2', 0)
        .attr('stroke', activeColor).attr('stroke-width', 3);

      // Top Arrow (Sharper Triangle - Located at the border corner)
      svg.append('path')
        .attr('d', `M ${W - 4}, 0 L ${W + 4}, 0 L ${W}, -6 Z`)
        .attr('fill', borderColor);

      // Bottom Border Line
      svg.append('line').attr('class', 'chart-bottom-border-line')
        .attr('x1', 0).attr('x2', W).attr('y1', H).attr('y2', H)
        .attr('stroke', borderColor).attr('stroke-width', 1.5);

      // Labels (Past / Future)
      svg.append('text').attr('x', sepX - 12).attr('y', 25).attr('text-anchor', 'end')
        .attr('font-size', '13px').attr('font-weight', '700').attr('fill', '#94a3b8').text('Past');
      svg.append('text').attr('class', 'future-text-label').attr('x', sepX + 12).attr('y', 25).attr('text-anchor', 'start')
        .attr('font-size', '13px').attr('font-weight', '700').attr('fill', activeColor).text('Future');
    }

    // X Axis
    svg.append('g').attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(x)
        // If it's mobile, we also filter the ticks to show every 2nd year to guarantee no merging, while also reducing the font size.
        .tickValues(isMobile ? x.domain().filter((_, i) => i % 2 === 0) : x.domain())
        .tickSize(0).tickPadding(isMobile ? 8 : 15))
      .attr('font-family', 'Inter').attr('font-size', isMobile ? '7.5px' : '11px').attr('font-weight', isMobile ? '500' : '400').attr('color', '#94a3b8')
      .select('.domain').remove();

    // Y Axis (Right side for labels)
    svg.append('g').attr('transform', `translate(${W},0)`)
      .call(d3.axisRight(y).tickValues(tickValues)
        .tickFormat(d => {
          const val = d as number;
          // Format with decimals if EPS, otherwise integer
          const isEPS = config.id.includes('eps');
          const isRatio = config.id.includes('ratio');
          const unit = (isEPS || isRatio) ? '' : 'B';
          const formatted = isEPS ? val.toFixed(1) : val.toFixed(0);

          if (val === config.yMax) return ''; // Hide top tick label as it's the green pill
          return `$${formatted}${unit}`;
        })
        .tickSize(0).tickPadding(isMobile ? 4 : 10))
      .attr('font-family', 'Inter').attr('font-size', isMobile ? '10px' : '11px').attr('font-weight', isMobile ? '600' : '400').attr('color', '#94a3b8')
      .select('.domain').remove();

    // Projection box
    const projY = y(config.projectionTarget);

    const hG = svg.append('g').attr('transform', `translate(${W + 12},${projY})`);
    hG.append('rect').attr('class', 'projection-pill').attr('x', 0).attr('y', -11).attr('width', 52).attr('height', 22).attr('rx', 11)
      .attr('fill', activeColor);
    hG.append('text').attr('x', 26).attr('y', 5).attr('fill', 'white').attr('font-size', isMobile ? '10px' : '11px')
      .attr('text-anchor', 'middle').attr('font-weight', '700').text(`$${config.projectionTarget}B`);

    // Bars
    const barWidth = x.bandwidth();
    svg.selectAll('.bar').data(data).enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.period.toString())!)
      .attr('width', barWidth)
      .attr('y', H).attr('height', 0)
      .attr('rx', isMobile ? 3 : 6).attr('ry', isMobile ? 3 : 6)
      .attr('fill', `url(#${gradId})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const idx = data.findIndex(nd => nd.period === d.period);
        onBarClickRef.current?.(idx);
      })
      .transition().duration(hasAnimatedRef.current ? 0 : 850).ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => H - y(d.value));

    if (!hasAnimatedRef.current) {
      setTimeout(() => {
        hasAnimatedRef.current = true;
      }, 850);
    }

    // Labels (Always rendered, visibility controlled by prop)
    svg.selectAll('.bar-label').data(data).enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.period.toString())! + x.bandwidth() / 2).attr('y', d => y(d.value) - (isMobile ? 13 : 20))
      .attr('text-anchor', 'middle').attr('font-size', isMobile ? '6.5px' : '11px').attr('font-weight', '700')
      .attr('fill', '#101828').attr('opacity', 0)
      .text(d => `$${Math.round(d.value)}${isMobile ? '' : 'B'}`)
      .transition().delay(hasAnimatedRef.current ? 0 : 550).duration(hasAnimatedRef.current ? 0 : 400)
      .attr('opacity', showLabels ? 1 : 0);

    svg.selectAll('.growth-label').data(data).enter().append('text')
      .attr('class', 'growth-label')
      .attr('x', d => x(d.period.toString())! + x.bandwidth() / 2).attr('y', d => y(d.value) - 6)
      .attr('text-anchor', 'middle').attr('font-size', isMobile ? '7px' : '10px').attr('font-weight', '700')
      .attr('fill', d => d.growth >= 0 ? '#2ecc71' : '#e74c3c').attr('opacity', 0)
      .text(d => `${d.growth > 0 ? '+' : ''}${d.growth}%`)
      .transition().delay(hasAnimatedRef.current ? 0 : 550).duration(hasAnimatedRef.current ? 0 : 400)
      .attr('opacity', showPct ? 1 : 0);

    // Tooltip
    let tooltip = d3.select(containerRef.current).select<HTMLDivElement>('.d3-tooltip');
    if (tooltip.empty()) {
      tooltip = d3.select(containerRef.current).append('div').attr('class', 'd3-tooltip') as any;
    }
    tooltipRef.current = tooltip as any;

    // Crosshair overlay
    const overlay = svg.append('rect').attr('width', W).attr('height', H)
      .attr('fill', 'transparent').attr('pointer-events', 'all');
    const ig = svg.append('g').attr('class', 'interaction-group').style('pointer-events', 'none');
    const vLine = ig.append('line').attr('y1', 0).attr('y2', H).attr('stroke', '#475569')
      .attr('stroke-width', 1.5).attr('stroke-dasharray', '4,4').style('opacity', 0);
    const hLine = ig.append('line').attr('x1', 0).attr('x2', W).attr('stroke', '#475569')
      .attr('stroke-width', 1.5).attr('stroke-dasharray', '4,4').style('opacity', 0);

    // Y-Axis Interactive Label
    const yLabel = ig.append('g').style('opacity', 0);
    yLabel.append('rect')
      .attr('x', 0).attr('y', -10).attr('width', 52).attr('height', 20).attr('rx', 10)
      .attr('fill', '#475569');
    const yLabelText = yLabel.append('text')
      .attr('x', 26).attr('y', 4).attr('fill', 'white').attr('font-size', '10px')
      .attr('text-anchor', 'middle').attr('font-weight', '700');

    overlay.on('mousemove', (event: MouseEvent) => {
      const [mx, my] = d3.pointer(event);
      const isTipEnabled = showTooltipRef.current;
      vLine.raise().attr('x1', mx).attr('x2', mx).attr('y1', 0).attr('y2', H).style('opacity', 1);
      hLine.raise().attr('x1', 0).attr('x2', W).attr('y1', my).attr('y2', my).style('opacity', 1);

      const yVal = y.invert(my);
      const unit = config.yMax >= 1000 ? 'T' : 'B';
      const factor = config.yMax >= 1000 ? 1000 : 1;
      const formattedVal = (yVal / factor).toFixed(1);

      yLabel.attr('transform', `translate(${W + 12}, ${my})`).style('opacity', 1);
      yLabelText.text(`$${formattedVal}${unit}`);

      const domain = x.domain();
      const range = x.range();
      const step = x.step();
      const index = Math.floor((mx - range[0]) / step);
      const periodStr = domain[index];
      const d = data.find(nd => nd.period.toString() === periodStr);

      if (d) {
        onHoverRef.current?.(d);
      } else {
        onHoverRef.current?.(null);
      }

      svg.selectAll('.bar').classed('bar-highlight', (nd: any) => nd.period.toString() === periodStr && isTipEnabled);

      if (isTipEnabled && tooltipRef.current && d) {
        const barX = x(d.period.toString())!;
        const barY = y(d.value);
        const absoluteX = margin.left + barX;
        const absoluteY = margin.top + barY;
        const growthColor = d.growth >= 0 ? '#027a48' : '#b42318';
        const growthPrefix = d.growth > 0 ? '+' : '';
        const isQuarterly = config.id.includes('quarter');

        const tooltipWidth = isMobile ? 140 : 200;
        let leftValue = absoluteX - (tooltipWidth / 2);
        if (leftValue < 5) leftValue = 5;
        if (leftValue + tooltipWidth > totalWidth) leftValue = totalWidth - tooltipWidth - 5;

        tooltipRef.current.style('display', 'block').style('opacity', '1')
          .style('background', '#ffffff')
          .style('padding', isMobile ? '8px 10px' : '12px 16px')
          .style('border', '1px solid #eaecf0')
          .style('border-radius', '8px')
          .style('box-shadow', '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)')
          .style('position', 'absolute')
          .style('left', `${leftValue}px`)
          .style('top', `${absoluteY - (isMobile ? 85 : 110)}px`)
          .style('z-index', '100')
          .style('pointer-events', 'none')
          .style('transition', 'left 0.1s ease-out, top 0.1s ease-out')
          .html(`
            <div style="display: flex; flex-direction: column; gap: ${isMobile ? '4px' : '8px'}; min-width: ${isMobile ? '120px' : '170px'}; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #667085; font-size: ${isMobile ? '11px' : '13px'}; font-weight: 500;">${isQuarterly ? 'Quarter' : 'Date'}:</span>
                <span style="font-weight: 700; color: #101828; font-size: ${isMobile ? '11px' : '13px'};">${isQuarterly ? '' : 'Dec 31, '}${d.period}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #667085; font-size: ${isMobile ? '11px' : '13px'}; font-weight: 500;">${config.title}:</span>
                <span style="font-weight: 700; color: #101828; font-size: ${isMobile ? '11px' : '13px'};">$${d.value.toFixed(1)}B</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #667085; font-size: ${isMobile ? '11px' : '13px'}; font-weight: 500;">% ${isQuarterly ? 'QoQ' : 'YoY'}:</span>
                <span style="font-weight: 700; color: ${growthColor}; font-size: ${isMobile ? '11px' : '13px'};">${growthPrefix}${d.growth}%</span>
              </div>
            </div>
          `);
      } else {
        tooltipRef.current?.style('display', 'none').style('opacity', '0');
      }
    }).on('mouseout', () => {
      vLine.style('opacity', 0);
      hLine.style('opacity', 0);
      yLabel.style('opacity', 0);
      svg.selectAll('.bar').classed('bar-highlight', false);
      tooltipRef.current?.style('display', 'none');
      onHoverRef.current?.(null);
    });
  }, [config]);

  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    const s = svgRef.current;
    if (!s) return;

    const activeColor = barColor || config.gradients.future.top;

    s.selectAll('.grid-vertical').style('display', showGrid ? 'block' : 'none');
    s.selectAll('.grid-horizontal').style('display', showGrid ? 'block' : 'none');

    const gradId = `barGradient-${config.id.replace(/\s+/g, '-')}`;
    const grad = d3.select(containerRef.current).select(`#${gradId}`);
    grad.select('.stop-left').attr('stop-color', activeColor);
    grad.select('.stop-right').attr('stop-color', activeColor);

    const fGradId = `futureGradient-${config.id.replace(/\s+/g, '-')}`;
    const fGrad = d3.select(containerRef.current).select(`#${fGradId}`);
    fGrad.select('.future-stop-top').attr('stop-color', activeColor);
    fGrad.select('.future-stop-bottom').attr('stop-color', activeColor);

    s.select('.future-top-line').attr('stroke', activeColor);
    s.select('.future-text-label').attr('fill', activeColor);
    s.select('.projection-dash').attr('stroke', activeColor);
    s.select('.projection-pill').attr('fill', activeColor);
    s.select('.projection-dash-horizontal').attr('stroke', activeColor);

    s.selectAll('.bar-label').style('opacity', showLabels ? 1 : 0);
    s.selectAll('.growth-label').style('opacity', showPct ? 1 : 0);

  }, [
    showGrid, showLabels, showPct, barColor,
    config.id, config.gradients.past.top, config.gradients.past.bottom,
    config.gradients.future.top, config.gradients.future.bottom
  ]);

  useEffect(() => {
    buildChart();
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.getBoundingClientRect().width;
      if (Math.abs(newWidth - lastWidthRef.current) > 20) {
        lastWidthRef.current = newWidth;
        buildChart();
      }
    };
    if (containerRef.current) {
      lastWidthRef.current = containerRef.current.getBoundingClientRect().width;
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      tooltipRef.current?.remove();
    };
  }, [buildChart]);

  useEffect(() => {
    if (!showTooltip && tooltipRef.current) {
      tooltipRef.current.style('display', 'none').style('opacity', '0');
    }
  }, [showTooltip]);

  useEffect(() => {
    const activeColor = barColor || config.gradients.future.top;
    if (!isPlaying) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
      isPlayingRef.current = false;
      const svg = svgRef.current;
      if (svg && yRef.current && xRef.current) {
        const y = yRef.current;
        const H = heightRef.current;
        svg.selectAll('.bar, .bar-label, .growth-label').interrupt();
        svg.selectAll('.bar')
          .transition().duration(400).ease(d3.easeCubicOut)
          .attr('opacity', 1)
          .attr('y', (d: any) => y(d.value))
          .attr('height', (d: any) => H - y(d.value));

        svg.selectAll('.bar-label, .growth-label')
          .transition().duration(400).ease(d3.easeCubicOut)
          .attr('opacity', function (this: any) {
            const isLabel = d3.select(this).classed('bar-label');
            return isLabel ? (showLabels ? 1 : 0) : (showPct ? 1 : 0);
          })
          .attr('transform', 'translate(0,0)');
        svg.selectAll('.play-callout, .play-ring').remove();
      }
      return;
    }

    isPlayingRef.current = true;
    playIndexRef.current = playIndex;
    const data = config.data;
    const svg = svgRef.current;
    const x = xRef.current;
    const y = yRef.current;
    const H = heightRef.current;

    if (!svg || !x || !y) return;

    svg.selectAll('.bar, .bar-label, .growth-label, .play-callout, .play-ring').interrupt();
    svg.selectAll('.play-callout, .play-ring').remove();
    svg.selectAll('.bar').attr('opacity', 0.08).attr('y', H).attr('height', 0);
    svg.selectAll('.bar-label, .growth-label').attr('opacity', 0).attr('transform', 'translate(0,10)');

    if (playIndex > 0) {
      svg.selectAll('.bar').filter((_: any, i: number) => i < playIndex).attr('opacity', 1).attr('y', (d: any) => y(d.value)).attr('height', (d: any) => H - y(d.value));
      svg.selectAll('.bar-label').filter((_: any, i: number) => i < playIndex).attr('opacity', showLabels ? 1 : 0).attr('transform', 'translate(0,0)');
      svg.selectAll('.growth-label').filter((_: any, i: number) => i < playIndex).attr('opacity', showPct ? 1 : 0).attr('transform', 'translate(0,0)');
    }

    const stepMs = 120;
    const rise = 700;

    function playStep() {
      const i = playIndexRef.current;
      const d = data[i];
      if (!d || !svgRef.current || !yRef.current) return;
      const s = svgRef.current, yS = yRef.current;
      const barY = yS(d.value);
      const lDelay = 100;

      s.selectAll('.bar').filter((_: any, idx: number) => idx === i)
        .interrupt()
        .attr('y', H).attr('height', 0).attr('opacity', 0)
        .attr('fill', activeColor)
        .transition().duration(rise).ease(d3.easeCubicOut)
        .attr('y', barY).attr('height', H - barY).attr('opacity', 1);

      s.selectAll('.bar-label').filter((_: any, idx: number) => idx === i)
        .interrupt()
        .transition().delay(lDelay).duration(rise).ease(d3.easeCubicOut)
        .attr('opacity', showLabels ? 1 : 0).attr('transform', 'translate(0,0)');

      s.selectAll('.growth-label').filter((_: any, idx: number) => idx === i)
        .interrupt()
        .transition().delay(lDelay + 50).duration(rise).ease(d3.easeCubicOut)
        .attr('opacity', showPct ? 1 : 0).attr('transform', 'translate(0,0)');
    }

    playStep();
    playIntervalRef.current = setInterval(() => {
      playIndexRef.current++;
      onPlayStepRef.current?.(playIndexRef.current);
      if (playIndexRef.current >= data.length) {
        clearInterval(playIntervalRef.current!);
        playIntervalRef.current = null;
        setTimeout(() => {
          const s = svgRef.current;
          if (s && isPlayingRef.current) {
            s.selectAll('.bar').interrupt().attr('opacity', 1);
            s.selectAll('.bar-label,.growth-label').interrupt().attr('opacity', 1).attr('transform', 'translate(0,0)');
            s.selectAll('.play-callout,.play-ring').transition().duration(500).attr('opacity', 0).remove();
            onPlayFinishRef.current();
          }
        }, rise);
      } else {
        playStep();
      }
    }, stepMs);

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, config]);

  return <div ref={containerRef} style={{ width: '100%', position: 'relative' }} />;
};

export default memo(D3ChartComponent);
