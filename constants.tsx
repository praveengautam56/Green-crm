import { Lead, Admin, MessageTemplate, Trigger, LandingPage, Meeting, LeadStatus, ThankYouPage } from './types';
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
    { id: 'TPL002', name: 'Meeting Link', content: 'Hi {{name}}, here is the link for our upcoming meeting: [Your Meeting Link Here]. Looking forward to speaking with you!', lastUpdated: '2024-07-25' },
];

export const MOCK_TRIGGERS: Trigger[] = [
    { id: 'TRG001', name: 'New Lead Welcome', type: 'new-lead', enabled: true, templateId: 'TPL001' },
];


export const MOCK_THANK_YOU_PAGES: ThankYouPage[] = [
    { id: 'TY001', name: 'Standard Thank You', path: '/thank-you-winter' },
    { id: 'TY002', name: 'Ebook Download Thank You', path: '/thank-you-ebook' },
];

export const MOCK_LANDING_PAGES: LandingPage[] = [
    { id: 'LP001', name: 'Shared opt-in', thankYouPageId: 'TY001', createdDate: '2023-10-15', leadsCount: 120 },
    { id: 'LP002', name: 'Facebook opt-in', thankYouPageId: 'TY002', createdDate: '2023-09-02', leadsCount: 450 },
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
export const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;