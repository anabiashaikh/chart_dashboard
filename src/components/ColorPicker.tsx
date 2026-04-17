'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string | null) => void;
}

// --- Utils ---
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
  return [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

// RGB [0,255] -> HSV [0,360], [0,1], [0,1]
function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

// HSV -> RGB
function hsvToRgb(h: number, s: number, v: number) {
  h /= 360;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

const PRESETS = [
  '#00AD07', '#EA4335', '#FBBC04', '#F9AB00', '#FFD600', '#4CAF50', '#2E7D32', '#009688',
  '#4285F4', '#1A73E8', '#673AB7', '#9C27B0', '#E91E63', '#F06292', '#8E24AA', '#78909C',
  '#37474F', '#636e72', '#b2bec3', '#ffffff'
];

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [hsv, setHsv] = useState(() => {
    const { r, g, b } = hexToRgb(color.replace('#', '').padStart(6, '0'));
    return rgbToHsv(r, g, b);
  });

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastEmittedHex = useRef(color);

  const rgb = useMemo(() => hsvToRgb(hsv.h, hsv.s, hsv.v), [hsv]);
  const hex = useMemo(() => rgbToHex(rgb.r, rgb.g, rgb.b), [rgb]);

  // 1. Sync internal HSV state if external 'color' prop changes (but ignore if WE caused it)
  useEffect(() => {
    if (isDragging.current) return;
    if (color.toLowerCase() === lastEmittedHex.current.toLowerCase()) return;
    
    const { r, g, b } = hexToRgb(color.replace('#', '').padStart(6, '0'));
    setHsv(rgbToHsv(r, g, b));
    lastEmittedHex.current = color;
  }, [color]);

  // 2. Notify parent of internal changes
  useEffect(() => {
    const newHex = '#' + hex;
    if (newHex.toLowerCase() !== color.toLowerCase()) {
      lastEmittedHex.current = newHex;
      onChange(newHex);
    }
  }, [hex, onChange]);

  const handleSvDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const move = (event: MouseEvent | TouchEvent) => {
      if (!svRef.current) return;
      const rect = svRef.current.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
      setHsv(prev => ({ ...prev, s, v }));
    };
    const up = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    move(e.nativeEvent as any);
  };

  const handleHueDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const move = (event: MouseEvent | TouchEvent) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const h = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 360;
      setHsv(prev => ({ ...prev, h }));
    };
    const up = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    move(e.nativeEvent as any);
  };

  const baseHueRgb = hsvToRgb(hsv.h, 1, 1);
  const baseHueHex = rgbToHex(baseHueRgb.r, baseHueRgb.g, baseHueRgb.b);

  return (
    <div className="color-picker-area">
      {/* Saturation/Value Canvas */}
      <div 
        ref={svRef} 
        className="sv-canvas" 
        style={{ backgroundColor: `#${baseHueHex}`, touchAction: 'none' }}
        onMouseDown={handleSvDown}
        onTouchStart={handleSvDown}
      >
        <div className="sv-white-grad" />
        <div className="sv-black-grad" />
        <div 
          className="sv-pointer" 
          style={{ 
            left: `${hsv.s * 100}%`, 
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: `#${hex}`
          }} 
        />
      </div>

      {/* Hue Slider */}
      <div 
        ref={hueRef} 
        className="hue-slider"
        style={{ touchAction: 'none' }}
        onMouseDown={handleHueDown}
        onTouchStart={handleHueDown}
      >
        <div 
          className="hue-pointer" 
          style={{ left: `${(hsv.h / 360) * 100}%` }} 
        />
      </div>

      <div className="rgba-inputs">
        <div className="rgba-field">
          <input 
            type="text" 
            value={hex.toUpperCase()} 
            maxLength={6}
            onChange={e => {
              const h = e.target.value.replace('#', '');
              if (h.length === 6) {
                const { r, g, b } = hexToRgb(h);
                setHsv(rgbToHsv(r, g, b));
              }
            }} 
          />
          <label>HEX</label>
        </div>
        <div className="rgba-field">
          <input type="number" value={Math.round(rgb.r)} readOnly />
          <label>R</label>
        </div>
        <div className="rgba-field">
          <input type="number" value={Math.round(rgb.g)} readOnly />
          <label>G</label>
        </div>
        <div className="rgba-field">
          <input type="number" value={Math.round(rgb.b)} readOnly />
          <label>B</label>
        </div>
      </div>

      <div className="color-presets">
        {PRESETS.map(p => (
          <span key={p} className="preset"
            style={{ background: p, border: p === '#ffffff' ? '1px solid #ddd' : undefined }}
            onClick={() => {
              const { r, g, b } = hexToRgb(p.replace('#', ''));
              setHsv(rgbToHsv(r, g, b));
            }}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button 
          className="reset-btn"
          onClick={() => onChange(null)}
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}
