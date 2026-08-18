import React, { useMemo } from 'react';
import {
  Clock,
  Users,
  BookOpen,
  Flame,
  Calendar,
  Plus,
  User,
} from 'lucide-react';
import { useMinistry } from '../context/MinistryContext.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { PUBLISHER_STATUS_OPTIONS, MinistryEntry } from '../types.ts';

interface HomeScreenProps {
  onOpenNewEntry: () => void;
  onOpenEditEntry: (entry: MinistryEntry) => void;
  onNavigateToTab: (tab: 'activity' | 'calendar' | 'reports' | 'settings') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenNewEntry,
}) => {
  const {
    dashboardStats,
    settings,
    entries,
  } = useMinistry();

  // Time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Today's statistics
  const todayStats = useMemo(() => {
    const now = new Date();
    const todayEntries = entries.filter(e => {
      const d = new Date(e.dateMillis);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });

    const todayMinutes = todayEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const todayRVs = todayEntries.reduce((sum, e) => sum + e.returnVisits, 0);
    const todayStudies = todayEntries.reduce((sum, e) => sum + e.bibleStudies, 0);

    const hrs = Math.floor(todayMinutes / 60);
    const mins = todayMinutes % 60;
    const formatted = hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`;

    return {
      todayMinutes,
      formatted,
      todayRVs,
      todayStudies,
    };
  }, [entries]);

  // Monthly totals
  const monthlyHours = Math.floor(dashboardStats.monthlyMinutes / 60);
  const monthlyRemainingMins = dashboardStats.monthlyMinutes % 60;
  const monthTotalFormatted =
    monthlyHours > 0
      ? monthlyRemainingMins > 0
        ? `${monthlyHours}h ${monthlyRemainingMins}m`
        : `${monthlyHours}h`
      : `${monthlyRemainingMins}m`;

  const statusInfo = PUBLISHER_STATUS_OPTIONS[settings.publisherStatus] || { displayName: 'Publisher', defaultGoalHours: 0 };
  const goalHours = settings.publisherStatus === 'CUSTOM' ? settings.customGoalHours : statusInfo.defaultGoalHours;
  const goalPercentage = goalHours > 0 ? Math.min(100, Math.round((dashboardStats.monthlyMinutes / 60 / goalHours) * 100)) : 0;

  // Remaining hours
  const totalGoalMinutes = goalHours * 60;
  const remainingMinutes = Math.max(0, totalGoalMinutes - dashboardStats.monthlyMinutes);
  const remainingHoursPart = Math.floor(remainingMinutes / 60);
  const remainingMinsPart = remainingMinutes % 60;
  const remainingFormatted =
    remainingHoursPart > 0
      ? remainingMinsPart > 0
        ? `${remainingHoursPart}h ${remainingMinsPart}m remaining`
        : `${remainingHoursPart}h remaining`
      : `${remainingMinsPart}m remaining`;

  const streakText = `${dashboardStats.streakMonths} ${dashboardStats.streakMonths === 1 ? 'Month' : 'Months'}`;

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto">
      {/* Top Greeting Header */}
      <div className="pt-2">
        <p className="text-base font-medium text-blue-600 dark:text-blue-400">
          {greeting}
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
          JW Ministry App
        </h1>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/50 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
          <User className="h-3.5 w-3.5" />
          <span>
            {statusInfo.displayName}
            {settings.publisherStatus === 'CUSTOM' && ` (${settings.customGoalHours}h)`}
          </span>
        </div>
      </div>

      {/* Monthly Goal Progress Card */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131D31] p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Monthly Goal Progress
          </h2>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
            {goalHours > 0 ? `${goalPercentage}%` : 'Flexible'}
          </span>
        </div>

        {/* Progress Bar with End Dot */}
        <div className="relative my-3.5 h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800/80">
          <div
            style={{ width: `${Math.max(2, goalPercentage)}%` }}
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
          />
          {goalHours > 0 && goalPercentage < 100 && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-blue-600" />
          )}
        </div>

        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500 dark:text-slate-400">
            {monthTotalFormatted} {goalHours > 0 ? `/ ${goalHours}h` : ''}
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            {goalHours > 0 ? remainingFormatted : `${monthTotalFormatted} recorded`}
          </span>
        </div>
      </div>

      {/* Primary Action Button: + Add Ministry Entry */}
      <div>
        <button
          onClick={onOpenNewEntry}
          className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] py-3.5 sm:py-4 px-6 text-base font-semibold text-white shadow-xs shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
          <span>Add Ministry Entry</span>
        </button>
      </div>

      {/* Section: Ministry Statistics */}
      <div className="pt-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
          Ministry Statistics
        </h2>

        {/* 2x2 Grid + Full-width Streak Card */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Today"
            value={todayStats.formatted}
            subtitle="today"
            icon={Clock}
            bgAccentColor="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
          />

          <StatCard
            title="Month Total"
            value={monthTotalFormatted}
            subtitle={dashboardStats.monthName}
            icon={Calendar}
            bgAccentColor="bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
          />

          <StatCard
            title="Return Visits"
            value={todayStats.todayRVs}
            subtitle={`today (${dashboardStats.monthlyReturnVisits} this month)`}
            icon={Users}
            bgAccentColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          />

          <StatCard
            title="Bible Studies"
            value={todayStats.todayStudies}
            subtitle={`today (${dashboardStats.monthlyBibleStudies} this month)`}
            icon={BookOpen}
            bgAccentColor="bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
          />

          <div className="col-span-2">
            <StatCard
              title="Ministry Streak"
              value={streakText}
              subtitle="Active consecutive months"
              icon={Flame}
              bgAccentColor="bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
