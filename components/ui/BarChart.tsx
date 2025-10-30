import React from 'react';

interface BarChartData {
    label: string;
    values: { [key: string]: number };
}

interface BarChartProps {
    data: BarChartData[];
    colors: { [key: string]: string };
}

export const BarChart: React.FC<BarChartProps> = ({ data, colors }) => {
    if (!data || data.length === 0) {
        return <div className="text-center text-brand-text-dark p-4">No data available for chart.</div>;
    }

    const valueKeys = Object.keys(data[0].values);
    const maxValue = 100; // Assuming percentage-based values

    return (
        <div>
            <div className="flex justify-end gap-4 text-xs mb-4">
                {valueKeys.map(key => (
                    <div key={key} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[key] || '#ccc' }}></div>
                        <span>{key}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between gap-2" style={{ height: '150px' }}>
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col justify-end items-center gap-1">
                        <div className="w-full flex justify-center items-end gap-1" style={{ height: '100%' }}>
                            {valueKeys.map(key => (
                                <div key={key} className="group relative flex-1" style={{ height: `${(item.values[key] / maxValue) * 100}%` }}>
                                    <div
                                        className="w-full h-full rounded-t-sm"
                                        style={{ backgroundColor: colors[key] || '#ccc' }}
                                    ></div>
                                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-max bg-brand-bg-light text-brand-text-light text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {item.values[key].toFixed(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-brand-text-dark text-center mt-1">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};