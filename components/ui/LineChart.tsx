import React from 'react';

interface Point {
  x: string | number;
  y: number;
}

interface DataSet {
  id: string;
  color: string;
  data: Point[];
}

interface Marker {
    date: string | number;
    label: string;
}

interface LineChartProps {
  data: DataSet[];
  yLabel?: string;
  markers?: Marker[];
}

export const LineChart: React.FC<LineChartProps> = ({ data, yLabel, markers = [] }) => {
  if (!data || data.length === 0 || data.some(ds => ds.data.length === 0)) {
    return <div className="text-center text-brand-text-dark p-4">No data available for chart.</div>;
  }

  const width = 500;
  const height = 150;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };

  const allX = data.flatMap(ds => ds.data.map(p => new Date(p.x).getTime()));
  const allY = data.flatMap(ds => ds.data.map(p => p.y));

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY) > 0 ? 0 : Math.min(...allY);
  const maxY = Math.max(...allY);

  const x = (val: number) => padding.left + (val - minX) / (maxX - minX) * (width - padding.left - padding.right);
  const y = (val: number) => height - padding.bottom - (val - minY) / (maxY - minY) * (height - padding.top - padding.bottom);

  const createPath = (dataSet: Point[]) => {
    return dataSet
      .map((p, i) => {
        const pointX = x(new Date(p.x).getTime());
        const pointY = y(p.y);
        return i === 0 ? `M ${pointX} ${pointY}` : `L ${pointX} ${pointY}`;
      })
      .join(' ');
  };
  
  const yAxisLabels = [minY, minY + (maxY - minY) / 2, maxY];

  return (
    <div>
        <div className="flex justify-end gap-4 text-xs mb-2">
            {data.map(ds => (
                <div key={ds.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }}></div>
                    <span>{ds.id}</span>
                </div>
            ))}
        </div>
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Y-axis labels and grid lines */}
                {yAxisLabels.map((label, i) => (
                <g key={i}>
                    <text x={padding.left - 5} y={y(label)} dy="0.3em" textAnchor="end" className="text-[10px] fill-brand-text-dark">
                    {Math.round(label)}
                    </text>
                    <line x1={padding.left} x2={width - padding.right} y1={y(label)} y2={y(label)} className="stroke-brand-border stroke-dasharray-2" />
                </g>
                ))}

                {/* X-axis labels (Start and End Date) */}
                <text x={padding.left} y={height - 5} className="text-[10px] fill-brand-text-dark">{new Date(minX).toLocaleDateString()}</text>
                <text x={width - padding.right} y={height - 5} textAnchor="end" className="text-[10px] fill-brand-text-dark">{new Date(maxX).toLocaleDateString()}</text>


                {/* Data Paths */}
                {data.map(ds => (
                <path
                    key={ds.id}
                    d={createPath(ds.data)}
                    stroke={ds.color}
                    strokeWidth="2"
                    fill="none"
                />
                ))}

                {/* Markers */}
                {markers.map((marker, i) => {
                    const markerX = x(new Date(marker.date).getTime());
                    return (
                        <g key={i}>
                             <line x1={markerX} y1={padding.top} x2={markerX} y2={height - padding.bottom} className="stroke-yellow-400" strokeWidth="1.5" strokeDasharray="3,3"/>
                             <text x={markerX} y={padding.top + 5} textAnchor="middle" className="text-[10px] font-bold fill-yellow-400 bg-brand-bg">{marker.label}</text>
                        </g>
                    )
                })}
            </svg>
        </div>
    </div>
  );
};