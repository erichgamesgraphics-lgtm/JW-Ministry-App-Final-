import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  MinistryEntry,
  ScheduledEvent,
  UserSettings,
  TimerState,
  PublisherStatusType,
  MinistryTypeCategory,
  DashboardStats,
  ReportsData,
  UserProfile,
  PUBLISHER_STATUS_OPTIONS,
  GoogleDriveBackupItem,
} from '../types.ts';
import { storage, DEFAULT_TIMER } from '../utils/storage.ts';
import { googleServices } from '../utils/googleServices.ts';

interface MinistryContextType {
  entries: MinistryEntry[];
  events: ScheduledEvent[];
  settings: UserSettings;
  timer: TimerState;
  currentUser: UserProfile | null;
  isSyncing: boolean;
  isAuthenticating: boolean;
  dashboardStats: DashboardStats;
  
  // Entry Operations
  saveEntry: (entryData: Partial<MinistryEntry> & { id?: number }) => MinistryEntry;
  deleteEntry: (id: number) => void;
  
  // Event Operations
  saveEvent: (eventData: Partial<ScheduledEvent> & { id?: number }) => Promise<ScheduledEvent>;
  deleteEvent: (id: number) => Promise<void>;
  toggleEventCompleted: (id: number) => void;
  
  // Settings & Status
  updateSettings: (partial: Partial<UserSettings>) => void;
  updatePublisherStatus: (status: PublisherStatusType, customGoal?: number) => void;
  updateTheme: (theme: 'SYSTEM' | 'LIGHT' | 'DARK') => void;
  
  // Timer Operations
  startTimer: (ministryType?: MinistryTypeCategory, location?: string, notes?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopAndSaveTimer: () => MinistryEntry | null;
  resetTimer: () => void;
  updateTimerDraft: (updates: Partial<TimerState>) => void;
  currentTimerElapsedSeconds: number;

  // Auth & Google Services
  signInWithGoogle: (onSuccess?: () => void, onError?: (err: string) => void) => void;
  signInWithApple: (onSuccess?: () => void, onError?: (err: string) => void) => void;
  signOut: (onComplete?: () => void) => void;
  continueAsGuest: () => void;
  syncWithCloud: () => Promise<{ success: boolean; message: string }>;

  // Google Calendar & Drive Operations
  connectGoogleAccount: () => Promise<{ success: boolean; email?: string; error?: string }>;
  disconnectGoogleAccount: () => void;
  syncGoogleCalendar: () => Promise<{ success: boolean; count: number; message: string }>;
  backupToGoogleDrive: () => Promise<{ success: boolean; message: string }>;
  restoreFromGoogleDrive: (fileId?: string) => Promise<{ success: boolean; message: string }>;
  listGoogleDriveBackups: () => Promise<GoogleDriveBackupItem[]>;
  
  // Data Tools
  exportCsv: () => string;
  createBackup: () => string;
  restoreBackup: (json: string) => boolean;
  clearAllData: () => void;
  getReportsForPeriod: (periodIndex: number) => ReportsData;
}

const MinistryContext = createContext<MinistryContextType | undefined>(undefined);

export const MinistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<MinistryEntry[]>(() => storage.getEntries());
  const [events, setEvents] = useState<ScheduledEvent[]>(() => storage.getEvents());
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [timer, setTimer] = useState<TimerState>(() => storage.getTimer());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const s = storage.getSettings();
    if (s.userEmail) {
      return {
        uid: 'user_local_' + (s.userEmail || 'guest'),
        email: s.userEmail,
        displayName: s.userName || 'Ministry Publisher',
      };
    }
    return null;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [timerTicker, setTimerTicker] = useState<number>(0);

  // Sync to local storage on state changes
  useEffect(() => {
    storage.saveEntries(entries);
  }, [entries]);

  useEffect(() => {
    storage.saveEvents(events);
  }, [events]);

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storage.saveTimer(timer);
  }, [timer]);

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.themeMode === 'DARK') {
      root.classList.add('dark');
    } else if (settings.themeMode === 'LIGHT') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.themeMode]);

  // Live Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimerTicker(t => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning]);

  // Calculate live elapsed seconds for active timer
  const currentTimerElapsedSeconds = useMemo(() => {
    if (!timer.isRunning) {
      return timer.accumulatedSeconds;
    }
    const currentRunTime = Math.floor((Date.now() - timer.startTimeMillis) / 1000);
    return timer.accumulatedSeconds + Math.max(0, currentRunTime);
  }, [timer, timerTicker]);

  // Entry operations
  const saveEntry = useCallback((entryData: Partial<MinistryEntry> & { id?: number }) => {
    let saved: MinistryEntry;
    if (entryData.id && entryData.id > 0) {
      // Update
      const now = Date.now();
      saved = {
        id: entryData.id,
        dateMillis: entryData.dateMillis ?? now,
        startTimeMillis: entryData.startTimeMillis ?? 0,
        endTimeMillis: entryData.endTimeMillis ?? 0,
        durationMinutes: entryData.durationMinutes ?? 0,
        ministryType: entryData.ministryType ?? 'HOUSE_TO_HOUSE',
        returnVisits: entryData.returnVisits ?? 0,
        bibleStudies: entryData.bibleStudies ?? 0,
        placements: entryData.placements ?? 0,
        location: entryData.location ?? '',
        notes: entryData.notes ?? '',
        isSynced: false,
        createdAt: entryData.createdAt ?? now,
        updatedAt: now,
      };
      setEntries(prev => prev.map(e => e.id === saved.id ? saved : e));
    } else {
      // Create new
      const now = Date.now();
      const newId = now;
      saved = {
        id: newId,
        dateMillis: entryData.dateMillis ?? now,
        startTimeMillis: entryData.startTimeMillis ?? 0,
        endTimeMillis: entryData.endTimeMillis ?? 0,
        durationMinutes: entryData.durationMinutes ?? 0,
        ministryType: entryData.ministryType ?? 'HOUSE_TO_HOUSE',
        returnVisits: entryData.returnVisits ?? 0,
        bibleStudies: entryData.bibleStudies ?? 0,
        placements: entryData.placements ?? 0,
        location: entryData.location ?? '',
        notes: entryData.notes ?? '',
        isSynced: false,
        createdAt: now,
        updatedAt: now,
      };
      setEntries(prev => [saved, ...prev]);
    }
    return saved;
  }, []);

  const deleteEntry = useCallback((id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  // Event operations (with optional Google Calendar auto-push)
  const saveEvent = useCallback(async (eventData: Partial<ScheduledEvent> & { id?: number }): Promise<ScheduledEvent> => {
    let saved: ScheduledEvent;
    if (eventData.id && eventData.id > 0) {
      saved = {
        id: eventData.id,
        title: eventData.title ?? 'Ministry Arrangement',
        dateMillis: eventData.dateMillis ?? Date.now(),
        startTimeMillis: eventData.startTimeMillis ?? Date.now(),
        endTimeMillis: eventData.endTimeMillis ?? Date.now() + 2 * 3600 * 1000,
        location: eventData.location ?? '',
        description: eventData.description ?? '',
        reminderMinutesBefore: eventData.reminderMinutesBefore ?? 15,
        repeatOption: eventData.repeatOption ?? 'NONE',
        isCompleted: eventData.isCompleted ?? false,
        createdAt: eventData.createdAt ?? Date.now(),
        googleCalendarEventId: eventData.googleCalendarEventId,
        syncStatus: 'pending',
      };
      setEvents(prev => prev.map(ev => ev.id === saved.id ? saved : ev));
    } else {
      const now = Date.now();
      saved = {
        id: now,
        title: eventData.title ?? 'Ministry Arrangement',
        dateMillis: eventData.dateMillis ?? now,
        startTimeMillis: eventData.startTimeMillis ?? now,
        endTimeMillis: eventData.endTimeMillis ?? now + 2 * 3600 * 1000,
        location: eventData.location ?? '',
        description: eventData.description ?? '',
        reminderMinutesBefore: eventData.reminderMinutesBefore ?? 15,
        repeatOption: eventData.repeatOption ?? 'NONE',
        isCompleted: false,
        createdAt: now,
        syncStatus: 'pending',
      };
      setEvents(prev => [saved, ...prev]);
    }

    // Auto sync to Google Calendar if connected
    const token = googleServices.getStoredToken();
    if (token && settings.googleCalendarConnected && settings.autoCalendarSync) {
      try {
        if (saved.googleCalendarEventId) {
          await googleServices.updateCalendarEvent(token, saved.googleCalendarEventId, saved);
        } else {
          const gcalId = await googleServices.createCalendarEvent(token, saved);
          saved.googleCalendarEventId = gcalId;
        }
        saved.syncStatus = 'synced';
        saved.lastSyncedAt = Date.now();
        setEvents(prev => prev.map(ev => ev.id === saved.id ? saved : ev));
      } catch (err) {
        console.warn('Auto Google Calendar sync failed', err);
      }
    }

    return saved;
  }, [settings.googleCalendarConnected, settings.autoCalendarSync]);

  const deleteEvent = useCallback(async (id: number): Promise<void> => {
    const target = events.find(ev => ev.id === id);
    if (target?.googleCalendarEventId && settings.googleCalendarConnected) {
      const token = googleServices.getStoredToken();
      if (token) {
        try {
          await googleServices.deleteCalendarEvent(token, target.googleCalendarEventId);
        } catch (err) {
          console.warn('Failed to delete event from Google Calendar', err);
        }
      }
    }
    setEvents(prev => prev.filter(ev => ev.id !== id));
  }, [events, settings.googleCalendarConnected]);

  const toggleEventCompleted = useCallback((id: number) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, isCompleted: !ev.isCompleted } : ev));
  }, []);

  // Settings
  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const updatePublisherStatus = useCallback((status: PublisherStatusType, customGoal?: number) => {
    setSettings(prev => {
      const defaultGoal = PUBLISHER_STATUS_OPTIONS[status]?.defaultGoalHours || 0;
      return {
        ...prev,
        publisherStatus: status,
        customGoalHours: customGoal !== undefined ? customGoal : (status === 'CUSTOM' ? prev.customGoalHours : defaultGoal),
      };
    });
  }, []);

  const updateTheme = useCallback((themeMode: 'SYSTEM' | 'LIGHT' | 'DARK') => {
    setSettings(prev => ({ ...prev, themeMode }));
  }, []);

  // Timer controls
  const startTimer = useCallback((ministryType: MinistryTypeCategory = 'HOUSE_TO_HOUSE', location: string = '', notes: string = '') => {
    setTimer({
      isRunning: true,
      accumulatedSeconds: 0,
      startTimeMillis: Date.now(),
      lastPausedTimeMillis: 0,
      notes,
      ministryType,
      location,
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer(prev => {
      if (!prev.isRunning) return prev;
      const additional = Math.floor((Date.now() - prev.startTimeMillis) / 1000);
      return {
        ...prev,
        isRunning: false,
        accumulatedSeconds: prev.accumulatedSeconds + Math.max(0, additional),
        lastPausedTimeMillis: Date.now(),
      };
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setTimer(prev => {
      if (prev.isRunning) return prev;
      return {
        ...prev,
        isRunning: true,
        startTimeMillis: Date.now(),
      };
    });
  }, []);

  const updateTimerDraft = useCallback((updates: Partial<TimerState>) => {
    setTimer(prev => ({ ...prev, ...updates }));
  }, []);

  const stopAndSaveTimer = useCallback((): MinistryEntry | null => {
    let finalSeconds = timer.accumulatedSeconds;
    if (timer.isRunning) {
      finalSeconds += Math.floor((Date.now() - timer.startTimeMillis) / 1000);
    }
    const finalMinutes = Math.max(1, Math.round(finalSeconds / 60));
    
    const newEntry = saveEntry({
      dateMillis: Date.now(),
      startTimeMillis: Date.now() - finalSeconds * 1000,
      endTimeMillis: Date.now(),
      durationMinutes: finalMinutes,
      ministryType: timer.ministryType,
      location: timer.location,
      notes: timer.notes,
      returnVisits: 0,
      bibleStudies: 0,
      placements: 0,
    });

    setTimer(DEFAULT_TIMER);
    return newEntry;
  }, [timer, saveEntry]);

  const resetTimer = useCallback(() => {
    setTimer(DEFAULT_TIMER);
  }, []);

  // Google OAuth & Account Connection
  const connectGoogleAccount = useCallback(async (): Promise<{ success: boolean; email?: string; error?: string }> => {
    setIsAuthenticating(true);
    try {
      const { token, user } = await googleServices.requestAccessToken(settings.googleClientId);
      const userProfile: UserProfile = {
        uid: user.id || 'google_' + Date.now(),
        email: user.email,
        displayName: user.name,
        photoURL: user.picture,
      };
      setCurrentUser(userProfile);
      setSettings(prev => ({
        ...prev,
        googleCalendarConnected: true,
        googleDriveConnected: true,
        googleUserEmail: user.email,
        googleUserName: user.name,
        userEmail: user.email,
        userName: user.name,
        isGuest: false,
        isFirstLaunch: false,
      }));

      // Initial Calendar sync
      await googleServices.syncAllCalendarEvents(token, events);

      setIsAuthenticating(false);
      return { success: true, email: user.email };
    } catch (err: any) {
      setIsAuthenticating(false);
      return { success: false, error: err?.message || 'Failed to connect Google account' };
    }
  }, [settings.googleClientId, events]);

  const disconnectGoogleAccount = useCallback(() => {
    googleServices.clearStoredToken();
    setSettings(prev => ({
      ...prev,
      googleCalendarConnected: false,
      googleDriveConnected: false,
      googleUserEmail: null,
      googleUserName: null,
    }));
  }, []);

  const syncGoogleCalendar = useCallback(async (): Promise<{ success: boolean; count: number; message: string }> => {
    let token = googleServices.getStoredToken();
    if (!token) {
      const authResult = await connectGoogleAccount();
      if (!authResult.success) {
        return { success: false, count: 0, message: authResult.error || 'Authentication required' };
      }
      token = googleServices.getStoredToken();
    }

    if (!token) {
      return { success: false, count: 0, message: 'Google authentication required' };
    }

    setIsSyncing(true);
    try {
      const { updatedEvents, pushedCount } = await googleServices.syncAllCalendarEvents(token, events);
      setEvents(updatedEvents);
      setSettings(prev => ({
        ...prev,
        lastCalendarSync: Date.now(),
      }));
      setIsSyncing(false);
      return {
        success: true,
        count: pushedCount,
        message: `Successfully synchronized ${pushedCount} arrangements with Google Calendar`,
      };
    } catch (err: any) {
      setIsSyncing(false);
      return { success: false, count: 0, message: err?.message || 'Failed to sync calendar' };
    }
  }, [connectGoogleAccount, events]);

  const backupToGoogleDrive = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    let token = googleServices.getStoredToken();
    if (!token) {
      const authResult = await connectGoogleAccount();
      if (!authResult.success) {
        return { success: false, message: authResult.error || 'Google connection required' };
      }
      token = googleServices.getStoredToken();
    }

    if (!token) {
      return { success: false, message: 'Google authentication required' };
    }

    setIsSyncing(true);
    try {
      const json = storage.createBackupJson(entries, events, settings);
      const res = await googleServices.uploadBackupToDrive(token, json);
      setSettings(prev => ({
        ...prev,
        lastDriveBackup: Date.now(),
        lastBackupDate: Date.now(),
      }));
      setIsSyncing(false);
      return { success: true, message: `Backup saved to Google Drive (${new Date(res.modifiedTime).toLocaleTimeString()})` };
    } catch (err: any) {
      setIsSyncing(false);
      return { success: false, message: err?.message || 'Failed to upload backup to Drive' };
    }
  }, [connectGoogleAccount, entries, events, settings]);

  const restoreFromGoogleDrive = useCallback(async (fileId?: string): Promise<{ success: boolean; message: string }> => {
    let token = googleServices.getStoredToken();
    if (!token) {
      const authResult = await connectGoogleAccount();
      if (!authResult.success) {
        return { success: false, message: authResult.error || 'Google connection required' };
      }
      token = googleServices.getStoredToken();
    }

    if (!token) {
      return { success: false, message: 'Google authentication required' };
    }

    setIsSyncing(true);
    try {
      const backupData = await googleServices.downloadDriveBackup(token, fileId);
      if (!backupData || !Array.isArray(backupData.ministryEntries)) {
        setIsSyncing(false);
        return { success: false, message: 'Invalid or corrupted backup data file' };
      }

      setEntries(backupData.ministryEntries);
      if (Array.isArray(backupData.scheduledEvents)) {
        setEvents(backupData.scheduledEvents);
      }
      if (backupData.publisherStatus) {
        setSettings(prev => ({
          ...prev,
          publisherStatus: backupData.publisherStatus,
          customGoalHours: backupData.customGoalHours ?? prev.customGoalHours,
        }));
      }

      setIsSyncing(false);
      return {
        success: true,
        message: `Restored ${backupData.ministryEntries.length} ministry entries and ${backupData.scheduledEvents?.length || 0} scheduled events`,
      };
    } catch (err: any) {
      setIsSyncing(false);
      return { success: false, message: err?.message || 'Failed to restore from Drive' };
    }
  }, [connectGoogleAccount]);

  const listGoogleDriveBackups = useCallback(async (): Promise<GoogleDriveBackupItem[]> => {
    const token = googleServices.getStoredToken();
    if (!token) return [];
    try {
      return await googleServices.listDriveBackups(token);
    } catch {
      return [];
    }
  }, []);

  // Auth simulations
  const signInWithGoogle = useCallback((onSuccess?: () => void, onError?: (err: string) => void) => {
    connectGoogleAccount().then(res => {
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        if (onError) onError(res.error || 'Google sign in failed');
      }
    });
  }, [connectGoogleAccount]);

  const signInWithApple = useCallback((onSuccess?: () => void, _onError?: (err: string) => void) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      const user: UserProfile = {
        uid: 'user_apple_' + Date.now(),
        email: 'publisher@icloud.com',
        displayName: 'Apple Publisher',
      };
      setCurrentUser(user);
      setSettings(prev => ({
        ...prev,
        userEmail: user.email,
        userName: user.displayName,
        isGuest: false,
        isFirstLaunch: false,
      }));
      if (onSuccess) onSuccess();
    }, 800);
  }, []);

  const signOut = useCallback((onComplete?: () => void) => {
    disconnectGoogleAccount();
    setCurrentUser(null);
    setSettings(prev => ({
      ...prev,
      userEmail: null,
      userName: null,
      isGuest: true,
    }));
    if (onComplete) onComplete();
  }, [disconnectGoogleAccount]);

  const continueAsGuest = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      isGuest: true,
      isFirstLaunch: false,
    }));
  }, []);

  const syncWithCloud = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    if (settings.googleCalendarConnected) {
      await syncGoogleCalendar();
    }
    if (settings.googleDriveConnected) {
      await backupToGoogleDrive();
    }
    await new Promise(r => setTimeout(r, 600));
    setIsSyncing(false);
    setEntries(prev => prev.map(e => ({ ...e, isSynced: true })));
    return { success: true, message: 'Synchronized with Cloud & Google' };
  }, [settings.googleCalendarConnected, settings.googleDriveConnected, syncGoogleCalendar, backupToGoogleDrive]);

  const exportCsv = useCallback(() => {
    return storage.exportToCsv(entries);
  }, [entries]);

  const createBackup = useCallback(() => {
    const json = storage.createBackupJson(entries, events, settings);
    setSettings(prev => ({ ...prev, lastBackupDate: Date.now() }));
    return json;
  }, [entries, events, settings]);

  const restoreBackup = useCallback((json: string) => {
    const result = storage.restoreBackup(json);
    if (!result) return false;
    setEntries(result.entries);
    if (result.events) setEvents(result.events);
    if (result.publisherStatus) {
      setSettings(prev => ({
        ...prev,
        publisherStatus: result.publisherStatus!,
        customGoalHours: result.customGoalHours ?? prev.customGoalHours,
      }));
    }
    return true;
  }, []);

  const clearAllData = useCallback(() => {
    setEntries([]);
    setEvents([]);
    setTimer(DEFAULT_TIMER);
  }, []);

  // Dashboard Stats Computation
  const dashboardStats: DashboardStats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });

    const currentMonthEntries = entries.filter(e => {
      const d = new Date(e.dateMillis);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const monthlyMinutes = currentMonthEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const monthlyReturnVisits = currentMonthEntries.reduce((sum, e) => sum + e.returnVisits, 0);
    const monthlyBibleStudies = currentMonthEntries.reduce((sum, e) => sum + e.bibleStudies, 0);
    const monthlyPlacements = currentMonthEntries.reduce((sum, e) => sum + e.placements, 0);

    const goalHours = settings.publisherStatus === 'CUSTOM'
      ? settings.customGoalHours
      : PUBLISHER_STATUS_OPTIONS[settings.publisherStatus]?.defaultGoalHours || 0;

    const goalProgressPercentage = goalHours > 0 ? Math.min(1.0, (monthlyMinutes / 60) / goalHours) : 0;

    // Calculate streak
    let streak = 0;
    let checkDate = new Date(currentYear, currentMonth, 1);
    for (let i = 0; i < 24; i++) {
      const y = checkDate.getFullYear();
      const m = checkDate.getMonth();
      const hasActivity = entries.some(e => {
        const d = new Date(e.dateMillis);
        return d.getFullYear() === y && d.getMonth() === m && e.durationMinutes > 0;
      });
      if (hasActivity) {
        streak++;
        checkDate.setMonth(checkDate.getMonth() - 1);
      } else {
        if (i === 0) {
          checkDate.setMonth(checkDate.getMonth() - 1);
          continue;
        }
        break;
      }
    }

    const upcomingEvents = events.filter(ev => !ev.isCompleted && ev.dateMillis >= Date.now() - 24 * 3600 * 1000);

    return {
      monthlyMinutes,
      monthlyReturnVisits,
      monthlyBibleStudies,
      monthlyPlacements,
      goalHours,
      goalProgressPercentage,
      streakMonths: Math.max(1, streak),
      recentEntriesCount: entries.length,
      upcomingEventsCount: upcomingEvents.length,
      monthName,
    };
  }, [entries, events, settings]);

  // Reports Breakdown computation
  const getReportsForPeriod = useCallback((periodIndex: number): ReportsData => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let filtered: MinistryEntry[] = [];
    if (periodIndex === 0) {
      filtered = entries.filter(e => {
        const d = new Date(e.dateMillis);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    } else if (periodIndex === 1) {
      const startServiceYear = currentMonth >= 8 ? currentYear : currentYear - 1;
      const startServiceTime = new Date(startServiceYear, 8, 1).getTime();
      const endServiceTime = new Date(startServiceYear + 1, 7, 31, 23, 59, 59).getTime();

      filtered = entries.filter(e => e.dateMillis >= startServiceTime && e.dateMillis <= endServiceTime);
      if (filtered.length === 0) {
        filtered = entries.filter(e => new Date(e.dateMillis).getFullYear() === currentYear);
      }
    } else {
      filtered = entries;
    }

    const totalMinutes = filtered.reduce((sum, e) => sum + e.durationMinutes, 0);
    const totalReturnVisits = filtered.reduce((sum, e) => sum + e.returnVisits, 0);
    const totalBibleStudies = filtered.reduce((sum, e) => sum + e.bibleStudies, 0);
    const totalPlacements = filtered.reduce((sum, e) => sum + e.placements, 0);
    const activeDays = new Set(filtered.map(e => new Date(e.dateMillis).toDateString())).size;

    const monthlyHoursBreakdown: Array<{ label: string; value: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(currentYear, currentMonth - i, 1);
      const y = targetMonth.getFullYear();
      const m = targetMonth.getMonth();
      const label = targetMonth.toLocaleDateString('en-US', { month: 'short' });
      const monthMins = entries
        .filter(e => {
          const d = new Date(e.dateMillis);
          return d.getFullYear() === y && d.getMonth() === m;
        })
        .reduce((sum, e) => sum + e.durationMinutes, 0);
      monthlyHoursBreakdown.push({ label, value: parseFloat((monthMins / 60).toFixed(1)) });
    }

    const weeklyHoursBreakdown: Array<{ label: string; value: number }> = [
      { label: 'W1 (1-7)', value: 0 },
      { label: 'W2 (8-14)', value: 0 },
      { label: 'W3 (15-21)', value: 0 },
      { label: 'W4 (22-28)', value: 0 },
      { label: 'W5 (29+)', value: 0 },
    ];

    const currentMonthEntries = entries.filter(e => {
      const d = new Date(e.dateMillis);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    currentMonthEntries.forEach(e => {
      const day = new Date(e.dateMillis).getDate();
      const hrs = e.durationMinutes / 60;
      if (day <= 7) weeklyHoursBreakdown[0].value += hrs;
      else if (day <= 14) weeklyHoursBreakdown[1].value += hrs;
      else if (day <= 21) weeklyHoursBreakdown[2].value += hrs;
      else if (day <= 28) weeklyHoursBreakdown[3].value += hrs;
      else weeklyHoursBreakdown[4].value += hrs;
    });

    weeklyHoursBreakdown.forEach(w => {
      w.value = parseFloat(w.value.toFixed(1));
    });

    return {
      totalMinutes,
      totalReturnVisits,
      totalBibleStudies,
      totalPlacements,
      activeDays,
      streakMonths: dashboardStats.streakMonths,
      monthlyHoursBreakdown,
      weeklyHoursBreakdown,
    };
  }, [entries, dashboardStats.streakMonths]);

  const value = {
    entries,
    events,
    settings,
    timer,
    currentUser,
    isSyncing,
    isAuthenticating,
    dashboardStats,
    saveEntry,
    deleteEntry,
    saveEvent,
    deleteEvent,
    toggleEventCompleted,
    updateSettings,
    updatePublisherStatus,
    updateTheme,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    resetTimer,
    updateTimerDraft,
    currentTimerElapsedSeconds,
    signInWithGoogle,
    signInWithApple,
    signOut,
    continueAsGuest,
    syncWithCloud,
    connectGoogleAccount,
    disconnectGoogleAccount,
    syncGoogleCalendar,
    backupToGoogleDrive,
    restoreFromGoogleDrive,
    listGoogleDriveBackups,
    exportCsv,
    createBackup,
    restoreBackup,
    clearAllData,
    getReportsForPeriod,
  };

  return (
    <MinistryContext.Provider value={value}>
      {children}
    </MinistryContext.Provider>
  );
};

export const useMinistry = (): MinistryContextType => {
  const context = useContext(MinistryContext);
  if (!context) {
    throw new Error('useMinistry must be used within a MinistryProvider');
  }
  return context;
};

