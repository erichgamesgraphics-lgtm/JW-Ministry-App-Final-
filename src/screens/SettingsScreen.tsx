import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  Calendar as CalendarIcon,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  ChevronRight,
  Database,
  Key,
} from 'lucide-react';
import { useMinistry } from '../context/MinistryContext.tsx';
import { PublisherStatusType, PUBLISHER_STATUS_OPTIONS, GoogleDriveBackupItem } from '../types.ts';

import { JWMinistryLogo } from '../components/JWMinistryLogo.tsx';

interface SettingsScreenProps {
  onShowWelcome?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onShowWelcome: _onShowWelcome }) => {
  const {
    settings,
    updateSettings,
    currentUser,
    isSyncing,
    isAuthenticating,
    connectGoogleAccount,
    disconnectGoogleAccount,
    syncGoogleCalendar,
    backupToGoogleDrive,
    restoreFromGoogleDrive,
    listGoogleDriveBackups,
    createBackup,
    restoreBackup,
    exportCsv,
    clearAllData,
  } = useMinistry();

  const [customGoal, setCustomGoal] = useState<number>(settings.customGoalHours || 50);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showRestoreDriveModal, setShowRestoreDriveModal] = useState<boolean>(false);
  const [driveBackupsList, setDriveBackupsList] = useState<GoogleDriveBackupItem[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState<boolean>(false);
  const [customClientIdInput, setCustomClientIdInput] = useState<string>(settings.googleClientId || '');
  const [showClientIdConfig, setShowClientIdConfig] = useState<boolean>(false);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 4500);
  };

  const handleStatusChange = (status: PublisherStatusType) => {
    updateSettings({ publisherStatus: status });
    showNotification(`Status updated to ${PUBLISHER_STATUS_OPTIONS[status].displayName}`);
  };

  const handleCustomGoalSave = () => {
    updateSettings({ customGoalHours: customGoal });
    showNotification(`Custom goal set to ${customGoal} hours`);
  };

  const handleConnectGoogle = async () => {
    const result = await connectGoogleAccount();
    if (result.success) {
      showNotification(`Connected to Google Account (${result.email || 'Verified'})`);
    } else {
      showError(result.error || 'Failed to connect Google Account');
    }
  };

  const handleDisconnectGoogle = () => {
    disconnectGoogleAccount();
    showNotification('Disconnected Google Account');
  };

  const handleSyncCalendar = async () => {
    const result = await syncGoogleCalendar();
    if (result.success) {
      showNotification(result.message);
    } else {
      showError(result.message);
    }
  };

  const handleBackupDrive = async () => {
    const result = await backupToGoogleDrive();
    if (result.success) {
      showNotification(result.message);
    } else {
      showError(result.message);
    }
  };

  const handleOpenRestoreDriveModal = async () => {
    setShowRestoreDriveModal(true);
    setIsLoadingBackups(true);
    const backups = await listGoogleDriveBackups();
    setDriveBackupsList(backups);
    setIsLoadingBackups(false);
  };

  const handleConfirmRestoreDrive = async (fileId?: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to restore from Google Drive? This will replace current entries with the backup data.'
    );
    if (!confirmed) return;

    const result = await restoreFromGoogleDrive(fileId);
    if (result.success) {
      setShowRestoreDriveModal(false);
      showNotification(result.message);
    } else {
      showError(result.message);
    }
  };

  const handleSaveClientId = () => {
    updateSettings({ googleClientId: customClientIdInput.trim() });
    showNotification('Google Client ID configuration saved');
    setShowClientIdConfig(false);
  };

  const handleExportJson = () => {
    const jsonStr = createBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ministry_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Backup JSON downloaded successfully');
  };

  const handleExportCsv = () => {
    const csvStr = exportCsv();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ministry_records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('CSV records exported successfully');
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const success = restoreBackup(content);
      if (success) {
        showNotification('Local backup data imported successfully!');
      } else {
        showError('Failed to parse backup JSON file. Please verify file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const reminderTimeString = `${(settings.dailyReminderHour || 20).toString().padStart(2, '0')}:${(settings.dailyReminderMinute || 0).toString().padStart(2, '0')}`;

  const handleReminderTimeChange = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    updateSettings({
      dailyReminderHour: h,
      dailyReminderMinute: m,
    });
    showNotification(`Reminder time set to ${timeStr}`);
  };

  const statusList: PublisherStatusType[] = [
    'PUBLISHER',
    'AUXILIARY_PIONEER_15',
    'AUXILIARY_PIONEER_30',
    'REGULAR_PIONEER_50',
    'SPECIAL_PIONEER_100',
    'CUSTOM',
  ];

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto">
      {/* Screen Title */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3.5 text-xs font-semibold text-red-700 dark:text-red-300">
          <RotateCcw className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION: Google Account & Cloud Services Integration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Google Account & Cloud Sync
          </h2>
          <span className="text-[11px] font-medium text-slate-400">
            OAuth 2.0
          </span>
        </div>

        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131D31] p-5 shadow-xs space-y-4">
          {/* Account Status Card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${settings.googleCalendarConnected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                {settings.googleCalendarConnected ? (
                  <Cloud className="h-5 w-5" />
                ) : (
                  <CloudOff className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {settings.googleUserEmail || currentUser?.email || 'Not Connected'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {settings.googleCalendarConnected
                    ? 'Connected with Google Services'
                    : 'Sign in to enable Calendar sync & Drive backups'}
                </div>
              </div>
            </div>

            {settings.googleCalendarConnected ? (
              <button
                onClick={handleDisconnectGoogle}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                title="Disconnect Google Account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleConnectGoogle}
                disabled={isAuthenticating}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isAuthenticating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Cloud className="h-3.5 w-3.5" />
                )}
                <span>Connect</span>
              </button>
            )}
          </div>

          {/* Google Calendar Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Google Calendar Sync
                </span>
              </div>
              <button
                onClick={handleSyncCalendar}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Last synchronized:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {settings.lastCalendarSync > 0
                  ? new Date(settings.lastCalendarSync).toLocaleString()
                  : 'Never synced'}
              </span>
            </div>

            {/* Auto Sync Toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="pr-4">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Auto-Sync Arrangements
                </div>
                <div className="text-[11px] text-slate-400">
                  Automatically push new/edited arrangements to Google Calendar
                </div>
              </div>

              <button
                onClick={() => updateSettings({ autoCalendarSync: !settings.autoCalendarSync })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.autoCalendarSync ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.autoCalendarSync ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Google Drive Backup Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Google Drive Cloud Backup
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleBackupDrive}
                disabled={isSyncing}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-3 text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Backup to Drive</span>
              </button>

              <button
                onClick={handleOpenRestoreDriveModal}
                disabled={isSyncing}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 px-3 text-xs transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-blue-600" />
                <span>Restore from Drive</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Last Drive backup:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {settings.lastDriveBackup > 0
                  ? new Date(settings.lastDriveBackup).toLocaleString()
                  : 'No cloud backup yet'}
              </span>
            </div>
          </div>

          {/* Advanced Client ID Configuration Drawer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowClientIdConfig(!showClientIdConfig)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
            >
              <div className="flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                <span>OAuth Configuration</span>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showClientIdConfig ? 'rotate-90' : ''}`} />
            </button>

            {showClientIdConfig && (
              <div className="mt-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  Google OAuth Client ID (Optional for custom GCP project)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                    value={customClientIdInput}
                    onChange={e => setCustomClientIdInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSaveClientId}
                    className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION: Publisher Status & Goal */}
      <div className="space-y-2 pt-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white px-1">
          Publisher Status & Goal
        </h2>

        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131D31] p-5 shadow-xs space-y-3">
          {statusList.map(statusKey => {
            const info = PUBLISHER_STATUS_OPTIONS[statusKey];
            const isSelected = settings.publisherStatus === statusKey;

            return (
              <label
                key={statusKey}
                onClick={() => handleStatusChange(statusKey)}
                className={`flex items-start gap-3.5 p-3 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {/* Radio Button */}
                <div className="mt-0.5 flex items-center justify-center">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className={`text-sm font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    {info.displayName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {info.description}
                  </div>

                  {/* Custom Goal Input if selected */}
                  {statusKey === 'CUSTOM' && isSelected && (
                    <div className="mt-3 flex items-center gap-2 pt-2 border-t border-blue-100 dark:border-blue-900/40" onClick={e => e.stopPropagation()}>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Goal hours:</span>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={customGoal}
                        onChange={e => setCustomGoal(parseInt(e.target.value) || 0)}
                        className="w-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={handleCustomGoalSave}
                        className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* SECTION: Preferences & Reminders */}
      <div className="space-y-2 pt-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white px-1">
          Preferences & Reminders
        </h2>

        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131D31] p-5 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between py-3 first:pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Ministry Reminders
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Notifications for scheduled ministry
                </div>
              </div>
            </div>

            <button
              onClick={() => updateSettings({ dailyReminderEnabled: !settings.dailyReminderEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.dailyReminderEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  settings.dailyReminderEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Daily Reminder Time */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Reminder Time
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Remind to record activity at {reminderTimeString}
              </div>
            </div>

            <input
              type="time"
              value={reminderTimeString}
              onChange={e => handleReminderTimeChange(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          {/* Theme Appearance Mode */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Theme Appearance
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Light, dark, or system mode
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {[
                { mode: 'LIGHT', icon: Sun },
                { mode: 'DARK', icon: Moon },
                { mode: 'SYSTEM', icon: Laptop },
              ].map(theme => {
                const Icon = theme.icon;
                const isCurrent = settings.themeMode === theme.mode;
                return (
                  <button
                    key={theme.mode}
                    onClick={() => updateSettings({ themeMode: theme.mode as any })}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Local Backup & Data Management */}
      <div className="space-y-2 pt-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white px-1">
          Local Backup & Data Tools
        </h2>

        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131D31] p-5 shadow-xs space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D31] p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4 text-blue-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D31] p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              <span>Download JSON</span>
            </button>
          </div>

          <label className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer">
            <Upload className="h-4 w-4 text-purple-600" />
            <span>Restore / Import Local File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Clear Data Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {showClearConfirm ? (
              <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 p-3 text-center space-y-2">
                <p className="text-xs font-bold text-red-700 dark:text-red-300">
                  Are you sure? This will delete all local entries and scheduled events.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      clearAllData();
                      setShowClearConfirm(false);
                      showNotification('All records cleared successfully');
                    }}
                    className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="rounded-xl bg-slate-200 dark:bg-slate-700 px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline py-1 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear All Data</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131D31] p-5 shadow-xs text-center text-xs text-slate-500 dark:text-slate-400 space-y-2 flex flex-col items-center">
        <JWMinistryLogo size={52} className="rounded-2xl shadow-xs" />
        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1 font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>JW Ministry App v2.0</span>
          </div>
          <p>A companion tool for Jehovah's Witnesses in sacred service.</p>
          <p className="text-[11px] text-slate-400">Offline-first PWA with Google Services Sync.</p>
        </div>
      </div>

      {/* Modal: Restore from Google Drive */}
      {showRestoreDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#131D31] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Restore from Google Drive
                </h3>
              </div>
              <button
                onClick={() => setShowRestoreDriveModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {isLoadingBackups ? (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs text-slate-500">Checking Google Drive for backups...</p>
              </div>
            ) : driveBackupsList.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-xs text-slate-500">Select a backup version to restore:</p>
                {driveBackupsList.map(bk => (
                  <button
                    key={bk.id}
                    onClick={() => handleConfirmRestoreDrive(bk.id)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-all cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {bk.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(bk.modifiedTime).toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Restore
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  No previous backup files found in this Google account.
                </p>
                <button
                  onClick={() => handleConfirmRestoreDrive()}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Attempt Default Cloud Sync
                </button>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowRestoreDriveModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

