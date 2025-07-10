
import React from 'react';

type Props = {
  label: string;
  value: string | number;
};

const InfoDisplay: React.FC<Props> = ({ label, value }) => (
  <div className="flex flex-col items-center justify-center p-3 bg-slate-800 rounded-lg shadow-inner w-full text-center">
    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
    <span className="text-2xl font-bold text-white font-mono">{value}</span>
  </div>
);

export default InfoDisplay;
