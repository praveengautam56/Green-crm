import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Page, Lead, MessageTemplate, Trigger, LandingPage, Meeting, LeadStatus, Admin, GreenApiConfig, ThankYouPage, AvailabilitySettings } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Leads from './components/Leads';
import GreenApi from './components/GreenApi';
import LandingPages from './components/LandingPages';
import Calendar from './components/Calendar';
import HomePage from './components/HomePage';
import { useAuth } from './hooks/useAuth';
import { crmService } from './services/crmService';
import PublicBookingPage from './components/PublicBookingPage';

const App: React.FC = () => {
    const { user, signOut, loading: authLoading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
    
    // State managed at App level, synced with Firebase
    const [leads, setLeads] = useState<Lead[]>([]);
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [triggers, setTriggers] = useState<Trigger[]>([]);
    const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
    const [thankYouPages, setThankYouPages] = useState<ThankYouPage[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>([]);
    const [adminUser, setAdminUser] = useState<Admin | null>(null);
    const [greenApiConfig, setGreenApiConfig] = useState<GreenApiConfig | null>(null);
    const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [publicBookingUserId, setPublicBookingUserId] = useState<string | null>(null);

     useEffect(() => {
        // Check for public booking URL on initial load
        const urlParams = new URLSearchParams(window.location.search);
        const bookingUserId = urlParams.get('booking');
        if (bookingUserId) {
            setPublicBookingUserId(bookingUserId);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            setLoadingData(false);
            // Clear data on logout
            setLeads([]);
            setTemplates([]);
            setTriggers([]);
            setLandingPages([]);
            setThankYouPages([]);
            setMeetings([]);
            setLeadStatuses([]);
            setAdminUser(null);
            setGreenApiConfig(null);
            setAvailabilitySettings(null);
            return;
        }

        setLoadingData(true);
        const unsubscribe = crmService.syncUserData(user.uid, (data) => {
            if (data) {
                setLeads(data.leads);
                setTemplates(data.templates);
                setTriggers(data.triggers);
                setLandingPages(data.landingPages);
                setThankYouPages(data.thankYouPages);
                setMeetings(data.meetings);
                setLeadStatuses(data.leadStatuses);
                setAdminUser(data.adminUser);
                setGreenApiConfig(data.greenApiConfig || null);
                setAvailabilitySettings(data.availabilitySettings || null);
            }
            setLoadingData(false);
        });

        return () => unsubscribe();
    }, [user]);
    
    const handleLogout = useCallback(async () => {
        await signOut();
    }, [signOut]);

    const handleAddNewLead = useCallback((newLeadData: Omit<Lead, 'id' | 'status' | 'dateAdded'>) => {
        if (!user) return;
        crmService.addNewLead(user.uid, newLeadData);
    }, [user]);

    const handleDeleteLeads = useCallback((leadIds: string[]) => {
        if (!user) return;
        crmService.deleteLeads(user.uid, leadIds);
    }, [user]);
    
    const handleUpdateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
        if (!user) return;
        const { id, ...dataToUpdate } = updates; // Exclude id from the update payload
        crmService.updateLead(user.uid, leadId, dataToUpdate);
    }, [user]);

    const updateLeadStatuses = (newStatuses: LeadStatus[]) => {
        if (!user) return;
        crmService.updateLeadStatuses(user.uid, newStatuses);
    };
    
    const handleSaveTemplate = (template: MessageTemplate) => {
        if (!user) return;
        crmService.saveTemplate(user.uid, template);
    };

    const handleDeleteTemplate = (id: string) => {
        if (!user) return;
        crmService.deleteTemplate(user.uid, id);
    };

    const updateTriggers = (newTriggers: Trigger[]) => {
        if (!user) return;
        crmService.updateTriggers(user.uid, newTriggers);
    };

    const handleAddMeeting = (meeting: Omit<Meeting, 'id'>) => {
        if (!user) return;
        crmService.addMeeting(user.uid, meeting);
    }

    const handleDeleteMeeting = (meetingId: string) => {
        if (!user) return;
        crmService.deleteMeeting(user.uid, meetingId);
    }
    
    const updateAdminUser = (updatedUser: Admin) => {
        if (!user) return;
         crmService.updateAdminUser(user.uid, updatedUser);
    }

    const handleConnectGreenApi = (instanceId: string, apiKey: string) => {
        if (!user) return;
        crmService.saveGreenApiConfig(user.uid, instanceId, apiKey);
    };

    const handleDisconnectGreenApi = () => {
        if (!user) return;
        crmService.deleteGreenApiConfig(user.uid);
    };

    const handleSaveLandingPage = (page: LandingPage) => {
        if (!user) return;
        crmService.saveLandingPage(user.uid, page);
    };

    const handleSaveThankYouPage = (page: ThankYouPage) => {
        if (!user) return;
        crmService.saveThankYouPage(user.uid, page);
    };
    
    const handleDeleteThankYouPage = (pageId: string) => {
        if (!user) return;
        // Also check if any landing page is using this thank you page
        const isUsed = landingPages.some(lp => lp.thankYouPageId === pageId);
        if (isUsed) {
            alert("This Thank You page is currently linked to one or more landing pages. Please change their redirect URL before deleting.");
            return;
        }
        crmService.deleteThankYouPage(user.uid, pageId);
    };
    
    const handleAddLandingPage = (pageData: { name: string; thankYouPageId: string }) => {
        if (!user) return;
        crmService.addLandingPage(user.uid, pageData);
    };

    const handleUpdateAvailabilitySettings = (settings: AvailabilitySettings) => {
        if (!user) return;
        crmService.updateAvailabilitySettings(user.uid, settings);
    };

    const handleSendMessage = useCallback(async (leadId: string, templateId: string): Promise<{ success: boolean; message: string }> => {
        if (!user) return { success: false, message: "User not logged in." };
        
        const lead = leads.find(l => l.id === leadId);
        const template = templates.find(t => t.id === templateId);

        if (!lead || !template) {
            return { success: false, message: "Lead or template not found." };
        }

        // Simple variable replacement
        let message = template.content;
        message = message.replace(/\{\{name\}\}/g, lead.name);
        message = message.replace(/\{\{mobile\}\}/g, lead.mobile);
        message = message.replace(/\{\{profession\}\}/g, lead.profession);
        message = message.replace(/\{\{city\}\}/g, lead.city);
        message = message.replace(/\{\{state\}\}/g, lead.state);

        return await crmService.sendConfiguredWhatsAppMessage(user.uid, lead.mobile, message);
    }, [user, leads, templates]);

    if (publicBookingUserId) {
        return <PublicBookingPage userId={publicBookingUserId} />;
    }

    if (authLoading || (user && loadingData)) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                     <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
                        Green CRM
                    </h1>
                    <p className="mt-2 text-slate-600">Loading your dashboard...</p>
                </div>
            </div>
        )
    }
    
    if (!user) {
        return <HomePage />;
    }

    if (!adminUser) return null; // Or a better loading/error state

    const renderContent = () => {
        switch (currentPage) {
            case Page.Dashboard:
                return <Dashboard 
                    adminUser={adminUser} 
                    onLogout={handleLogout}
                    leads={leads}
                    leadStatuses={leadStatuses}
                    accountCreationDate={user?.metadata.creationTime}
                />;
            case Page.Leads:
                return <Leads 
                    leads={leads} 
                    onAddNewLead={handleAddNewLead} 
                    leadStatuses={leadStatuses} 
                    setLeadStatuses={updateLeadStatuses}
                    onDeleteLeads={handleDeleteLeads}
                    onUpdateLead={handleUpdateLead}
                    templates={templates}
                    onSendMessage={handleSendMessage}
                />;
            case Page.GreenApi:
                return <GreenApi 
                    templates={templates} 
                    onSaveTemplate={handleSaveTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                    triggers={triggers} 
                    setTriggers={updateTriggers} 
                    greenApiConfig={greenApiConfig}
                    onConnect={handleConnectGreenApi}
                    onDisconnect={handleDisconnectGreenApi}
                    leads={leads}
                />;
            case Page.LandingPages:
                return <LandingPages 
                    landingPages={landingPages} 
                    thankYouPages={thankYouPages}
                    onSaveLandingPage={handleSaveLandingPage}
                    onSaveThankYouPage={handleSaveThankYouPage}
                    onDeleteThankYouPage={handleDeleteThankYouPage}
                    onAddNewLead={handleAddNewLead} 
                    onAddLandingPage={handleAddLandingPage} />;
            case Page.Calendar:
                return <Calendar 
                            meetings={meetings} 
                            onAddMeeting={handleAddMeeting} 
                            onDeleteMeeting={handleDeleteMeeting}
                            availabilitySettings={availabilitySettings}
                            onUpdateAvailability={handleUpdateAvailabilitySettings}
                            userId={user.uid}
                        />;
            default:
                return <Dashboard 
                    adminUser={adminUser} 
                    onLogout={handleLogout} 
                    leads={leads}
                    leadStatuses={leadStatuses}
                    accountCreationDate={user?.metadata.creationTime}
                />;
        }
    };

    return (
        <div className="relative h-screen flex bg-slate-100 font-sans overflow-hidden">
            <Sidebar 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage}
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
              onLogout={handleLogout}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  currentPage={currentPage} 
                  adminUser={adminUser}
                  onUpdateAdmin={updateAdminUser}
                  onLogout={handleLogout} 
                  onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;