import { auth, db } from '../firebase';
// Fix: Switched to Firebase v8 compatibility syntax to resolve import errors.
// Fix: Use firebase/compat/* for v8 compatibility to get types and methods.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { ADMIN_USER, MOCK_LEADS, MOCK_TEMPLATES, MOCK_TRIGGERS, MOCK_LANDING_PAGES, MOCK_MEETINGS, MOCK_STATUSES, MOCK_THANK_YOU_PAGES } from '../constants';
import { Lead, MessageTemplate, Trigger, Meeting, Admin, LeadStatus, GreenApiConfig, LandingPage, ThankYouPage, AvailabilitySettings, DayAvailability, BookingQuestion } from '../types';

// --- Utility Functions ---

const firebaseArray = <T,>(firebaseObject: Record<string, T> | undefined): T[] => {
    if (!firebaseObject) return [];
    return Object.entries(firebaseObject).map(([id, value]) => ({ ...value, id }));
};

const arrayToObject = <T extends { id: string }>(arr: T[]) => {
    return arr.reduce((acc, item) => {
        const { id, ...data } = item;
        // Firebase fails if any value is undefined. This defensively removes such properties.
        Object.keys(data).forEach(key => {
            if ((data as any)[key] === undefined) {
                delete (data as any)[key];
            }
        });
        acc[id] = data;
        return acc;
    }, {} as Record<string, Omit<T, 'id'>>);
};


// Fix: Switched to Firebase v8 syntax.
const getRef = (userId: string, path: string) => db.ref(`users/${userId}/${path}`);

// --- Auth Service ---

// Fix: Switched to Firebase v8 compatibility syntax for User type.
// Fix: Use firebase/compat/* for v8 compatibility to get the User type.
const onAuthStateChangedListener = (callback: (user: firebase.User | null) => void): firebase.Unsubscribe => {
    return auth.onAuthStateChanged(callback);
};

// Fix: Switched to Firebase v8 syntax.
const signInWithEmail = (email: string, password: string): Promise<firebase.auth.UserCredential> => {
    return auth.signInWithEmailAndPassword(email, password);
};

const seedInitialData = (userId: string, name: string, email: string) => {
    const meetingsWithISOStrings = MOCK_MEETINGS.map(m => ({
        ...m,
        startTime: m.startTime.toISOString(),
        endTime: m.endTime.toISOString(),
    }));

    const defaultSchedule: { [day: string]: DayAvailability } = {
        'Sunday': { enabled: false, startTime: '09:00', endTime: '17:00' },
        'Monday': { enabled: true, startTime: '09:00', endTime: '17:00' },
        'Tuesday': { enabled: true, startTime: '09:00', endTime: '17:00' },
        'Wednesday': { enabled: true, startTime: '09:00', endTime: '17:00' },
        'Thursday': { enabled: true, startTime: '09:00', endTime: '17:00' },
        'Friday': { enabled: true, startTime: '09:00', endTime: '17:00' },
        'Saturday': { enabled: false, startTime: '09:00', endTime: '17:00' },
    };

    const defaultBookingQuestions: BookingQuestion[] = [
        {
            id: 'clientName',
            label: 'Full Name',
            type: 'text',
            required: true,
        },
        {
            id: 'q1',
            label: 'Please share anything that will help prepare for our meeting.',
            type: 'textarea',
            required: false,
        }
    ];

    const defaultAvailability: AvailabilitySettings = {
        schedule: defaultSchedule,
        duration: 30,
        buffer: 15,
        bookingWindowDays: 30,
        minBookingNoticeHours: 4,
        bookingQuestions: defaultBookingQuestions,
    };

   const initialData = {
        leads: arrayToObject(MOCK_LEADS),
        templates: arrayToObject(MOCK_TEMPLATES),
        triggers: arrayToObject(MOCK_TRIGGERS),
        landingPages: arrayToObject(MOCK_LANDING_PAGES),
        thankYouPages: arrayToObject(MOCK_THANK_YOU_PAGES),
        meetings: arrayToObject(meetingsWithISOStrings),
        leadStatuses: MOCK_STATUSES,
        adminUser: { ...ADMIN_USER, name, email, avatarUrl: 'https://picsum.photos/100' },
        greenApiConfig: null,
        availabilitySettings: defaultAvailability,
   };

   // Fix: Switched to Firebase v8 syntax.
   return db.ref(`users/${userId}`).set(initialData);
};

// Fix: Switched to Firebase v8 syntax.
const signUpWithEmail = async (name: string, email: string, password: string): Promise<firebase.auth.UserCredential> => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    // Fix: updateProfile is a method on the user object in v8.
    await userCredential.user!.updateProfile({ displayName: name });
    await seedInitialData(userCredential.user!.uid, name, email);
    return userCredential;
};

// Fix: Switched to Firebase v8 syntax.
const signOut = (): Promise<void> => {
    return auth.signOut();
};

// --- Green API Service ---
const sendWhatsAppMessage = async (
    config: GreenApiConfig,
    mobile: string,
    message: string
): Promise<{ success: boolean; message: string }> => {
    if (!config || !config.instanceId || !config.apiKey) {
        return { success: false, message: 'Green API is not configured.' };
    }

    const [instanceId, customHost] = config.instanceId.includes(':')
        ? config.instanceId.split(':')
        : [config.instanceId, null];
    
    const apiHost = customHost || 'api.green-api.com';
    const chatId = `91${mobile}@c.us`;
    const url = `https://${apiHost}/waInstance${instanceId}/sendMessage/${config.apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, message }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                 throw new Error('Authentication failed (401). Please check your credentials and ensure your instance is authorized in your Green API account.');
            }
            const errorData = await response.json().catch(() => ({}));
            const apiError = errorData.error || errorData.message;
            throw new Error(apiError || `API request failed with status ${response.status}`);
        }

        const result = await response.json();
        // Assuming a successful response includes an 'idMessage'
        if (result.idMessage) {
             return { success: true, message: `Message sent successfully with ID: ${result.idMessage}` };
        } else {
             return { success: false, message: 'API indicates message was not sent. Check Green API console.' };
        }
    } catch (error: any) {
        console.error('Failed to send WhatsApp message:', error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
};

const sendTestWhatsAppMessage = async (userId: string, mobile: string): Promise<{ success: boolean; message: string }> => {
    try {
        const configSnapshot = await getRef(userId, 'greenApiConfig').once('value');
        const config = configSnapshot.val();
        if (!config) {
            return { success: false, message: 'Green API is not connected.' };
        }
        const testMessage = `Green CRM - your API connection is working!👍`;
        return await sendWhatsAppMessage(config, mobile, testMessage);
    } catch (error: any) {
        console.error('Error sending test message:', error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
};

const sendConfiguredWhatsAppMessage = async (userId: string, mobile: string, message: string): Promise<{ success: boolean; message: string }> => {
    try {
        const configSnapshot = await getRef(userId, 'greenApiConfig').once('value');
        const config = configSnapshot.val();
        if (!config) {
            return { success: false, message: 'Green API is not connected.' };
        }
        return await sendWhatsAppMessage(config, mobile, message);
    } catch (error: any) {
        console.error('Error sending configured message:', error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
};


// --- Database Service ---

// Fix: Switched to Firebase v8 syntax.
const syncUserData = (userId: string, callback: (data: any) => void): (() => void) => {
    const userRef = db.ref(`users/${userId}`);
    const onValueCallback = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val();
        if (data) {
            // Sort leads by dateAdded descending (newest first)
            const leadsData = firebaseArray<Lead>(data.leads);
            const sortedLeads = leadsData.sort((a, b) => {
                const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
                const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
                return dateB - dateA;
            });
            
            // Normalize availabilitySettings to prevent crashes with old data structures
            const rawSettings = data.availabilitySettings;
            let availabilitySettings: AvailabilitySettings | null = null;
            if (rawSettings && rawSettings.schedule) {
                // Data is in the new format, use it as is.
                availabilitySettings = rawSettings;
            } else if (rawSettings) {
                // Data is in an old format or invalid, migrate it to the new structure.
                const defaultSchedule: { [day: string]: DayAvailability } = {
                    'Sunday': { enabled: false, startTime: '09:00', endTime: '17:00' },
                    'Monday': { enabled: true, startTime: '09:00', endTime: '17:00' },
                    'Tuesday': { enabled: true, startTime: '09:00', endTime: '17:00' },
                    'Wednesday': { enabled: true, startTime: '09:00', endTime: '17:00' },
                    'Thursday': { enabled: true, startTime: '09:00', endTime: '17:00' },
                    'Friday': { enabled: true, startTime: '09:00', endTime: '17:00' },
                    'Saturday': { enabled: false, startTime: '09:00', endTime: '17:00' },
                };
                 availabilitySettings = {
                    schedule: defaultSchedule,
                    duration: rawSettings.duration || 30,
                    buffer: rawSettings.buffer || 15,
                    bookingWindowDays: rawSettings.bookingWindowDays || 30,
                    minBookingNoticeHours: rawSettings.minBookingNoticeHours || 4,
                    bookingQuestions: rawSettings.bookingQuestions || [],
                };
            }

            // Fix: Ensure bookingQuestions is always an array to prevent crashes.
            // Firebase can store arrays as objects, which causes .map to fail.
            if (availabilitySettings && availabilitySettings.bookingQuestions && !Array.isArray(availabilitySettings.bookingQuestions)) {
                availabilitySettings.bookingQuestions = Object.values(availabilitySettings.bookingQuestions);
            }


            const processedData = {
                leads: sortedLeads,
                templates: firebaseArray(data.templates),
                triggers: firebaseArray(data.triggers),
                landingPages: firebaseArray(data.landingPages),
                thankYouPages: firebaseArray(data.thankYouPages),
                meetings: firebaseArray(data.meetings).map((m: any) => ({
                    ...m,
                    startTime: new Date(m.startTime),
                    endTime: new Date(m.endTime)
                })),
                leadStatuses: data.leadStatuses || [],
                adminUser: data.adminUser,
                greenApiConfig: data.greenApiConfig || null,
                availabilitySettings: availabilitySettings,
            };
            callback(processedData);
        } else {
            callback(null);
        }
    };
    userRef.on('value', onValueCallback);
    return () => userRef.off('value', onValueCallback);
};

// Fix: Switched to Firebase v8 syntax.
const addNewLead = async (userId: string, newLeadData: Omit<Lead, 'id' | 'status' | 'dateAdded'>) => {
    const newLeadRef = getRef(userId, 'leads').push();
    const newLead: Omit<Lead, 'id'> = {
        ...newLeadData,
        status: 'New',
        dateAdded: new Date().toISOString(),
    };
    await newLeadRef.set(newLead);

     // After saving, try to send a welcome message
    try {
        const userSnapshot = await db.ref(`users/${userId}`).once('value');
        const userData = userSnapshot.val();

        if (!userData || !userData.greenApiConfig || !userData.triggers) {
            console.log('Cannot send welcome message: missing config or triggers.');
            return;
        }

        const welcomeTrigger = firebaseArray<Trigger>(userData.triggers)
            .find(t => t.type === 'new-lead' && t.enabled);
        
        if (welcomeTrigger) {
            const welcomeTemplate = firebaseArray<MessageTemplate>(userData.templates)
                .find(t => t.id === welcomeTrigger.templateId);

            if (welcomeTemplate) {
                const message = welcomeTemplate.content.replace('{{name}}', newLeadData.name);
                console.log(`Sending welcome message to ${newLeadData.name}...`);
                await sendWhatsAppMessage(userData.greenApiConfig, newLeadData.mobile, message);
            }
        }
    } catch (error) {
        console.error('Error sending welcome message after adding new lead:', error);
    }
};

const updateLead = (userId: string, leadId: string, updates: Partial<Omit<Lead, 'id'>>) => {
    return getRef(userId, 'leads').child(leadId).update(updates);
};

const deleteLeads = (userId: string, leadIds: string[]) => {
    const updates: { [key: string]: null } = {};
    leadIds.forEach(leadId => {
        updates[`users/${userId}/leads/${leadId}`] = null;
    });
    return db.ref().update(updates);
};

// Fix: Switched to Firebase v8 syntax.
const updateLeadStatuses = (userId: string, newStatuses: LeadStatus[]) => {
    return getRef(userId, 'leadStatuses').set(newStatuses);
};

// Fix: Switched to Firebase v8 syntax.
const saveTemplate = (userId: string, template: MessageTemplate) => {
    let templateId = template.id;
    if (!templateId) {
        templateId = getRef(userId, 'templates').push().key!;
    }
    const { id, ...data } = { ...template, id: templateId };
    return getRef(userId, 'templates').child(templateId).set(data);
};

// Fix: Switched to Firebase v8 syntax.
const deleteTemplate = (userId: string, templateId: string) => {
    return getRef(userId, 'templates').child(templateId).remove();
};

// Fix: Switched to Firebase v8 syntax.
const updateTriggers = (userId: string, newTriggers: Trigger[]) => {
    return getRef(userId, 'triggers').set(arrayToObject(newTriggers));
};

// Fix: Switched to Firebase v8 syntax.
const addMeeting = (userId: string, meeting: Omit<Meeting, 'id'>) => {
    const newRef = getRef(userId, 'meetings').push();
    const newMeeting = {
        ...meeting,
        startTime: meeting.startTime.toISOString(),
        endTime: meeting.endTime.toISOString(),
    };
    return newRef.set(newMeeting);
};

const deleteMeeting = (userId: string, meetingId: string) => {
    return getRef(userId, 'meetings').child(meetingId).remove();
};

// Fix: Switched to Firebase v8 syntax.
const updateAdminUser = (userId: string, updatedUser: Admin) => {
    return getRef(userId, 'adminUser').set(updatedUser);
};

// Fix: Switched to Firebase v8 syntax.
const saveGreenApiConfig = (userId: string, instanceId: string, apiKey: string) => {
    const config = { instanceId, apiKey };
    return getRef(userId, 'greenApiConfig').set(config);
};

// Fix: Switched to Firebase v8 syntax.
const deleteGreenApiConfig = (userId: string) => {
    return getRef(userId, 'greenApiConfig').remove();
};

const saveThankYouPage = (userId: string, page: ThankYouPage) => {
    let pageId = page.id;
    if (!pageId) {
        pageId = getRef(userId, 'thankYouPages').push().key!;
    }
    const { id, ...data } = { ...page, id: pageId };
    return getRef(userId, 'thankYouPages').child(pageId).set(data);
};

const deleteThankYouPage = (userId: string, pageId: string) => {
    return getRef(userId, 'thankYouPages').child(pageId).remove();
};

const saveLandingPage = (userId: string, page: LandingPage) => {
    const { id, ...data } = page;
    return getRef(userId, 'landingPages').child(id).set(data);
};

const addLandingPage = (userId: string, pageData: { name: string; thankYouPageId: string }) => {
    const newPageRef = getRef(userId, 'landingPages').push();
    const newPage: Omit<LandingPage, 'id'> = {
        ...pageData,
        createdDate: new Date().toISOString().split('T')[0],
        leadsCount: 0,
    };
    return newPageRef.set(newPage);
};

const updateAvailabilitySettings = (userId: string, settings: AvailabilitySettings) => {
    return getRef(userId, 'availabilitySettings').set(settings);
};

const getPublicBookingData = async (userId: string): Promise<{ meetings: Meeting[], settings: AvailabilitySettings, adminName: string } | null> => {
    const snapshot = await getRef(userId, '').once('value');
    const data = snapshot.val();
    if (!data || !data.availabilitySettings) return null;

    // Defensively add bookingQuestions if they don't exist for older accounts
    if (!data.availabilitySettings.bookingQuestions) {
        data.availabilitySettings.bookingQuestions = [
            { id: 'clientName', label: 'Full Name', type: 'text', required: true },
            { id: 'q1', label: 'Please share anything that will help prepare for our meeting.', type: 'textarea', required: false }
        ];
    }

    return {
        meetings: firebaseArray(data.meetings).map((m: any) => ({ ...m, startTime: new Date(m.startTime), endTime: new Date(m.endTime) })),
        settings: data.availabilitySettings,
        adminName: data.adminUser?.name || 'User'
    };
};

const addPublicMeeting = (userId: string, meeting: Omit<Meeting, 'id'>) => {
    const newRef = getRef(userId, 'meetings').push();
    const newMeeting = {
        ...meeting,
        startTime: meeting.startTime.toISOString(),
        endTime: meeting.endTime.toISOString(),
    };
    return newRef.set(newMeeting);
};

export const crmService = {
    // Auth
    onAuthStateChangedListener,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    // Database
    syncUserData,
    addNewLead,
    updateLead,
    deleteLeads,
    updateLeadStatuses,
    saveTemplate,
    deleteTemplate,
    updateTriggers,
    addMeeting,
    deleteMeeting,
    updateAdminUser,
    saveGreenApiConfig,
    deleteGreenApiConfig,
    saveLandingPage,
    addLandingPage,
    saveThankYouPage,
    deleteThankYouPage,
    updateAvailabilitySettings,
    // Public
    getPublicBookingData,
    addPublicMeeting,
    // Green API
    sendTestWhatsAppMessage,
    sendConfiguredWhatsAppMessage,
};
