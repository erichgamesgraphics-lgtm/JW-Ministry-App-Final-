import {
  MinistryEntry,
  ScheduledEvent,
  UserSettings,
  TimerState,
  PublisherStatusType,
  PUBLISHER_STATUS_OPTIONS
} from '../types.ts';

const ENTRIES_KEY = 'ministry_tracker_entries_v1';
const EVENTS_KEY = 'ministry_tracker_events_v1';
const SETTINGS_KEY = 'ministry_tracker_settings_v1';
const TIMER_KEY = 'ministry_tracker_timer_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  publisherStatus: 'PUBLISHER',
  customGoalHours: 50,
  dailyReminderEnabled: false,
  dailyReminderHour: 20,
  dailyReminderMinute: 0,
  themeMode: 'SYSTEM',
  notificationsEnabled: true,
  isFirstLaunch: true,
  userEmail: null,
  userName: null,
  isGuest: true,
  lastBackupDate: 0,
  googleCalendarConnected: false,
  googleDriveConnected: false,
  googleUserEmail: null,
  googleUserName: null,
  googleClientId: '',
  lastCalendarSync: 0,
  lastDriveBackup: 0,
  autoCalendarSync: true,
  autoDriveBackup: false,
};

export const DEFAULT_TIMER: TimerState = {
  isRunning: false,
  accumulatedSeconds: 0,
  startTimeMillis: 0,
  lastPausedTimeMillis: 0,
  notes: '',
  ministryType: 'HOUSE_TO_HOUSE',
  location: '',
};

// Seed sample data for an engaging first-time experience if empty
export const SAMPLE_ENTRIES: MinistryEntry[] = [
  {
    id: 1,
    dateMillis: Date.now() - 1 * 24 * 60 * 60 * 1000,
    startTimeMillis: Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000,
    endTimeMillis: Date.now() - 1 * 24 * 60 * 60 * 1000,
    durationMinutes: 120,
    ministryType: 'HOUSE_TO_HOUSE',
    returnVisits: 3,
    bibleStudies: 1,
    placements: 2,
    location: 'Maple Ridge Neighborhood',
    notes: 'Met Mr. Davis on Elm St, placed "Enjoy Life Forever!" brochure. Great discussion on Psalm 37.',
    isSynced: false,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: 2,
    dateMillis: Date.now() - 3 * 24 * 60 * 60 * 1000,
    startTimeMillis: Date.now() - 3 * 24 * 60 * 60 * 1000 - 90 * 60 * 1000,
    endTimeMillis: Date.now() - 3 * 24 * 60 * 60 * 1000,
    durationMinutes: 90,
    ministryType: 'CART_WITNESSING',
    returnVisits: 1,
    bibleStudies: 0,
    placements: 4,
    location: 'Metro Plaza Transit Station',
    notes: 'Busy morning shift with Sister Maria. Shared video link with university student.',
    isSynced: false,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 3,
    dateMillis: Date.now() - 5 * 24 * 60 * 60 * 1000,
    startTimeMillis: Date.now() - 5 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000,
    endTimeMillis: Date.now() - 5 * 24 * 60 * 60 * 1000,
    durationMinutes: 60,
    ministryType: 'INFORMAL_WITNESSING',
    returnVisits: 0,
    bibleStudies: 1,
    placements: 0,
    location: 'Library Study Room',
    notes: 'Study with John - covered Lesson 4 of Enjoy Life Forever book. Good progress.',
    isSynced: false,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  }
];

export const SAMPLE_EVENTS: ScheduledEvent[] = [
  {
    id: 1,
    title: 'Saturday Morning Group Witnessing',
    dateMillis: Date.now() + 2 * 24 * 60 * 60 * 1000,
    startTimeMillis: Date.now() + 2 * 24 * 60 * 60 * 1000,
    endTimeMillis: Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
    location: 'Kingdom Hall Parking Lot',
    description: 'Field service group arrangement for territory 14. Bring current magazine campaign.',
    reminderMinutesBefore: 30,
    repeatOption: 'WEEKLY',
    isCompleted: false,
    createdAt: Date.now(),
  },
  {
    id: 2,
    title: 'Return Visit with Sarah',
    dateMillis: Date.now() + 4 * 24 * 60 * 60 * 1000,
    startTimeMillis: Date.now() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
    endTimeMillis: Date.now() + 4 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000,
    location: 'Oak Street Coffee Shop',
    description: 'Discuss the question left last week: Why does God permit suffering?',
    reminderMinutesBefore: 15,
    repeatOption: 'NONE',
    isCompleted: false,
    createdAt: Date.now(),
  }
];

export const storage = {
  getEntries(): MinistryEntry[] {
    try {
      const data = localStorage.getItem(ENTRIES_KEY);
      if (!data) {
        // Initialize with sample entries
        localStorage.setItem(ENTRIES_KEY, JSON.stringify(SAMPLE_ENTRIES));
        return SAMPLE_ENTRIES;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_ENTRIES;
    }
  },

  saveEntries(entries: MinistryEntry[]): void {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  },

  getEvents(): ScheduledEvent[] {
    try {
      const data = localStorage.getItem(EVENTS_KEY);
      if (!data) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(SAMPLE_EVENTS));
        return SAMPLE_EVENTS;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_EVENTS;
    }
  },

  saveEvents(events: ScheduledEvent[]): void {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getTimer(): TimerState {
    try {
      const data = localStorage.getItem(TIMER_KEY);
      if (!data) return DEFAULT_TIMER;
      return { ...DEFAULT_TIMER, ...JSON.parse(data) };
    } catch {
      return DEFAULT_TIMER;
    }
  },

  saveTimer(timer: TimerState): void {
    localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
  },

  exportToCsv(entries: MinistryEntry[]): string {
    const headers = ['Date', 'Ministry Type', 'Duration', 'Minutes', 'Return Visits', 'Bible Studies', 'Placements', 'Location', 'Notes'];
    const rows = entries.map(e => {
      const dateStr = new Date(e.dateMillis).toISOString().split('T')[0];
      const h = Math.floor(e.durationMinutes / 60);
      const m = e.durationMinutes % 60;
      const durationStr = `${h}h ${m}m`;
      const sanitizedLocation = (e.location || '').replace(/"/g, '""');
      const sanitizedNotes = (e.notes || '').replace(/"/g, '""');
      return [
        `"${dateStr}"`,
        `"${e.ministryType}"`,
        `"${durationStr}"`,
        e.durationMinutes,
        e.returnVisits,
        e.bibleStudies,
        e.placements,
        `"${sanitizedLocation}"`,
        `"${sanitizedNotes}"`
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  },

  generateReportSummary(entries: MinistryEntry[], settings: UserSettings, year: number, month: number): string {
    const monthDate = new Date(year, month, 1);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const monthlyEntries = entries.filter(e => {
      const d = new Date(e.dateMillis);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const totalMinutes = monthlyEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const decimalHours = (totalMinutes / 60).toFixed(1);
    const totalRV = monthlyEntries.reduce((sum, e) => sum + e.returnVisits, 0);
    const totalBS = monthlyEntries.reduce((sum, e) => sum + e.bibleStudies, 0);
    const totalPlacements = monthlyEntries.reduce((sum, e) => sum + e.placements, 0);
    const activeDays = new Set(monthlyEntries.map(e => new Date(e.dateMillis).getDate())).size;

    const statusTitle = PUBLISHER_STATUS_OPTIONS[settings.publisherStatus]?.displayName || 'Publisher';

    const activityLines = monthlyEntries.map(entry => {
      const d = new Date(entry.dateMillis);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const h = Math.floor(entry.durationMinutes / 60);
      const m = entry.durationMinutes % 60;
      return `• ${dateStr} | ${h}h ${m}m | ${entry.ministryType} | RV: ${entry.returnVisits}, BS: ${entry.bibleStudies}, Placements: ${entry.placements}`;
    }).join('\n');

    return `========================================
   JEHOVAH'S WITNESSES MINISTRY REPORT
========================================
Month: ${monthName}
Publisher Status: ${statusTitle}

SUMMARY STATISTICS
----------------------------------------
Total Hours:      ${totalHours}h ${remainingMinutes}m (${decimalHours} hrs)
Active Days:      ${activeDays}
Return Visits:    ${totalRV}
Bible Studies:    ${totalBS}
Placements:       ${totalPlacements}

ACTIVITY DETAILS
----------------------------------------
${activityLines || 'No activity recorded for this period.'}
========================================
Generated by JW Ministry App`;
  },

  createBackupJson(entries: MinistryEntry[], events: ScheduledEvent[], settings: UserSettings): string {
    const backupObj = {
      version: 1,
      appVersion: '2.0.0',
      createdAt: new Date().toISOString(),
      createdAtMillis: Date.now(),
      publisherStatus: settings.publisherStatus,
      customGoalHours: settings.customGoalHours,
      ministryEntries: entries,
      scheduledEvents: events,
      settings: {
        publisherStatus: settings.publisherStatus,
        customGoalHours: settings.customGoalHours,
        dailyReminderEnabled: settings.dailyReminderEnabled,
        dailyReminderHour: settings.dailyReminderHour,
        dailyReminderMinute: settings.dailyReminderMinute,
        themeMode: settings.themeMode,
        notificationsEnabled: settings.notificationsEnabled,
      }
    };
    return JSON.stringify(backupObj, null, 2);
  },

  restoreBackup(jsonString: string): { entries: MinistryEntry[]; events: ScheduledEvent[]; publisherStatus?: PublisherStatusType; customGoalHours?: number; settings?: Partial<UserSettings> } | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed) return null;

      // Check format
      const rawEntries = parsed.ministryEntries || parsed.entries || parsed.ministryRecords;
      if (!Array.isArray(rawEntries)) {
        return null;
      }

      const rawEvents = parsed.scheduledEvents || parsed.events || [];
      const publisherStatus = parsed.publisherStatus || parsed.settings?.publisherStatus;
      const customGoalHours = parsed.customGoalHours || parsed.settings?.customGoalHours;

      return {
        entries: rawEntries,
        events: Array.isArray(rawEvents) ? rawEvents : [],
        publisherStatus,
        customGoalHours,
        settings: parsed.settings,
      };
    } catch {
      return null;
    }
  }
};
