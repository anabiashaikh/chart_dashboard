'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CHARTS_CONFIG, CHART_IDS, DataPoint } from '@/data/chartsData';
import D3Chart from '@/components/D3Chart';
import MiniChartCard from '@/components/MiniChartCard';
import ColorPicker from '@/components/ColorPicker';
import DataTable from '@/components/DataTable';

type AnalysisMode = 'bars' | 'table';

export default function Dashboard() {
  const [currentChartId, setCurrentChartId] = useState('ebitda');
  const [activeView, setActiveView] = useState<'analysis' | 'many'>('analysis');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('bars');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showPct, setShowPct] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [showFooterPicker, setShowFooterPicker] = useState(false);
  const [settingsColorOpen, setSettingsColorOpen] = useState(false);

  const cfg = CHARTS_CONFIG[currentChartId];

  const switchChart = useCallback((chartId: string) => {
    setIsPlaying(false);
    setPlayIndex(0);
    setCurrentChartId(chartId);
  }, []);

  const handleColorChange = useCallback((color: string | null) => {
    setCustomColors(prev => {
      if (color === null) {
        const next = { ...prev };
        delete next[currentChartId];
        return next;
      }
      return { ...prev, [currentChartId]: color };
    });
  }, [currentChartId]);

  const handlePlayToggle = () => {
    if (analysisMode !== 'bars') setAnalysisMode('bars');
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setPlayIndex(0);
      setIsPlaying(true);
    }
  };

  const handlePlayFinish = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Close settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showSettings && settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
        setSettingsColorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const statsArr = Object.values(cfg.stats);

  return (
    <div className="dashboard-container">
      {/* Header Tabs at the very top */}
      <div className="top-nav-tabs">
        <button
          className={`tab-btn${activeView === 'many' ? ' active' : ''}`}
          onClick={() => setActiveView('many')}
        >
          📊 Many Charts
        </button>
        <button
          className={`tab-btn${activeView === 'analysis' ? ' active' : ''}`}
          onClick={() => setActiveView('analysis')}
        >
          📈 Analysis
        </button>
      </div>

      {/* Main Header / Title & Controls */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-square" style={{ background: '#f25022' }}></span>
            <span className="logo-square" style={{ background: '#7fba00' }}></span>
            <span className="logo-square" style={{ background: '#00a4ef' }}></span>
            <span className="logo-square" style={{ background: '#ffb900' }}></span>
          </div>
          <h1>
            {cfg.title} <i className="chevron-down"></i>
          </h1>
        </div>

        <div className="header-controls">
          <button
            className={`control-btn${analysisMode === 'bars' && activeView === 'analysis' ? ' active' : ''}`}
            onClick={() => { setActiveView('analysis'); setAnalysisMode('bars'); }}
          >
            📊 Bars
          </button>
          <button
            className={`control-btn${analysisMode === 'table' && activeView === 'analysis' ? ' active' : ''}`}
            id="btn-table"
            onClick={() => { setActiveView('analysis'); setAnalysisMode('table'); setIsPlaying(false); }}
          >
            📅 Table
          </button>
          <button className="control-btn" id="btn-range">
            🗓️ Range
          </button>
          <button
            className={`control-btn${isPlaying ? ' active' : ''}`}
            id="btn-play"
            onClick={handlePlayToggle}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <div className="settings-wrapper" id="settings-wrapper">
            <button
              className="control-btn"
              id="btn-settings"
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowSettings(s => {
                  if (s) setSettingsColorOpen(false);
                  return !s;
                }); 
              }}
            >
              ⋮ Settings
            </button>
            {showSettings && (
              <div 
                ref={settingsRef}
                className="settings-panel open" 
                onClick={e => e.stopPropagation()}
              >
                <div className="settings-title">Settings</div>
                <div className="settings-divider" />

                <div className="settings-list">
                  <label className="settings-toggle" onClick={() => setShowLabels(v => !v)}>
                    <span className={`toggle-check${showLabels ? ' checked' : ''}`}>{showLabels ? '✓' : ''}</span>
                    Show Labels
                  </label>
                  <label className="settings-toggle" onClick={() => setShowPct(v => !v)}>
                    <span className={`toggle-check${showPct ? ' checked' : ''}`}>{showPct ? '✓' : ''}</span>
                    Show % Changes
                  </label>
                  <label className="settings-toggle" onClick={() => setShowTooltip(v => !v)}>
                    <span className={`toggle-check${showTooltip ? ' checked' : ''}`}>{showTooltip ? '✓' : ''}</span>
                    Show Tooltip
                  </label>
                  <label className="settings-toggle" onClick={() => setShowGrid(v => !v)}>
                    <span className={`toggle-check${showGrid ? ' checked' : ''}`}>{showGrid ? '✓' : ''}</span>
                    Grid
                  </label>
                </div>

                <div className="settings-divider" />

                <div
                  className="color-section-trigger"
                  style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                  onClick={() => setSettingsColorOpen(!settingsColorOpen)}
                >
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: customColors[currentChartId] || cfg.gradients.future.top, display: 'block' }}></span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Color</span>
                  <i style={{ marginLeft: 'auto', fontSize: '10px', transition: 'transform 0.2s', transform: settingsColorOpen ? 'rotate(180deg)' : 'none' }}>▼</i>
                </div>

                {settingsColorOpen && (
                  <div className="settings-side-picker" onClick={e => e.stopPropagation()}>
                   <ColorPicker 
                     color={customColors[currentChartId] || cfg.gradients.future.top} 
                     onChange={handleColorChange} 
                   />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="subtitle">{cfg.subtitle}</div>

      {/* Analysis View */}
      {activeView === 'analysis' && (
        <div id="analysis-view">
          <main className="dashboard-content">

            {/* ── Bars Mode ── */}
            {analysisMode === 'bars' && (
              <div className="chart-container" id="d3-chart-wrapper">
                {/* Info Panel */}
                <div className="info-panel" id="stats-card">
                  {!hoveredPoint ? (
                    statsArr.map((s, i) => (
                      <div key={i} className="info-item">
                        <span className="info-label">
                          <i className={`icon-${['chart', 'calendar', 'trend', 'sparkle', 'rocket'][i]}`}></i>
                          {' '}{s.label}
                        </span>
                        <span className={`info-value${s.cls ? ' ' + s.cls : ''}`}>{s.value}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="icon-calendar"></i> {cfg.id.includes('quarter') ? 'Quarter' : 'Year'}
                        </span>
                        <span className="info-value">{hoveredPoint.period}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><i className="icon-chart"></i> {cfg.title}</span>
                        <span className="info-value">${hoveredPoint.value.toFixed(1)}B</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><i className="icon-trend"></i> Growth %</span>
                        <span className={`info-value ${hoveredPoint.growth >= 0 ? 'growth-pos' : 'growth-neg'}`}>
                          {hoveredPoint.growth > 0 ? '+' : ''}{hoveredPoint.growth}%
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><i className="icon-sparkle"></i> Status</span>
                        <span className="info-value" style={{ textTransform: 'capitalize' }}>{hoveredPoint.status}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* D3 Chart */}
                <div id="d3-chart">
                  <D3Chart
                    key={currentChartId}
                    config={cfg}
                    isPlaying={isPlaying}
                    playIndex={playIndex}
                    onPlayStep={setPlayIndex}
                    onPlayFinish={handlePlayFinish}
                    onHover={setHoveredPoint}
                    onBarClick={setPlayIndex}
                    showLabels={showLabels}
                    showPct={showPct}
                    showTooltip={showTooltip}
                    showGrid={showGrid}
                    barColor={customColors[currentChartId] || null}
                  />
                </div>
              </div>
            )}

            {/* ── Table Mode ── */}
            {analysisMode === 'table' && (
              <DataTable config={cfg} />
            )}

          </main>

          {/* Footer Navigation */}
          <footer className="dashboard-footer" style={{ gap: '8px', padding: '0 4px' }}>
            {cfg.nav.back && (
              <div className="nav-card" id="nav-back" onClick={() => switchChart(cfg.nav.back!.id)}>
                <div className="nav-label" style={{ color: '#667085', fontSize: '9px' }}>BACK</div>
                <div className="nav-content" style={{ gap: '6px' }}>
                  <i className="arrow-left" style={{ fontSize: '14px' }}></i>
                  <div className="nav-text">
                    <h3 style={{ fontSize: '13px' }}>{cfg.nav.back.title}</h3>
                  </div>
                </div>
              </div>
            )}
            {cfg.nav.next && (
              <div className="nav-card active" id="nav-next" onClick={() => switchChart(cfg.nav.next!.id)}>
                <div className="nav-label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9px' }}>NEXT</div>
                <div className="nav-content" style={{ gap: '6px' }}>
                  <div className="nav-text">
                    <h3 style={{ fontSize: '13px' }}>{cfg.nav.next.title}</h3>
                  </div>
                  <i className="arrow-right" style={{ fontSize: '14px' }}></i>
                </div>
              </div>
            )}
          </footer>
        </div>
      )}

      {/* Many Charts View */}
      {activeView === 'many' && (
        <div id="many-charts-view">
          <div className="many-charts-grid">
            {CHART_IDS.map(id => (
              <MiniChartCard
                key={id}
                config={CHARTS_CONFIG[id]}
                onClick={() => { switchChart(id); setActiveView('analysis'); setAnalysisMode('bars'); }}
              />
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
