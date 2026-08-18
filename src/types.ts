export type PublisherStatusType =
  | 'PUBLISHER'
  | 'AUXILIARY_PIONEER_15'
  | 'AUXILIARY_PIONEER_30'
  | 'REGULAR_PIONEER_50'
  | 'SPECIAL_PIONEER_100'
  | 'CUSTOM';

export interface PublisherStatusInfo {
  id: PublisherStatusType;
  displayName: string;
  defaultGoalHours: number;
  description: string;
}

export const PUBLISHER_STATUS_OPTIONS: Record<PublisherStatusType, PublisherStatusInfo> = {
  PUBLISHER: {
    id: 'PUBLISHER',
    displayName: 'Publisher',
    defaultGoalHours: 0,
    description: 'Track regular monthly activity without a fixed goal',
  },
  AUXILIARY_PIONEER_15: {
    id: 'AUXILIARY_PIONEER_15',
    displayName: 'Auxiliary Pioneer (15h)',
    defaultGoalHours: 15,
    description: 'Goal: 15 hours per month',
  },
  AUXILIARY_PIONEER_30: {
    id: 'AUXILIARY_PIONEER_30',
    displayName: 'Auxiliary Pioneer (30h)',
    defaultGoalHours: 30,
    description: 'Goal: 30 hours per month',
  },
  REGULAR_PIONEER_50: {
    id: 'REGULAR_PIONEER_50',
    displayName: 'Regular Pioneer (50h)',
    defaultGoalHours: 50,
    description: 'Goal: 50 hours per month',
  },
  SPECIAL_PIONEER_100: {
    id: 'SPECIAL_PIONEER_100',
    displayName: 'Special Pioneer (100h)',
    defaultGoalHours: 100,
    description: 'Goal: 100 hours per month',
  },
  CUSTOM: {
    id: 'CUSTOM',
    displayName: 'Custom Goal',
    defaultGoalHours: 50,
    description: 'Custom monthly hour goal',
  },
};

export type MinistryTypeCategory =
  | 'HOUSE_TO_HOUSE'
  | 'PUBLIC_WITNESSING'
  | 'INFORMAL_WITNESSING'
  | 'TELEPHONE_WITNESSING'
  | 'LETTER_WRITING'
  | 'CART_WITNESSING'
  | 'OTHER';

export interface MinistryTypeInfo {
  id: MinistryTypeCategory;
  displayName: string;
  iconName: string;
}

export const MINISTRY_TYPE_OPTIONS: Record<MinistryTypeCategory, MinistryTypeInfo> = {
  HOUSE_TO_HOUSE: { id: 'HOUSE_TO_HOUSE', displayName: 'House-to-house', iconName: 'Home' },
  PUBLIC_WITNESSING: { id: 'PUBLIC_WITNESSING', displayName: 'Public witnessing', iconName: 'Globe' },
  INFORMAL_WITNESSING: { id: 'INFORMAL_WITNESSING', displayName: 'Informal witnessing', iconName: 'Coffee' },
  TELEPHONE_WITNESSING: { id: 'TELEPHONE_WITNESSING', displayName: 'Telephone witnessing', iconName: 'Phone' },
  LETTER_WRITING: { id: 'LETTER_WRITING', displayName: 'Letter writing', iconName: 'Mail' },
  CART_WITNESSING: { id: 'CART_WITNESSING', displayName: 'Cart witnessing', iconName: 'ShoppingBag' },
  OTHER: { id: 'OTHER', displayName: 'Other', iconName: 'Compass' },
};

export type ReminderOptionType =
  | 'NONE'
  | 'AT_TIME'
  | 'MINUTES_15'
  | 'MINUTES_30'
  | 'HOUR_1'
  | 'DAY_1';

export interface ReminderOptionInfo {
  id: ReminderOptionType;
  displayName: string;
  minutesBefore: number;
}

export const REMINDER_OPTIONS: Record<ReminderOptionType, ReminderOptionInfo> = {
  NONE: { id: 'NONE', displayName: 'No Reminder', minutesBefore: -1 },
  AT_TIME: { id: 'AT_TIME', displayName: 'At time of event', minutesBefore: 0 },
  MINUTES_15: { id: 'MINUTES_15', displayName: '15 minutes before', minutesBefore: 15 },
  MINUTES_30: { id: 'MINUTES_30', displayName: '30 minutes before', minutesBefore: 30 },
  HOUR_1: { id: 'HOUR_1', displayName: '1 hour before', minutesBefore: 60 },
  DAY_1: { id: 'DAY_1', displayName: '1 day before', minutesBefore: 1440 },
};

export type RepeatOptionType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface RepeatOptionInfo {
  id: RepeatOptionType;
  displayName: string;
}

export const REPEAT_OPTIONS: Record<RepeatOptionType, RepeatOptionInfo> = {
  NONE: { id: 'NONE', displayName: 'Does not repeat' },
  DAILY: { id: 'DAILY', displayName: 'Every day' },
  WEEKLY: { id: 'WEEKLY', displayName: 'Every week' },
  MONTHLY: { id: 'MONTHLY', displayName: 'Every month' },
};

export interface MinistryEntry {
  id: number;
  dateMillis: number;
  startTimeMillis: number;
  endTimeMillis: number;
  durationMinutes: number;
  ministryType: MinistryTypeCategory;
  returnVisits: number;
  bibleStudies: number;
  placements: number;
  location: string;
  notes: string;
  isSynced: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ScheduledEvent {
  id: number;
  title: string;
  dateMillis: number;
  startTimeMillis: number;
  endTimeMillis: number;
  location: string;
  description: string;
  reminderMinutesBefore: number;
  repeatOption: RepeatOptionType;
  isCompleted: boolean;
  createdAt: number;
  googleCalendarEventId?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  lastSyncedAt?: number;
}

export interface UserSettings {
  publisherStatus: PublisherStatusType;
  customGoalHours: number;
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  themeMode: 'SYSTEM' | 'LIGHT' | 'DARK';
  notificationsEnabled: boolean;
  isFirstLaunch: boolean;
  userEmail: string | null;
  userName: string | null;
  isGuest: boolean;
  lastBackupDate: number;
  // Google Services Integration
  googleCalendarConnected: boolean;
  googleDriveConnected: boolean;
  googleUserEmail: string | null;
  googleUserName: string | null;
  googleClientId?: string;
  lastCalendarSync: number;
  lastDriveBackup: number;
  autoCalendarSync: boolean;
  autoDriveBackup: boolean;
}

export interface GoogleDriveBackupItem {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  size?: number;
  version?: number;
  entriesCount?: number;
  eventsCount?: number;
}

export interface BackupPayload {
  version: number;
  appVersion: string;
  createdAt: string;
  createdAtMillis: number;
  publisherStatus: PublisherStatusType;
  customGoalHours: number;
  ministryEntries: MinistryEntry[];
  scheduledEvents: ScheduledEvent[];
  settings?: Partial<UserSettings>;
}

export interface TimerState {
  isRunning: boolean;
  accumulatedSeconds: number;
  startTimeMillis: number;
  lastPausedTimeMillis: number;
  notes: string;
  ministryType: MinistryTypeCategory;
  location: string;
}

export interface DailyScripture {
  text: string;
  reference: string;
  theme: string;
}

export interface DashboardStats {
  monthlyMinutes: number;
  monthlyReturnVisits: number;
  monthlyBibleStudies: number;
  monthlyPlacements: number;
  goalHours: number;
  goalProgressPercentage: number;
  streakMonths: number;
  recentEntriesCount: number;
  upcomingEventsCount: number;
  monthName: string;
}

export interface ReportsData {
  totalMinutes: number;
  totalReturnVisits: number;
  totalBibleStudies: number;
  totalPlacements: number;
  activeDays: number;
  streakMonths: number;
  monthlyHoursBreakdown: Array<{ label: string; value: number }>;
  weeklyHoursBreakdown: Array<{ label: string; value: number }>;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
