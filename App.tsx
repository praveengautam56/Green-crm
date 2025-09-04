import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Page, Lead, MessageTemplate, Trigger, LandingPage, Meeting, FlowStep, LeadStatus, Admin, GreenApiConfig } from './types';
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

const App: React.FC = () => {
    const { user, signOut, loading: authLoading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
    
    // State managed at App level, synced with Firebase
    const [leads, setLeads] = useState<Lead[]>([]);
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [triggers, setTriggers] = useState<Trigger[]>([]);
    const [flow, setFlow] = useState<FlowStep[]>([]);
    const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>([]);
    const [adminUser, setAdminUser] = useState<Admin | null>(null);
    const [greenApiConfig, setGreenApiConfig] = useState<GreenApiConfig | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        if (!user) {
            setLoadingData(false);
            // Clear data on logout
            setLeads([]);
            setTemplates([]);
            setTriggers([]);
            setFlow([]);
            setLandingPages([]);
            setMeetings([]);
            setLeadStatuses([]);
            setAdminUser(null);
            setGreenApiConfig(null);
            return;
        }

        setLoadingData(true);
        const unsubscribe = crmService.syncUserData(user.uid, (data) => {
            if (data) {
                setLeads(data.leads);
                setTemplates(data.templates);
                setTriggers(data.triggers);
                setFlow(data.flow);
                setLandingPages(data.landingPages);
                setMeetings(data.meetings);
                setLeadStatuses(data.leadStatuses);
                setAdminUser(data.adminUser);
                setGreenApiConfig(data.greenApiConfig || null);
            }
            setLoadingData(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Effect to handle time-based triggers.
    // NOTE: This is a browser-based simulation. For a production environment,
    // this logic should be moved to a backend server/service for reliability.
    useEffect(() => {
        // Clear all previous timeouts to avoid duplicates when dependencies change
        timeoutIdsRef.current.forEach(clearTimeout);
        timeoutIdsRef.current = [];
    
        if (!user || !triggers.length || !greenApiConfig || !leads.length || !templates.length) {
            return;
        }
    
        const newTimeoutIds: ReturnType<typeof setTimeout>[] = [];
    
        triggers.forEach(trigger => {
            if (!trigger.enabled) return;
    
            // Handle 'scheduled' triggers
            if (trigger.type === 'scheduled' && trigger.config?.dateTime && trigger.config?.leadId) {
                const scheduledTime = new Date(trigger.config.dateTime).getTime();
                const now = new Date().getTime();
                const delay = scheduledTime - now;
                const targetLead = leads.find(l => l.id === trigger.config.leadId);
                const template = templates.find(t => t.id === trigger.templateId);
    
                if (delay > 0 && targetLead && template) {
                    const timeoutId = setTimeout(() => {
                        console.log(`Triggering scheduled event: ${trigger.name} for ${targetLead.name}`);
                        const message = template.content.replace('{{name}}', targetLead.name);
                        crmService.sendConfiguredWhatsAppMessage(user.uid, targetLead.mobile, message);
                    }, delay);
                    newTimeoutIds.push(timeoutId);
                }
            }
    
            // Handle 'meeting-reminder' triggers
            if (trigger.type === 'meeting-reminder' && trigger.config?.minutesBefore) {
                meetings.forEach(meeting => {
                    const reminderTime = new Date(meeting.startTime).getTime() - (trigger.config.minutesBefore! * 60 * 1000);
                    const now = new Date().getTime();
                    const delay = reminderTime - now;
                     // Matching by name is brittle, but it's what we have in the meeting data
                    const targetLead = leads.find(l => l.name === meeting.attendee);
                    const template = templates.find(t => t.id === trigger.templateId);
    
                    if (delay > 0 && targetLead && template) {
                         const timeoutId = setTimeout(() => {
                            console.log(`Triggering meeting reminder: ${trigger.name} for ${targetLead.name}`);
                            const message = template.content.replace('{{name}}', targetLead.name);
                            crmService.sendConfiguredWhatsAppMessage(user.uid, targetLead.mobile, message);
                        }, delay);
                        newTimeoutIds.push(timeoutId);
                    }
                });
            }
        });
    
        timeoutIdsRef.current = newTimeoutIds;
    
        // Cleanup function to clear timeouts on component unmount or re-render
        return () => {
            timeoutIdsRef.current.forEach(clearTimeout);
        };
    
    }, [user, triggers, meetings, leads, templates, greenApiConfig]);
    
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

    const updateFlow = (newFlow: FlowStep[]) => {
        if (!user) return;
        crmService.updateFlow(user.uid, newFlow);
    };
    
    const handleAddMeeting = (meeting: Omit<Meeting, 'id'>) => {
        if (!user) return;
        crmService.addMeeting(user.uid, meeting);
    }
    
    const updateAdminUser = (updatedUser: Admin) => {
        if (!user) return;
         crmService.updateAdminUser(user.uid, updatedUser);
    }

    const handleConnectGreenApi = (instanceId: string, apiKey: string, webhookUrl: string) => {
        if (!user) return;
        crmService.saveGreenApiConfig(user.uid, instanceId, apiKey, webhookUrl);
    };

    const handleDisconnectGreenApi = () => {
        if (!user) return;
        crmService.deleteGreenApiConfig(user.uid);
    };

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
                />;
            case Page.Leads:
                return <Leads 
                    leads={leads} 
                    onAddNewLead={handleAddNewLead} 
                    leadStatuses={leadStatuses} 
                    setLeadStatuses={updateLeadStatuses}
                    onDeleteLeads={handleDeleteLeads}
                    onUpdateLead={handleUpdateLead}
                />;
            case Page.GreenApi:
                return <GreenApi 
                    templates={templates} 
                    onSaveTemplate={handleSaveTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                    triggers={triggers} 
                    setTriggers={updateTriggers} 
                    flow={flow} 
                    setFlow={updateFlow} 
                    greenApiConfig={greenApiConfig}
                    onConnect={handleConnectGreenApi}
                    onDisconnect={handleDisconnectGreenApi}
                    leads={leads}
                />;
            case Page.LandingPages:
                return <LandingPages landingPages={landingPages} setLandingPages={() => {}} onAddNewLead={handleAddNewLead} />;
            case Page.Calendar:
                return <Calendar meetings={meetings} onAddMeeting={handleAddMeeting} />;
            default:
                return <Dashboard 
                    adminUser={adminUser} 
                    onLogout={handleLogout} 
                    leads={leads}
                    leadStatuses={leadStatuses}
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