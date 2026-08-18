import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  bgAccentColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  bgAccentColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131D31] p-4 sm:p-5 shadow-xs transition-all hover:shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
          {title}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${bgAccentColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2.5">
        <div className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {value}
        </div>
        <p className="mt-0.5 text-xs font-normal text-slate-400 dark:text-slate-500 truncate">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
