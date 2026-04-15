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

  const buildChart = useCallback(() => {
    if (!containerRef.current) return;
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

    const x = d3.scaleBand()
      .domain(data.map(d => d.year.toString()))
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

    // Defs / Gradients
    const defs = svgEl.append('defs');
    const pastG = defs.append('linearGradient').attr('id', 'past-gradient')
      .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    pastG.append('stop').attr('offset', '0%').attr('stop-color', barColor || config.gradients.past.top);
    pastG.append('stop').attr('offset', '100%').attr('stop-color', config.gradients.past.bottom);

    const futG = defs.append('linearGradient').attr('id', 'future-gradient')
      .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    futG.append('stop').attr('offset', '0%').attr('stop-color', config.gradients.future.top);
    futG.append('stop').attr('offset', '100%').attr('stop-color', config.gradients.future.bottom);

    // Future overlay & Indicators
    const futureStartIndex = data.findIndex(d => d.status === 'future');
    if (futureStartIndex > 0) {
      const sepX = (x(data[futureStartIndex - 1].year.toString())! + x(data[futureStartIndex].year.toString())!) / 2 + (x.bandwidth() / 2);

      // Background tint
      svg.append('rect').attr('x', sepX).attr('y', 0).attr('width', W - sepX)
        .attr('height', H).attr('fill', config.gradients.future.top).attr('opacity', 0.08);

      // Top Border Line for Future Section (at the very top)
      svg.append('line').attr('x1', sepX).attr('x2', W).attr('y1', 0).attr('y2', 0)
        .attr('stroke', '#00AD07').attr('stroke-width', 3);

      // Top Arrow (Sharper Triangle)
      svg.append('path')
        .attr('d', `M ${W - 4}, 1 L ${W + 4}, 1 L ${W}, -6 Z`)
        .attr('fill', '#475569');

      // Labels (Past / Future)
      svg.append('text').attr('x', sepX - 12).attr('y', 25).attr('text-anchor', 'end')
        .attr('font-size', '13px').attr('font-weight', '700').attr('fill', '#94a3b8').text('Past');
      svg.append('text').attr('x', sepX + 12).attr('y', 25).attr('text-anchor', 'start')
        .attr('font-size', '13px').attr('font-weight', '700').attr('fill', config.gradients.future.top).text('Future');
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

    // Tiny dash connecting chart to the box
    svg.append('line')
      .attr('x1', W).attr('x2', W + 12).attr('y1', projY).attr('y2', projY)
      .attr('stroke', '#00AD07').attr('stroke-width', 2).attr('stroke-dasharray', '2,2');

    const hG = svg.append('g').attr('transform', `translate(${W + 12},${projY})`);
    hG.append('rect').attr('x', 0).attr('y', -11).attr('width', 52).attr('height', 22).attr('rx', 11)
      .attr('fill', '#00AD07');
    hG.append('text').attr('x', 26).attr('y', 5).attr('fill', 'white').attr('font-size', isMobile ? '10px' : '11px')
      .attr('text-anchor', 'middle').attr('font-weight', '700').text(`$${config.projectionTarget}B`);

    // Bars
    const barWidth = x.bandwidth();
    svg.selectAll('.bar').data(data).enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.year.toString())!)
      .attr('width', barWidth)
      .attr('y', H).attr('height', 0)
      .attr('rx', isMobile ? 3 : 6).attr('ry', isMobile ? 3 : 6)
      .attr('fill', d => d.status === 'past' ? 'url(#past-gradient)' : 'url(#future-gradient)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const idx = data.findIndex(nd => nd.year === d.year);
        onBarClickRef.current?.(idx);
      })
      .transition().duration(hasAnimatedRef.current ? 0 : 1200).ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => H - y(d.value));

    if (!hasAnimatedRef.current) {
      setTimeout(() => {
        hasAnimatedRef.current = true;
      }, 1200);
    }

    // Labels (Always rendered, visibility controlled by prop)
    svg.selectAll('.bar-label').data(data).enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.year.toString())! + x.bandwidth() / 2).attr('y', d => y(d.value) - (isMobile ? 13 : 20))
      .attr('text-anchor', 'middle').attr('font-size', isMobile ? '6.5px' : '11px').attr('font-weight', '700')
      .attr('fill', '#101828').attr('opacity', showLabels ? 1 : 0)
      .text(d => `$${Math.round(d.value)}${isMobile ? '' : 'B'}`)
      .transition().duration(500).attr('opacity', showLabels ? 1 : 0);

    svg.selectAll('.growth-label').data(data).enter().append('text')
      .attr('class', 'growth-label')
      .attr('x', d => x(d.year.toString())! + x.bandwidth() / 2).attr('y', d => y(d.value) - 6)
      .attr('text-anchor', 'middle').attr('font-size', isMobile ? '7px' : '10px').attr('font-weight', '700')
      .attr('fill', d => d.growth >= 0 ? '#2ecc71' : '#e74c3c').attr('opacity', showPct ? 1 : 0)
      .text(d => `${d.growth > 0 ? '+' : ''}${d.growth}%`);

    // Projection line
    svg.append('line').attr('x1', 0).attr('x2', W).attr('y1', projY).attr('y2', projY)
      .attr('stroke', config.gradients.future.top).attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,5').attr('opacity', 0.3);

    // Tooltip
    // Use the container as the tooltip parent for absolute positioning
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

    // Y-Axis Interactive Label (Pill at the right corner)
    const yLabel = ig.append('g').style('opacity', 0);
    yLabel.append('rect')
      .attr('x', 0).attr('y', -10).attr('width', 52).attr('height', 20).attr('rx', 10)
      .attr('fill', '#475569');
    const yLabelText = yLabel.append('text')
      .attr('x', 26).attr('y', 4).attr('fill', 'white').attr('font-size', '10px')
      .attr('text-anchor', 'middle').attr('font-weight', '700');

    overlay.on('mousemove', (event: MouseEvent) => {
      const [mx, my] = d3.pointer(event);
      vLine.raise().attr('x1', mx).attr('x2', mx).attr('y1', 0).attr('y2', H).style('opacity', 1);
      hLine.raise().attr('x1', 0).attr('x2', W).attr('y1', my).attr('y2', my).style('opacity', 1);

      // Update Y-Axis Pill Label
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
      const yearStr = domain[index];
      const d = data.find(nd => nd.year.toString() === yearStr);

      if (d) {
        onHoverRef.current?.(d);
      } else {
        onHoverRef.current?.(null);
      }

      svg.selectAll('.bar').classed('bar-highlight', (nd: any) => nd.year.toString() === yearStr);

      if (showTooltip && tooltipRef.current && d) {
        const rect = containerRef.current!.getBoundingClientRect();
        const barX = x(d.year.toString())!;
        const barY = y(d.value);

        // Calculate position relative to the CONTAINER
        const absoluteX = margin.left + barX;
        const absoluteY = margin.top + barY;

        const growthColor = d.growth >= 0 ? '#027a48' : '#b42318';
        const growthPrefix = d.growth > 0 ? '+' : '';

        // Determine horizontal alignment to keep tooltip in view
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
          .style('top', `${absoluteY - (isMobile ? 85 : 110)}px`) // Position above the bar
          .style('z-index', '100')
          .style('pointer-events', 'none')
          .style('transition', 'left 0.1s ease-out, top 0.1s ease-out')
          .html(`
            <div style="display: flex; flex-direction: column; gap: ${isMobile ? '4px' : '8px'}; min-width: ${isMobile ? '120px' : '170px'}; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #667085; font-size: ${isMobile ? '11px' : '13px'}; font-weight: 500;">Date:</span>
                <span style="font-weight: 700; color: #101828; font-size: ${isMobile ? '11px' : '13px'};">Dec 31, ${d.year}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #667085; font-size: ${isMobile ? '11px' : '13px'}; font-weight: 500;">${config.title}:</span>
                <span style="font-weight: 700; color: #101828; font-size: ${isMobile ? '11px' : '13px'};">$${d.value.toFixed(1)}B</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #667085; font-size: ${isMobile ? '11px' : '13px'}; font-weight: 500;">% YoY:</span>
                <span style="font-weight: 700; color: ${growthColor}; font-size: ${isMobile ? '11px' : '13px'};">${growthPrefix}${d.growth}%</span>
              </div>
            </div>
          `);
      }
    }).on('mouseout', () => {
      vLine.style('opacity', 0);
      hLine.style('opacity', 0);
      yLabel.style('opacity', 0);
      svg.selectAll('.bar').classed('bar-highlight', false);
      tooltipRef.current?.style('display', 'none');
      onHoverRef.current?.(null);
    });
  }, [config]); // Critical: buildChart now only depends on structural data

  // Non-destructive style updates effect
  useEffect(() => {
    const s = svgRef.current;
    if (!s) return;

    // Toggle Grid
    s.selectAll('.grid-vertical').style('display', showGrid ? 'block' : 'none');
    s.selectAll('.grid-horizontal').style('display', showGrid ? 'block' : 'none');

    // Update Bar Color via Gradient Definition
    d3.select('#past-gradient stop').attr('stop-color', barColor || config.gradients.past.top);

    // Toggle Labels (immediately, no re-animation)
    s.selectAll('.bar-label').style('opacity', showLabels ? 1 : 0);
    s.selectAll('.growth-label').style('opacity', showPct ? 1 : 0);

  }, [showGrid, showLabels, showPct, barColor, config.gradients.past.top]);

  // Build chart on mount / config change
  useEffect(() => {
    buildChart();
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.getBoundingClientRect().width;
      // Only rebuild if width changes significantly (> 20px)
      // This ignores small height changes like address bar hiding on mobile
      if (Math.abs(newWidth - lastWidthRef.current) > 20) {
        lastWidthRef.current = newWidth;
        buildChart();
      }
    };
    
    // Initial width capture
    if (containerRef.current) {
      lastWidthRef.current = containerRef.current.getBoundingClientRect().width;
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      tooltipRef.current?.remove();
    };
  }, [buildChart]);

  // Play animation
  useEffect(() => {
    if (!isPlaying) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
      isPlayingRef.current = false;
      const svg = svgRef.current;
      if (svg && yRef.current && xRef.current) {
        const y = yRef.current;
        const H = heightRef.current;

        // Rapidly finish remaining bars with a stagger
        svg.selectAll('.bar')
          .interrupt()
          .transition()
          .delay((_, i) => Math.max(0, i - playIndexRef.current) * 40)
          .duration(500)
          .ease(d3.easeCubicOut)
          .attr('opacity', 1)
          .attr('y', (d: any) => y(d.value))
          .attr('height', (d: any) => H - y(d.value));

        svg.selectAll('.bar-label,.growth-label')
          .interrupt()
          .transition()
          .delay((_, i) => Math.max(0, i - playIndexRef.current) * 40)
          .duration(500)
          .ease(d3.easeCubicOut)
          .attr('opacity', 1)
          .attr('transform', 'translate(0,0)');

        svg.selectAll('.play-callout,.play-ring').remove();
        onPlayFinishRef.current();
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

    // Reset or prepare bars
    svg.selectAll('.bar').attr('opacity', 0.08).attr('y', H).attr('height', 0);
    svg.selectAll('.bar-label,.growth-label').attr('opacity', 0);
    svg.selectAll('.play-callout,.play-ring').remove();

    // If starting mid-way, show previous bars immediately
    if (playIndex > 0) {
      svg.selectAll('.bar').filter((_: any, i: number) => i < playIndex)
        .attr('opacity', 1)
        .attr('y', (d: any) => y(d.value))
        .attr('height', (d: any) => H - y(d.value));

      if (showLabels) {
        svg.selectAll('.bar-label').filter((_: any, i: number) => i < playIndex)
          .attr('opacity', 1).attr('transform', 'translate(0,0)');
      }
      if (showPct) {
        svg.selectAll('.growth-label').filter((_: any, i: number) => i < playIndex)
          .attr('opacity', 1).attr('transform', 'translate(0,0)');
      }
    }

    const stepMs = 180; // Faster interval for overlap
    const rise = 1000;  // Longer, softer rise duration (exceeds stepMs for overlap)

    function playStep() {
      const i = playIndexRef.current;
      const d = data[i];
      if (!d || !svgRef.current || !xRef.current || !yRef.current) return;
      const s = svgRef.current, xS = xRef.current, yS = yRef.current;
      const barY = yS(d.value);
      const lDelay = 150;

      s.selectAll('.bar').filter((_: unknown, idx: number) => idx === i)
        .attr('y', H).attr('height', 0).attr('opacity', 0)
        .attr('fill', (nd: unknown) => (nd as { status: string }).status === 'past' ? 'url(#past-gradient)' : 'url(#future-gradient)')
        .transition().duration(rise).ease(d3.easeCubicOut)
        .attr('y', barY).attr('height', H - barY).attr('opacity', 1);

      s.selectAll('.bar-label').filter((_: unknown, idx: number) => idx === i)
        .attr('opacity', 0).attr('transform', 'translate(0,10)')
        .transition().delay(lDelay).duration(rise).ease(d3.easeCubicOut)
        .attr('opacity', 1).attr('transform', 'translate(0,0)');

      s.selectAll('.growth-label').filter((_: unknown, idx: number) => idx === i)
        .attr('opacity', 0).attr('transform', 'translate(0,10)')
        .transition().delay(lDelay + 50).duration(rise).ease(d3.easeCubicOut)
        .attr('opacity', 1).attr('transform', 'translate(0,0)');

      s.selectAll('.play-callout,.play-ring').remove();
    }

    playStep();
    playIntervalRef.current = setInterval(() => {
      playIndexRef.current++;
      onPlayStepRef.current?.(playIndexRef.current);
      if (playIndexRef.current >= data.length) {
        clearInterval(playIntervalRef.current!);
        playIntervalRef.current = null;

        // Wait for the final rise transition to complete before cleanup
        setTimeout(() => {
          const s = svgRef.current;
          if (s && isPlayingRef.current) { // Check if we haven't already switched views
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
