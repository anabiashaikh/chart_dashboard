'use client';

import { ChartConfig } from '@/data/chartsData';

interface DataTableProps {
  config: ChartConfig;
}

export default function DataTable({ config }: DataTableProps) {
  const data = config.data;
  const isQuarterly = config.id.includes('quarter');

  const formatValue = (v: number) => {
    if (v >= 100) return `$${Math.round(v)}B`;
    if (v >= 10)  return `$${v.toFixed(1)}B`;
    return `$${v.toFixed(1)}B`;
  };

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th className="year-col">{isQuarterly ? 'Quarter' : 'Year'}</th>
            <th className="value-col">{config.title}</th>
            <th className="growth-col">{isQuarterly ? 'QoQ Change' : 'YoY Change'}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.period} className={row.status === 'future' ? 'future-row' : ''}>
              <td className="year-cell">{row.period}</td>
              <td className="value-cell">{formatValue(row.value)}</td>
              <td className={`growth-cell ${row.growth >= 0 ? 'pos' : 'neg'}`}>
                {row.growth > 0 ? '+' : ''}{row.growth}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
