export interface DataPoint {
  period: string;
  value: number;
  growth: number;
  status: 'past' | 'future';
}

export interface ChartGradient {
  top: string;
  bottom: string;
}

export interface ChartNav {
  id: string;
  title: string;
  desc: string;
}

export interface StatItem {
  label: string;
  value: string;
  cls?: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  subtitle: string;
  stats: {
    main: StatItem;
    stat1: StatItem;
    stat2: StatItem;
    stat3: StatItem;
    trend: StatItem;
  };
  projectionTarget: number;
  yMax: number;
  tickValues?: number[];
  data: DataPoint[];
  gradients: {
    past: ChartGradient;
    future: ChartGradient;
  };
  nav: {
    back: ChartNav | null;
    next: ChartNav | null;
  };
}

export const CHARTS_CONFIG: Record<string, ChartConfig> = {
  revenue: {
    id: 'revenue',
    title: 'Annual Revenue',
    subtitle: 'Annual Revenue Projected To Reach $644B By 2030',
    stats: {
      main: { label: 'Annual Revenue', value: '$245B' },
      stat1: { label: 'Last Year Growth', value: '+16%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+16.3%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+17.7%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Strong Growth', cls: 'growth-trend' }
    },
    projectionTarget: 644,
    yMax: 700,
    data: [
      { period: '2014', value: 86.8, growth: 12, status: 'past' },
      { period: '2015', value: 93.6, growth: 8, status: 'past' },
      { period: '2016', value: 91.2, growth: -3, status: 'past' },
      { period: '2017', value: 110.4, growth: 21, status: 'past' },
      { period: '2018', value: 125.8, growth: 14, status: 'past' },
      { period: '2019', value: 143.0, growth: 14, status: 'past' },
      { period: '2020', value: 168.1, growth: 18, status: 'past' },
      { period: '2021', value: 198.3, growth: 18, status: 'past' },
      { period: '2022', value: 198.1, growth: 0, status: 'past' },
      { period: '2023', value: 212.0, growth: 7, status: 'past' },
      { period: '2024', value: 245.1, growth: 16, status: 'past' },
      { period: '2025', value: 282.0, growth: 15, status: 'past' },
      { period: '2026', value: 328.0, growth: 16, status: 'past' },
      { period: '2027', value: 378.0, growth: 15, status: 'future' },
      { period: '2028', value: 441.0, growth: 17, status: 'future' },
      { period: '2029', value: 522.0, growth: 18, status: 'future' },
      { period: '2030', value: 644.0, growth: 23, status: 'future' }
    ],
    gradients: {
      past: { top: '#91d3a1', bottom: '#b8e4c2' },
      future: { top: '#00AD07', bottom: '#00cc00' }
    },
    nav: {
      back: null,
      next: { id: 'ebitda', title: 'Annual EBITDA', desc: 'How profitable are core operations?' }
    }
  },

  ebitda: {
    id: 'ebitda',
    title: 'Annual EBITDA',
    subtitle: 'Annual EBITDA Projected To Reach $337B By 2030',
    stats: {
      main: { label: 'Annual EBITDA', value: '$172B' },
      stat1: { label: 'Last Year Growth', value: '+7.1%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+21.1%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+19.8%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Strong Growth', cls: 'growth-trend' }
    },
    projectionTarget: 337,
    yMax: 450,
    data: [
      { period: '2014', value: 33.6, growth: 8, status: 'past' },
      { period: '2015', value: 25.2, growth: -25, status: 'past' },
      { period: '2016', value: 33.5, growth: 33, status: 'past' },
      { period: '2017', value: 40.9, growth: 22, status: 'past' },
      { period: '2018', value: 49.5, growth: 21, status: 'past' },
      { period: '2019', value: 58.1, growth: 17, status: 'past' },
      { period: '2020', value: 68.4, growth: 18, status: 'past' },
      { period: '2021', value: 85.1, growth: 24, status: 'past' },
      { period: '2022', value: 100.0, growth: 18, status: 'past' },
      { period: '2023', value: 105.0, growth: 5, status: 'past' },
      { period: '2024', value: 133.0, growth: 27, status: 'past' },
      { period: '2025', value: 160.0, growth: 20, status: 'past' },
      { period: '2026', value: 172.0, growth: 7, status: 'past' },
      { period: '2027', value: 198.0, growth: 15, status: 'future' },
      { period: '2028', value: 231.0, growth: 17, status: 'future' },
      { period: '2029', value: 273.0, growth: 18, status: 'future' },
      { period: '2030', value: 337.0, growth: 23, status: 'future' }
    ],
    gradients: {
      past: { top: '#91d3a1', bottom: '#b8e4c2' },
      future: { top: '#00AD07', bottom: '#00cc00' }
    },
    nav: {
      back: { id: 'revenue', title: 'Annual Revenue', desc: 'Is the business growing fast?' },
      next: { id: 'earnings', title: 'Annual Earnings', desc: 'What is the real profit?' }
    }
  },

  earnings: {
    id: 'earnings',
    title: 'Annual Earnings',
    subtitle: 'Annual Earnings Projected To Reach $249B By 2030',
    stats: {
      main: { label: 'Annual Earnings', value: '$120B' },
      stat1: { label: 'Last Year Growth', value: '+18.2%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+22.1%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+22.0%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Strong Growth', cls: 'growth-trend' }
    },
    projectionTarget: 249,
    yMax: 350,
    data: [
      { period: '2014', value: 22.1, growth: 1, status: 'past' },
      { period: '2015', value: 12.2, growth: -45, status: 'past' },
      { period: '2016', value: 20.5, growth: 68, status: 'past' },
      { period: '2017', value: 25.5, growth: 24, status: 'past' },
      { period: '2018', value: 16.6, growth: -35, status: 'past' },
      { period: '2019', value: 39.2, growth: 137, status: 'past' },
      { period: '2020', value: 44.3, growth: 13, status: 'past' },
      { period: '2021', value: 61.3, growth: 38, status: 'past' },
      { period: '2022', value: 72.7, growth: 19, status: 'past' },
      { period: '2023', value: 72.4, growth: -1, status: 'past' },
      { period: '2024', value: 88.1, growth: 22, status: 'past' },
      { period: '2025', value: 102, growth: 16, status: 'past' },
      { period: '2026', value: 120, growth: 18, status: 'past' },
      { period: '2027', value: 142, growth: 18, status: 'future' },
      { period: '2028', value: 167, growth: 18, status: 'future' },
      { period: '2029', value: 200, growth: 19, status: 'future' },
      { period: '2030', value: 249, growth: 25, status: 'future' }
    ],
    gradients: {
      past: { top: '#c4b5fd', bottom: '#ddd6fe' },
      future: { top: '#7c3aed', bottom: '#9333ea' }
    },
    nav: {
      back: { id: 'ebitda', title: 'Annual EBITDA', desc: 'How profitable are core oper...' },
      next: { id: 'eps', title: 'Annual EPS Diluted', desc: 'How much profit per share?' }
    }
  },

  eps: {
    id: 'eps',
    title: 'Annual EPS Diluted',
    subtitle: 'Annual EPS Diluted Projected To Reach $33.4 By 2030',
    stats: {
      main: { label: 'Annual EPS Diluted', value: '$22.5' },
      stat1: { label: 'Last Year Growth', value: '+18%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+19.0%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+19.8%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Strong Growth', cls: 'growth-trend' }
    },
    projectionTarget: 33.4,
    yMax: 45,
    data: [
      { period: '2014', value: 2.6, growth: 6, status: 'past' },
      { period: '2015', value: 1.5, growth: -42, status: 'past' },
      { period: '2016', value: 2.7, growth: 80, status: 'past' },
      { period: '2017', value: 3.4, growth: 26, status: 'past' },
      { period: '2018', value: 2.1, growth: -38, status: 'past' },
      { period: '2019', value: 5.1, growth: 143, status: 'past' },
      { period: '2020', value: 5.8, growth: 14, status: 'past' },
      { period: '2021', value: 8.2, growth: 41, status: 'past' },
      { period: '2022', value: 9.7, growth: 18, status: 'past' },
      { period: '2023', value: 11.6, growth: 20, status: 'past' },
      { period: '2024', value: 13.6, growth: 17, status: 'past' },
      { period: '2025', value: 16.5, growth: 21, status: 'past' },
      { period: '2026', value: 19.0, growth: 15, status: 'past' },
      { period: '2027', value: 22.5, growth: 18, status: 'future' },
      { period: '2028', value: 26.8, growth: 19, status: 'future' },
      { period: '2029', value: 33.4, growth: 25, status: 'future' }
    ],
    gradients: {
      past: { top: '#6ee7b7', bottom: '#a7f3d0' },
      future: { top: '#059669', bottom: '#10b981' }
    },
    nav: {
      back: { id: 'earnings', title: 'Annual Earnings', desc: 'What is the real profit?' },
      next: { id: 'eps-basic', title: 'Annual EPS Basic', desc: 'Basic earnings per share' }
    }
  },

  'eps-basic': {
    id: 'eps-basic',
    title: 'Annual EPS Basic',
    subtitle: 'Annual EPS Basic Projected To Reach $33.4 By 2030',
    stats: {
      main: { label: 'Annual EPS Basic', value: '$22.5' },
      stat1: { label: 'Last Year Growth', value: '+18%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+19.5%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+19.8%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Strong Growth', cls: 'growth-trend' }
    },
    projectionTarget: 33.4,
    yMax: 45,
    data: [
      { period: '2014', value: 2.7, growth: 6, status: 'past' },
      { period: '2015', value: 1.5, growth: -44, status: 'past' },
      { period: '2016', value: 2.8, growth: 87, status: 'past' },
      { period: '2017', value: 3.5, growth: 25, status: 'past' },
      { period: '2018', value: 2.2, growth: -37, status: 'past' },
      { period: '2019', value: 5.2, growth: 136, status: 'past' },
      { period: '2020', value: 5.9, growth: 13, status: 'past' },
      { period: '2021', value: 8.4, growth: 42, status: 'past' },
      { period: '2022', value: 9.8, growth: 17, status: 'past' },
      { period: '2023', value: 11.8, growth: 20, status: 'past' },
      { period: '2024', value: 13.7, growth: 16, status: 'past' },
      { period: '2025', value: 16.5, growth: 20, status: 'past' },
      { period: '2026', value: 19.0, growth: 15, status: 'past' },
      { period: '2027', value: 22.5, growth: 18, status: 'future' },
      { period: '2028', value: 26.8, growth: 19, status: 'future' },
      { period: '2029', value: 33.4, growth: 25, status: 'future' }
    ],
    gradients: {
      past: { top: '#86efac', bottom: '#bbf7d0' },
      future: { top: '#16a34a', bottom: '#22c55e' }
    },
    nav: {
      back: { id: 'eps', title: 'Annual EPS Diluted', desc: 'Diluted earnings per share' },
      next: { id: 'quarterly-revenue', title: 'Quarterly Revenue', desc: 'Quarter-by-quarter trends' }
    }
  },

  'quarterly-revenue': {
    id: 'quarterly-revenue',
    title: 'Quarterly Revenue',
    subtitle: 'Quarterly Revenue Projected To Reach $93.4B By 2028',
    stats: {
      main: { label: 'Quarterly Revenue', value: '$65.6B' },
      stat1: { label: 'Last Quarter Growth', value: '+13%', cls: 'growth-pos' },
      stat2: { label: 'Last 4 Qtrs Avg Growth', value: '+15.1%', cls: 'growth-pos' },
      stat3: { label: 'Next 4 Qtrs Avg', value: '+16.2%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Accelerating', cls: 'growth-trend' }
    },
    projectionTarget: 93.4,
    yMax: 150,
    data: [
      { period: "Q1 '23", value: 38.2, growth: 8.5, status: 'past' },
      { period: "Q2 '23", value: 42.5, growth: 11.2, status: 'past' },
      { period: "Q3 '23", value: 47.1, growth: 10.8, status: 'past' },
      { period: "Q4 '23", value: 52.8, growth: 12.1, status: 'past' },
      { period: "Q1 '24", value: 56.2, growth: 6.4, status: 'past' },
      { period: "Q2 '24", value: 61.8, growth: 10.0, status: 'past' },
      { period: "Q3 '24", value: 65.6, growth: 6.1, status: 'past' },
      { period: "Q4 '24", value: 72.4, growth: 10.4, status: 'past' },
      { period: "Q1 '25", value: 78.1, growth: 7.9, status: 'future' },
      { period: "Q2 '25", value: 84.5, growth: 8.2, status: 'future' },
      { period: "Q3 '25", value: 89.2, growth: 5.6, status: 'future' },
      { period: "Q4 '25", value: 93.4, growth: 4.7, status: 'future' }
    ],
    gradients: {
      past: { top: '#fcd34d', bottom: '#fde68a' },
      future: { top: '#d97706', bottom: '#f59e0b' }
    },
    nav: {
      back: { id: 'eps-basic', title: 'Annual EPS Basic', desc: 'Basic earnings per share' },
      next: { id: 'gross-profit', title: 'Gross Profit', desc: 'Revenue minus COGS' }
    }
  },

  'gross-profit': {
    id: 'gross-profit',
    title: 'Gross Profit',
    subtitle: 'Gross Profit Projected To Reach $420B By 2030',
    stats: {
      main: { label: 'Gross Profit', value: '$171B' },
      stat1: { label: 'Last Year Growth', value: '+15%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+17.2%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+18.5%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Strong Growth', cls: 'growth-trend' }
    },
    projectionTarget: 420,
    yMax: 550,
    data: [
      { period: '2014', value: 59.9, growth: 14, status: 'past' },
      { period: '2015', value: 60.5, growth: 1, status: 'past' },
      { period: '2016', value: 58.4, growth: -3, status: 'past' },
      { period: '2017', value: 72.0, growth: 23, status: 'past' },
      { period: '2018', value: 82.9, growth: 15, status: 'past' },
      { period: '2019', value: 96.9, growth: 17, status: 'past' },
      { period: '2020', value: 115.9, growth: 20, status: 'past' },
      { period: '2021', value: 139.8, growth: 21, status: 'past' },
      { period: '2022', value: 135.6, growth: -3, status: 'past' },
      { period: '2023', value: 148.3, growth: 9, status: 'past' },
      { period: '2024', value: 171.0, growth: 15, status: 'past' },
      { period: '2025', value: 200.0, growth: 17, status: 'past' },
      { period: '2026', value: 235.0, growth: 18, status: 'past' },
      { period: '2027', value: 278.0, growth: 18, status: 'future' },
      { period: '2028', value: 328.0, growth: 18, status: 'future' },
      { period: '2029', value: 370.0, growth: 13, status: 'future' },
      { period: '2030', value: 420.0, growth: 14, status: 'future' }
    ],
    gradients: {
      past: { top: '#93c5fd', bottom: '#bfdbfe' },
      future: { top: '#2563eb', bottom: '#3b82f6' }
    },
    nav: {
      back: { id: 'quarterly-revenue', title: 'Quarterly Revenue', desc: 'Quarter-by-quarter trends' },
      next: { id: 'operating-income', title: 'Operating Income', desc: 'EBIT profitability' }
    }
  },

  'operating-income': {
    id: 'operating-income',
    title: 'Operating Income',
    subtitle: 'Operating Income Projected To Reach $290B By 2030',
    stats: {
      main: { label: 'Operating Income', value: '$109B' },
      stat1: { label: 'Last Year Growth', value: '+24%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+20.3%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+21.0%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Strong Growth', cls: 'growth-trend' }
    },
    projectionTarget: 290,
    yMax: 400,
    data: [
      { period: '2014', value: 27.8, growth: 9, status: 'past' },
      { period: '2015', value: 18.2, growth: -35, status: 'past' },
      { period: '2016', value: 26.1, growth: 43, status: 'past' },
      { period: '2017', value: 29.3, growth: 12, status: 'past' },
      { period: '2018', value: 35.1, growth: 20, status: 'past' },
      { period: '2019', value: 43.0, growth: 22, status: 'past' },
      { period: '2020', value: 53.4, growth: 24, status: 'past' },
      { period: '2021', value: 71.3, growth: 34, status: 'past' },
      { period: '2022', value: 83.4, growth: 17, status: 'past' },
      { period: '2023', value: 88.5, growth: 6, status: 'past' },
      { period: '2024', value: 109.4, growth: 24, status: 'past' },
      { period: '2025', value: 130.0, growth: 19, status: 'past' },
      { period: '2026', value: 155.0, growth: 19, status: 'past' },
      { period: '2027', value: 186.0, growth: 20, status: 'future' },
      { period: '2028', value: 224.0, growth: 20, status: 'future' },
      { period: '2029', value: 257.0, growth: 15, status: 'future' },
      { period: '2030', value: 290.0, growth: 13, status: 'future' }
    ],
    gradients: {
      past: { top: '#f9a8d4', bottom: '#fbcfe8' },
      future: { top: '#be185d', bottom: '#db2777' }
    },
    nav: {
      back: { id: 'gross-profit', title: 'Gross Profit', desc: 'Revenue minus COGS' },
      next: { id: 'free-cash-flow', title: 'Free Cash Flow', desc: 'Cash generative power' }
    }
  },

  'free-cash-flow': {
    id: 'free-cash-flow',
    title: 'Free Cash Flow',
    subtitle: 'Free Cash Flow Projected To Reach $195B By 2030',
    stats: {
      main: { label: 'Free Cash Flow', value: '$74.1B' },
      stat1: { label: 'Last Year Growth', value: '+13%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+18.2%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+20.0%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Strong Growth', cls: 'growth-trend' }
    },
    projectionTarget: 195,
    yMax: 260,
    data: [
      { period: '2014', value: 18.6, growth: 8, status: 'past' },
      { period: '2015', value: 14.2, growth: -24, status: 'past' },
      { period: '2016', value: 20.8, growth: 46, status: 'past' },
      { period: '2017', value: 26.1, growth: 26, status: 'past' },
      { period: '2018', value: 32.2, growth: 23, status: 'past' },
      { period: '2019', value: 38.3, growth: 19, status: 'past' },
      { period: '2020', value: 45.2, growth: 18, status: 'past' },
      { period: '2021', value: 56.1, growth: 24, status: 'past' },
      { period: '2022', value: 65.1, growth: 16, status: 'past' },
      { period: '2023', value: 65.5, growth: 1, status: 'past' },
      { period: '2024', value: 74.1, growth: 13, status: 'past' },
      { period: '2025', value: 89.0, growth: 20, status: 'past' },
      { period: '2026', value: 107.0, growth: 20, status: 'past' },
      { period: '2027', value: 128.0, growth: 20, status: 'future' },
      { period: '2028', value: 154.0, growth: 20, status: 'future' },
      { period: '2029', value: 175.0, growth: 14, status: 'future' },
      { period: '2030', value: 195.0, growth: 11, status: 'future' }
    ],
    gradients: {
      past: { top: '#6ee7b7', bottom: '#a7f3d0' },
      future: { top: '#0d9488', bottom: '#14b8a6' }
    },
    nav: {
      back: { id: 'operating-income', title: 'Operating Income', desc: 'EBIT profitability' },
      next: { id: 'dividend', title: 'Dividend Per Share', desc: 'Shareholder returns' }
    }
  },

  dividend: {
    id: 'dividend',
    title: 'Dividend Per Share',
    subtitle: 'Dividend Per Share Projected To Reach $4.2 By 2030',
    stats: {
      main: { label: 'Dividend Per Share', value: '$2.79' },
      stat1: { label: 'Last Year Growth', value: '+10%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+10.2%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+10.5%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Consistent', cls: 'growth-trend' }
    },
    projectionTarget: 4.2,
    yMax: 5.5,
    data: [
      { period: '2014', value: 1.24, growth: 11, status: 'past' },
      { period: '2015', value: 1.36, growth: 10, status: 'past' },
      { period: '2016', value: 1.47, growth: 8, status: 'past' },
      { period: '2017', value: 1.59, growth: 8, status: 'past' },
      { period: '2018', value: 1.72, growth: 8, status: 'past' },
      { period: '2019', value: 1.84, growth: 7, status: 'past' },
      { period: '2020', value: 2.04, growth: 11, status: 'past' },
      { period: '2021', value: 2.24, growth: 10, status: 'past' },
      { period: '2022', value: 2.48, growth: 11, status: 'past' },
      { period: '2023', value: 2.72, growth: 10, status: 'past' },
      { period: '2024', value: 2.79, growth: 3, status: 'past' },
      { period: '2025', value: 3.08, growth: 10, status: 'past' },
      { period: '2026', value: 3.40, growth: 10, status: 'past' },
      { period: '2027', value: 3.74, growth: 10, status: 'future' },
      { period: '2028', value: 4.20, growth: 12, status: 'future' }
    ],
    gradients: {
      past: { top: '#fda4af', bottom: '#fecdd3' },
      future: { top: '#e11d48', bottom: '#f43f5e' }
    },
    nav: {
      back: { id: 'free-cash-flow', title: 'Free Cash Flow', desc: 'Cash generative power' },
      next: { id: 'rd-expense', title: 'R&D Expense', desc: 'Innovation investment' }
    }
  },

  'rd-expense': {
    id: 'rd-expense',
    title: 'R&D Expense',
    subtitle: 'R&D Expense Projected To Reach $85B By 2030',
    stats: {
      main: { label: 'R&D Expense', value: '$29.5B' },
      stat1: { label: 'Last Year Growth', value: '+14%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+13.8%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+16.0%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Increasing', cls: 'growth-trend' }
    },
    projectionTarget: 85,
    yMax: 120,
    data: [
      { period: '2014', value: 11.4, growth: 18, status: 'past' },
      { period: '2015', value: 12.0, growth: 5, status: 'past' },
      { period: '2016', value: 12.1, growth: 1, status: 'past' },
      { period: '2017', value: 13.0, growth: 7, status: 'past' },
      { period: '2018', value: 14.7, growth: 13, status: 'past' },
      { period: '2019', value: 16.9, growth: 15, status: 'past' },
      { period: '2020', value: 19.3, growth: 14, status: 'past' },
      { period: '2021', value: 20.7, growth: 7, status: 'past' },
      { period: '2022', value: 24.5, growth: 18, status: 'past' },
      { period: '2023', value: 25.9, growth: 6, status: 'past' },
      { period: '2024', value: 29.5, growth: 14, status: 'past' },
      { period: '2025', value: 34.2, growth: 16, status: 'past' },
      { period: '2026', value: 39.7, growth: 16, status: 'past' },
      { period: '2027', value: 46.1, growth: 16, status: 'future' },
      { period: '2028', value: 56.0, growth: 21, status: 'future' },
      { period: '2029', value: 68.0, growth: 21, status: 'future' },
      { period: '2030', value: 85.0, growth: 25, status: 'future' }
    ],
    gradients: {
      past: { top: '#a5b4fc', bottom: '#c7d2fe' },
      future: { top: '#4f46e5', bottom: '#6366f1' }
    },
    nav: {
      back: { id: 'dividend', title: 'Dividend Per Share', desc: 'Shareholder returns' },
      next: { id: 'capex', title: 'Capital Expenditure', desc: 'Investment in growth' }
    }
  },

  capex: {
    id: 'capex',
    title: 'Capital Expenditure',
    subtitle: 'CapEx Projected To Reach $65B By 2030',
    stats: {
      main: { label: 'Capital Expenditure', value: '$44.5B' },
      stat1: { label: 'Last Year Growth', value: '+20%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Years Avg Growth', value: '+19.5%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Years Avg', value: '+13.5%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Expanding', cls: 'growth-trend' }
    },
    projectionTarget: 65,
    yMax: 90,
    data: [
      { period: '2014', value: 5.5, growth: 20, status: 'past' },
      { period: '2015', value: 5.9, growth: 7, status: 'past' },
      { period: '2016', value: 8.3, growth: 41, status: 'past' },
      { period: '2017', value: 8.1, growth: -2, status: 'past' },
      { period: '2018', value: 11.6, growth: 43, status: 'past' },
      { period: '2019', value: 13.9, growth: 20, status: 'past' },
      { period: '2020', value: 15.4, growth: 11, status: 'past' },
      { period: '2021', value: 20.6, growth: 34, status: 'past' },
      { period: '2022', value: 24.0, growth: 17, status: 'past' },
      { period: '2023', value: 37.2, growth: 55, status: 'past' },
      { period: '2024', value: 44.5, growth: 20, status: 'past' },
      { period: '2025', value: 50.4, growth: 13, status: 'past' },
      { period: '2026', value: 55.0, growth: 9, status: 'past' },
      { period: '2027', value: 59.5, growth: 8, status: 'future' },
      { period: '2028', value: 63.0, growth: 6, status: 'future' },
      { period: '2029', value: 65.0, growth: 3, status: 'future' }
    ],
    gradients: {
      past: { top: '#fde68a', bottom: '#fef3c7' },
      future: { top: '#b45309', bottom: '#d97706' }
    },
    nav: {
      back: { id: 'rd-expense', title: 'R&D Expense', desc: 'Innovation investment' },
      next: { id: 'net-debt', title: 'Net Debt', desc: 'Leverage & balance sheet' }
    }
  },

  'net-debt': {
    id: 'net-debt',
    title: 'Net Debt',
    subtitle: 'Net Debt Projected To Reach $10B By 2030',
    stats: {
      main: { label: 'Net Debt', value: '$37B' },
      stat1: { label: 'YoY Change', value: '-12%', cls: 'growth-pos' },
      stat2: { label: 'Last 3 Yrs Avg Change', value: '-10.2%', cls: 'growth-pos' },
      stat3: { label: 'Next 3 Yrs Avg Change', value: '-18.5%', cls: 'growth-pos' },
      trend: { label: 'Trend', value: 'Deleveraging', cls: 'growth-trend' }
    },
    projectionTarget: 10,
    yMax: 90,
    data: [
      { period: '2014', value: 22.1, growth: 10, status: 'past' },
      { period: '2015', value: 44.3, growth: 100, status: 'past' },
      { period: '2016', value: 62.0, growth: 40, status: 'past' },
      { period: '2017', value: 58.1, growth: -6, status: 'past' },
      { period: '2018', value: 47.8, growth: -18, status: 'past' },
      { period: '2019', value: 43.2, growth: -10, status: 'past' },
      { period: '2020', value: 53.3, growth: 23, status: 'past' },
      { period: '2021', value: 50.1, growth: -6, status: 'past' },
      { period: '2022', value: 44.4, growth: -11, status: 'past' },
      { period: '2023', value: 42.0, growth: -5, status: 'past' },
      { period: '2024', value: 37.0, growth: -12, status: 'past' },
      { period: '2025', value: 30.0, growth: -19, status: 'past' },
      { period: '2026', value: 22.0, growth: -27, status: 'past' },
      { period: '2027', value: 16.0, growth: -27, status: 'future' },
      { period: '2028', value: 13.0, growth: -19, status: 'future' },
      { period: '2029', value: 11.5, growth: -12, status: 'future' },
      { period: '2030', value: 10.0, growth: -13, status: 'future' }
    ],
    gradients: {
      past: { top: '#fca5a5', bottom: '#fecaca' },
      future: { top: '#64748b', bottom: '#94a3b8' }
    },
    nav: {
      back: { id: 'capex', title: 'Capital Expenditure', desc: 'Investment in growth' },
      next: null
    }
  }
};

export const CHART_IDS = Object.keys(CHARTS_CONFIG);
