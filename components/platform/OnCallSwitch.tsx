import React from 'react';

interface OnCallSwitchProps {
    on: boolean;
    setOn: (on: boolean) => void;
}

export const OnCallSwitch: React.FC<OnCallSwitchProps> = ({ on, setOn }) => {
    return (
        <div className="flex flex-col items-center">
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-brand-bg rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
            <span className={`text-xs font-semibold mt-1 ${on ? 'text-green-400' : 'text-brand-text-dark'}`}>
                {on ? 'On Call' : 'Off'}
            </span>
        </div>
    );
};