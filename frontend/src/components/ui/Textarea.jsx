import React from 'react';

export const Textarea = ({ label, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-400 ml-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full 
          bg-zinc-900/50 
          border border-white/10 
          rounded-xl 
          px-4 py-3 
          text-sm text-white 
          placeholder:text-zinc-600 
          focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
          transition-all duration-200
          min-h-[100px] resize-y
          ${className}
        `}
        {...props}
      />
    </div>
  );
};