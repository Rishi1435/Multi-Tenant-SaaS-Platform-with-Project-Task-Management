import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({ label, options = [], className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-zinc-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full appearance-none
            bg-zinc-900/50 
            border border-white/10 
            rounded-xl 
            px-4 py-3 
            text-sm text-white 
            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
            transition-all duration-200
            cursor-pointer
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-300">
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom Arrow Icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};