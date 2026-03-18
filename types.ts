export interface Lead {
  id: string;
  name: string;
  mobile: string;
  profession: string;
  city: string;
  state: string;
  status: string; // Changed from union type to string to allow custom statuses
  dateAdded: string;
}

export interface LeadStatus {
    name: string;
    color: 'sky' | 'blue' | 'green' | 'red' | 'amber' | 'indigo' | 'slate';
}

export interface Admin {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  lastUpdated: string;
}

export type TriggerType = 'new-lead' | 'scheduled' | 'meeting-reminder';

export interface Trigger {
  id: string;
  name: string;
  enabled: boolean;
  type: TriggerType;
  templateId: string;
  config?: {
    dateTime?: string;      // For 'scheduled'
    leadId?: string;        // For 'scheduled'
    minutesBefore?: number; // For 'meeting-reminder'
  };
}


export interface ThankYouPage {
  id: string;
  name: string;
  path: string;
}

export interface LandingPage {
    id: string;
    name: string;
    thankYouPageId: string;
    createdDate: string;
    leadsCount: number;
}

export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'dropdown';

export interface BookingQuestion {
    id: string;
    label: string;
    type: QuestionType;
    required: boolean;
    options?: string[];
}

export interface Meeting {
    id:string;
    title: string;
    attendee: string;
    startTime: Date;
    endTime: Date;
    mobile?: string;
    bookingAnswers?: Record<string, string | string[]>;
}

export interface DayAvailability {
    enabled: boolean;
    startTime: string;
    endTime: string;
}

export interface AvailabilitySettings {
    schedule: {
        [day: string]: DayAvailability;
    };
    duration: number;
    buffer: number;
    bookingWindowDays?: number;
    minBookingNoticeHours?: number;
    bookingQuestions?: BookingQuestion[];
}


export interface GreenApiConfig {
  instanceId: string;
  apiKey: string;
}

export enum Page {
    Dashboard = 'Dashboard',
    GreenApi = 'Green API',
    LandingPages = 'Landing Pages',
    Leads = 'Leads',
    Calendar = 'Meeting Calendar',
}