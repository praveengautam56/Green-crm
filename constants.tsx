import { Lead, Admin, MessageTemplate, Trigger, LandingPage, Meeting, FlowStep, LeadStatus } from './types';
import { BarChart, LineChart, PieChart } from 'recharts';

export const ADMIN_USER: Admin = {
  name: 'Admin',
  email: 'alex.j@geminicrm.com',
  avatarUrl: 'https://picsum.photos/100',
  role: 'Administrator',
};

// Fix: Changed 'id' from number to string to match the Lead type definition.
export const MOCK_LEADS: Lead[] = [];

export const MOCK_STATUSES: LeadStatus[] = [
    { name: 'New', color: 'sky' },
    { name: 'Meeting', color: 'indigo' },
    { name: 'Qualified', color: 'green' },
    { name: 'Junk', color: 'slate' },
];


export const MOCK_TEMPLATES: MessageTemplate[] = [
    { id: 'TPL001', name: 'Welcome Message', content: 'Hi {{name}}, welcome! Thanks for signing up.', lastUpdated: '2023-10-20' },
    { id: 'TPL002', name: 'Follow-up Reminder', content: 'Hi {{name}}, just a reminder about our meeting tomorrow.', lastUpdated: '2023-10-22' },
];

export const MOCK_TRIGGERS: Trigger[] = [
    { id: 'TRG001', name: 'New Lead Welcome', type: 'new-lead', enabled: true, templateId: 'TPL001' },
    { id: 'TRG002', name: 'Meeting Reminder (24h)', type: 'meeting-reminder', enabled: false, templateId: 'TPL002', config: { minutesBefore: 1440 } },
];


// Fix: Changed 'id' from number to string to match the FlowStep type definition.
export const MOCK_FLOW: FlowStep[] = [
    { id: '1', incomingMsg: 'Hi', responseMsg: 'Hello! Welcome to our service. How can I help you today?', delayMinutes: 0 },
    { id: '2', incomingMsg: 'interested', responseMsg: 'Great! To get started, could you please tell me a bit more about what you are looking for?', delayMinutes: 2 },
    { id: '3', incomingMsg: 'price', responseMsg: 'We have several plans available. I can send you a link to our pricing page.', delayMinutes: 1 },
];


export const MOCK_LANDING_PAGES: LandingPage[] = [
    { id: 'LP001', name: 'Winter Offer Campaign', redirectUrl: '/thank-you-winter', createdDate: '2023-10-15', leadsCount: 120 },
    { id: 'LP002', name: 'Ebook Download', redirectUrl: '/thank-you-ebook', createdDate: '2023-09-02', leadsCount: 450 },
];

// Fix: Changed 'id' from number to string to match the Meeting type definition.
export const MOCK_MEETINGS: Meeting[] = [
    { id: '1', title: 'Discovery Call with Priya Sharma', attendee: 'Priya Sharma', startTime: new Date(new Date().setDate(new Date().getDate() + 1)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).getTime() + 30 * 60000) },
    { id: '2', title: 'Project Kickoff', attendee: 'Rajesh Kumar', startTime: new Date(new Date().setDate(new Date().getDate() + 2)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).getTime() + 60 * 60000) },
    { id: '3', title: 'Follow-up with Sunita Rao', attendee: 'Sunita Rao', startTime: new Date(new Date().setDate(new Date().getDate() - 2)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).getTime() + 45 * 60000) },
    { id: '4', title: 'Strategy Session', attendee: 'Amit Singh', startTime: new Date(new Date().setDate(new Date().getDate() - 5)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).getTime() + 60 * 60000) },
];


export const ANALYTICS_DATA = {
    leadsByStatus: [
        { name: 'New', value: 400 },
        { name: 'Contacted', value: 300 },
        { name: 'Qualified', value: 200 },
        { name: 'Lost', value: 100 },
    ],
    last7DaysLeads: [
        { name: 'Day -6', leads: 12 },
        { name: 'Day -5', leads: 19 },
        { name: 'Day -4', leads: 15 },
        { name: 'Day -3', leads: 25 },
        { name: 'Day -2', leads: 22 },
        { name: 'Yesterday', leads: 30 },
        { name: 'Today', leads: 18 },
    ],
};

export const SYSTEM_RESOURCES = {
    cpu: 45,
    memory: 68,
    storage: 82,
    apiUsage: 30,
};

// Icons
export const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>;
export const LeadsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
export const ApiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
export const LandingPageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
export const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
export const CallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
export const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
export const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
export const MessageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
export const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
export const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;