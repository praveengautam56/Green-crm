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


export interface FlowStep {
  id: string;
  incomingMsg: string;
  responseMsg: string;
  delayMinutes: number;
}

export interface LandingPage {
    id: string;
    name: string;
    redirectUrl: string;
    createdDate: string;
    leadsCount: number;
}

export interface Meeting {
    id: string;
    title: string;
    attendee: string;
    startTime: Date;
    endTime: Date;
}

export interface GreenApiConfig {
  instanceId: string;
  apiKey: string;
  webhookUrl?: string;
}

export enum Page {
    Dashboard = 'Dashboard',
    GreenApi = 'Green API',
    LandingPages = 'Landing Pages',
    Leads = 'Leads',
    Calendar = 'Meeting Calendar',
}