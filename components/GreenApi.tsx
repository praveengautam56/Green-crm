import React, { useState, useEffect } from 'react';
import { MessageTemplate, Trigger, FlowStep, GreenApiConfig, TriggerType, Lead } from '../types';
import { crmService } from '../services/crmService';
import { useAuth } from '../hooks/useAuth';
import { EditIcon, DeleteIcon } from '../constants';


type GreenApiTab = 'templates' | 'triggers' | 'flow';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        {label}
    </button>
);

const TemplatesView: React.FC<{ 
    templates: MessageTemplate[]; 
    onSave: (template: MessageTemplate) => void;
    onDelete: (id: string) => void;
}> = ({ templates, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

    const openModal = (template: MessageTemplate | null = null) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    return (
        <div>
            <TemplateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onSave} template={editingTemplate} />
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-slate-700">Message Templates</h4>
                <button onClick={() => openModal()} className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg text-sm">+ Add Template</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {templates.map(template => (
                    <div key={template.id} className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm transition-shadow hover:shadow-lg flex flex-col aspect-square">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-slate-800 break-words">{template.name}</p>
                             <div className="flex gap-2 flex-shrink-0 ml-2">
                               <button onClick={() => openModal(template)} className="text-xs font-medium text-sky-600 hover:text-sky-800">Edit</button>
                               <button onClick={() => onDelete(template.id)} className="text-xs font-medium text-red-600 hover:text-red-800">Del</button>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200 flex-1 overflow-auto">
                           {template.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TriggerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (trigger: Trigger) => void;
    trigger: Trigger | null;
    templates: MessageTemplate[];
    leads: Lead[];
}> = ({ isOpen, onClose, onSave, trigger, templates, leads }) => {
    if (!isOpen) return null;

    const [name, setName] = useState(trigger?.name || '');
    const [type, setType] = useState<TriggerType>(trigger?.type || 'new-lead');
    const [templateId, setTemplateId] = useState(trigger?.templateId || '');
    const [dateTime, setDateTime] = useState(trigger?.config?.dateTime || '');
    const [minutesBefore, setMinutesBefore] = useState(trigger?.config?.minutesBefore || 24 * 60);
    const [targetLeadId, setTargetLeadId] = useState(trigger?.config?.leadId || '');


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTrigger: Trigger = {
            id: trigger?.id || '', // Service will generate ID if it's new
            name,
            type,
            templateId,
            enabled: trigger?.enabled ?? true,
            config: {},
        };
        if (type === 'scheduled') {
            newTrigger.config = { dateTime, leadId: targetLeadId };
        }
        if (type === 'meeting-reminder') {
            newTrigger.config = { minutesBefore };
        }
        onSave(newTrigger);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-6">{trigger ? 'Edit' : 'Create'} Trigger</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Trigger Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g., New Lead Welcome" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Trigger Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value as TriggerType)} className="w-full p-2 border rounded bg-white">
                            <option value="new-lead">When a new lead is created</option>
                            <option value="meeting-reminder">Before a meeting</option>
                            <option value="scheduled">On a specific date/time</option>
                        </select>
                    </div>
                    
                    {type === 'meeting-reminder' && (
                        <div>
                            <label className="block text-sm font-bold mb-2">Reminder Time</label>
                            <div className="flex items-center gap-2">
                                <input type="number" value={minutesBefore} onChange={e => setMinutesBefore(parseInt(e.target.value, 10))} className="w-full p-2 border rounded" />
                                <span className="text-slate-600">minutes before meeting</span>
                            </div>
                        </div>
                    )}

                    {type === 'scheduled' && (
                         <>
                            <div>
                                <label className="block text-sm font-bold mb-2">Scheduled Time</label>
                                <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="w-full p-2 border rounded" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Send To Lead</label>
                                <select value={targetLeadId} onChange={e => setTargetLeadId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                                    <option value="" disabled>Select a lead...</option>
                                    {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-2">Send Template</label>
                         <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                            <option value="" disabled>Select a template...</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 px-4 py-2 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded-lg">Save Trigger</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TriggersView: React.FC<{ 
    triggers: Trigger[]; 
    setTriggers: (triggers: Trigger[]) => void;
    templates: MessageTemplate[];
    leads: Lead[];
}> = ({ triggers, setTriggers, templates, leads }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);

    const handleToggle = (id: string) => {
        const newTriggers = triggers.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t);
        setTriggers(newTriggers);
    };
    
    const handleSave = (triggerToSave: Trigger) => {
        if (triggerToSave.id) {
            setTriggers(triggers.map(t => t.id === triggerToSave.id ? triggerToSave : t));
        } else {
             setTriggers([...triggers, { ...triggerToSave, id: `TRG${Date.now()}` }]);
        }
    };
    
    const handleDelete = (id: string) => {
        setTriggers(triggers.filter(t => t.id !== id));
    };

    const openModal = (trigger: Trigger | null) => {
        setEditingTrigger(trigger);
        setIsModalOpen(true);
    };

    const getTriggerDetails = (trigger: Trigger): string => {
        const template = templates.find(t => t.id === trigger.templateId);
        const templateName = template ? `"${template.name}"` : 'a selected template';

        switch(trigger.type) {
            case 'new-lead': return `Sends ${templateName} to every new lead.`;
            case 'meeting-reminder': 
                const hours = Math.floor((trigger.config?.minutesBefore || 0) / 60);
                const minutes = (trigger.config?.minutesBefore || 0) % 60;
                return `Sends ${templateName} ${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''} before a meeting.`;
            case 'scheduled':
                const date = trigger.config?.dateTime ? new Date(trigger.config.dateTime).toLocaleString() : 'a specific time';
                const lead = trigger.config?.leadId ? leads.find(l => l.id === trigger.config.leadId) : null;
                const leadName = lead ? ` to ${lead.name}` : '';
                return `Sends ${templateName} at ${date}${leadName}.`;
            default: return `Sends ${templateName}.`;
        }
    };

    return (
        <div>
            <TriggerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} trigger={editingTrigger} templates={templates} leads={leads} />
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-slate-700">Triggers Setup</h4>
                <button onClick={() => openModal(null)} className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg text-sm">+ Add Trigger</button>
            </div>
            <div className="space-y-3">
                {triggers.map(trigger => (
                    <div key={trigger.id} className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm">
                        <div className="flex-1">
                            <p className="font-semibold text-slate-800">{trigger.name}</p>
                            <p className="text-sm text-slate-500">{getTriggerDetails(trigger)}</p>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                            <div className="flex gap-2 text-sm">
                                <button onClick={() => openModal(trigger)} className="font-medium text-sky-600 hover:text-sky-800">Edit</button>
                                <button onClick={() => handleDelete(trigger.id)} className="font-medium text-red-600 hover:text-red-800">Delete</button>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={trigger.enabled} onChange={() => handleToggle(trigger.id)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const FlowStepModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (step: FlowStep) => void;
    step: FlowStep | null;
}> = ({ isOpen, onClose, onSave, step }) => {
    if (!isOpen) return null;

    const [incomingMsg, setIncomingMsg] = useState(step?.incomingMsg || '');
    const [responseMsg, setResponseMsg] = useState(step?.responseMsg || '');
    const [delayMinutes, setDelayMinutes] = useState(step?.delayMinutes || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: step?.id || '', // Parent will handle ID generation for new steps
            incomingMsg,
            responseMsg,
            delayMinutes: Number(delayMinutes),
        });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-800">{step ? 'Edit' : 'Add'} Flow Step</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="incomingMsg">Incoming Message (Trigger)</label>
                        <input name="incomingMsg" type="text" value={incomingMsg} onChange={e => setIncomingMsg(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="e.g., 'price' or 'help'" required />
                        <p className="text-xs text-slate-500 mt-1">When an incoming message contains this keyword, the flow will trigger.</p>
                    </div>
                     <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="responseMsg">Response Message</label>
                        <textarea name="responseMsg" value={responseMsg} onChange={e => setResponseMsg(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md" placeholder="e.g., 'Hello! Here is a link to our pricing...'" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="delay">Time Gap (Delay before sending)</label>
                         <div className="relative">
                            <input name="delay" type="number" value={delayMinutes} onChange={e => setDelayMinutes(Number(e.target.value))} min="0" className="w-full px-3 py-2 border rounded-md pr-16" />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">minutes</span>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Save Step</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const FlowView: React.FC<{ flow: FlowStep[]; setFlow: (flow: FlowStep[]) => void }> = ({ flow, setFlow }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStep, setEditingStep] = useState<FlowStep | null>(null);

    const handleAddStep = () => {
        setEditingStep(null);
        setIsModalOpen(true);
    };
    
    const handleEditStep = (step: FlowStep) => {
        setEditingStep(step);
        setIsModalOpen(true);
    };

    const handleDeleteStep = (id: string) => {
        setFlow(flow.filter(step => step.id !== id));
    };

    const handleSaveStep = (stepToSave: FlowStep) => {
        if (stepToSave.id) { // Existing step
            setFlow(flow.map(s => s.id === stepToSave.id ? stepToSave : s));
        } else { // New step
            setFlow([...flow, { ...stepToSave, id: `FLOW${Date.now()}` }]);
        }
        setIsModalOpen(false);
    };
    
    return (
        <div>
             <FlowStepModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveStep} step={editingStep} />
             <div className="flex justify-between items-center mb-4">
                <div>
                    <h4 className="text-lg font-semibold text-slate-900">Flow Setup</h4>
                    <p className="text-sm text-slate-500">Automate responses to incoming messages. Requires a configured webhook.</p>
                </div>
                <button onClick={handleAddStep} className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex-shrink-0">+ Add Step</button>
            </div>
            <div className="relative pl-6">
                <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-slate-300"></div>
                {flow.map((step) => (
                    <div key={step.id} className="relative mb-8 flex items-center">
                        <div className={`z-10 absolute -left-[12px] w-6 h-6 rounded-full flex items-center justify-center text-white bg-indigo-500`}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v4a1 1 0 001 1h12a1 1 0 001-1v-4a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                           </svg>
                        </div>
                        <div className="ml-8 p-4 border rounded-lg bg-white w-full shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <span className="text-xs font-semibold uppercase text-slate-500">When message contains:</span>
                                        <p className="text-slate-800 bg-slate-50 p-2 rounded mt-1 font-mono">"{step.incomingMsg}"</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold uppercase text-slate-500">Wait {step.delayMinutes} min and reply with:</span>
                                        <p className="text-slate-800 bg-slate-50 p-2 rounded mt-1">"{step.responseMsg}"</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button onClick={() => handleEditStep(step)} className="text-slate-500 hover:text-sky-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => handleDeleteStep(step.id)} className="text-slate-500 hover:text-red-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             {flow.length === 0 && (
                <div className="text-center py-10 text-slate-500 border-2 border-dashed rounded-lg">
                    <p>No flow steps defined.</p>
                    <p className="text-sm">Click "+ Add Step" to create your first automation.</p>
                </div>
            )}
        </div>
    );
};

const TemplateModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (template: MessageTemplate) => void; template: MessageTemplate | null }> = ({ isOpen, onClose, onSave, template }) => {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const savedTemplate = {
            id: template?.id || '',
            name: formData.get('name') as string,
            content: formData.get('content') as string,
            lastUpdated: new Date().toISOString().split('T')[0],
        };
        onSave(savedTemplate);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">{template ? 'Edit' : 'Add'} Template</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">Template Name</label>
                        <input name="name" defaultValue={template?.name} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">Content</label>
                        <textarea name="content" defaultValue={template?.content} rows={4} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 px-4 py-2 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ConnectGreenApiModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConnect: (instanceId: string, apiKey: string, webhookUrl: string) => void;
    config: GreenApiConfig | null;
}> = ({ isOpen, onClose, onConnect, config }) => {
    if (!isOpen) return null;
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onConnect(
            formData.get('instanceId') as string, 
            formData.get('apiKey') as string,
            formData.get('webhookUrl') as string,
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4 text-slate-800">Connect Green API</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2 text-slate-800" htmlFor="instanceId">Instance ID & Host</label>
                        <input 
                            name="instanceId" 
                            id="instanceId"
                            className="w-full p-2 border rounded" 
                            required 
                            placeholder="e.g., 1101822419:s23.green-api.com"
                            defaultValue={config?.instanceId || ''}
                        />
                         <p className="text-xs text-slate-700 mt-1">
                            Find the host in your Green API instance settings. If you have a custom host, append it with a colon (:).
                            Otherwise, 'api.green-api.com' will be used.
                        </p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2 text-slate-800" htmlFor="apiKey">API Key Token</label>
                        <input name="apiKey" id="apiKey" type="password" className="w-full p-2 border rounded" required defaultValue={config?.apiKey || ''} />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-bold mb-2 text-slate-800" htmlFor="webhookUrl">Webhook URL (Optional)</label>
                        <input 
                            name="webhookUrl" 
                            id="webhookUrl"
                            type="url"
                            className="w-full p-2 border rounded" 
                            placeholder="https://your-backend.com/webhook"
                            defaultValue={config?.webhookUrl || ''}
                        />
                        <p className="text-xs text-slate-700 mt-1">
                            Required for the "Flow Setup". Your backend endpoint where Green API sends incoming message data.
                        </p>
                    </div>
                     <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Connect</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TestConnectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSendTest: (mobile: string) => Promise<{ success: boolean; message: string }>;
}> = ({ isOpen, onClose, onSendTest }) => {
    if (!isOpen) return null;

    const [testNumber, setTestNumber] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [testMessageResult, setTestMessageResult] = useState('');

    const handleSend = async () => {
        if (testNumber.length !== 10) return;
        setIsTesting(true);
        setTestMessageResult('Sending...');
        const result = await onSendTest(testNumber);
        setTestMessageResult(result.success ? `Success: ${result.message}` : `Error: ${result.message}`);
        setIsTesting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Test Your Connection</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Enter a WhatsApp-enabled mobile number (without country code) to send a test message.
                </p>
                <div className="flex items-start gap-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-slate-500 sm:text-sm">+91</span>
                        </div>
                        <input
                            type="tel"
                            value={testNumber}
                            onChange={(e) => setTestNumber(e.target.value)}
                            placeholder="9876543210"
                            pattern="\d{10}"
                            title="Please enter a 10-digit mobile number"
                            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={isTesting || testNumber.length !== 10}
                        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isTesting ? 'Sending...' : 'Send'}
                    </button>
                </div>
                {testMessageResult && (
                    <p className={`mt-3 text-sm font-medium ${testMessageResult.startsWith('Success') ? 'text-green-600' : 'text-red-600'}`}>
                        {testMessageResult}
                    </p>
                )}
                 <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 font-bold py-2 px-4 rounded-lg">Close</button>
                </div>
            </div>
        </div>
    );
};

const WebhookGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const payloadExample = `{
  "typeWebhook": "incomingMessageReceived",
  "instanceData": { ... },
  "timestamp": 1678886400,
  "idMessage": "...",
  "senderData": {
    "chatId": "919876543210@c.us",
    "sender": "919876543210@c.us",
    "senderName": "John Doe"
  },
  "messageData": {
    "typeMessage": "textMessage",
    "textMessageData": {
      "textMessage": "price"
    }
  }
}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white mt-8 mb-8 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-800">Webhook & Backend Guide</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="space-y-6 text-slate-700">
                    <div>
                        <h4 className="font-semibold text-lg text-slate-800 mb-2">1. What is a Webhook?</h4>
                        <p>A webhook is a URL on your own server that Green API sends a POST request to whenever a new message arrives in your WhatsApp account. Your server must be running 24/7 to receive these messages and trigger your automated flows.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-slate-800 mb-2">2. What Your Backend Needs to Do</h4>
                        <p className="mb-4">Here is the logic your server-side code must implement:</p>
                        <ol className="list-decimal list-inside space-y-2 bg-slate-50 p-4 rounded-md border">
                            <li>Create a public API endpoint (e.g., `POST /api/green-webhook`) and enter its URL in the connection settings.</li>
                            <li>When a request comes from Green API, parse the JSON body. See the example payload below.</li>
                            <li>Extract the sender's number from <code className="bg-slate-200 px-1 rounded text-sm">senderData.chatId</code> and the message from <code className="bg-slate-200 px-1 rounded text-sm">messageData.textMessageData.textMessage</code>.</li>
                            <li>Using the User ID (which you'll need to associate with the webhook), load your "Flow" rules from your Firebase Realtime Database at the path <code className="bg-slate-200 px-1 rounded text-sm">/users/&#123;userId&#125;/flow</code>.</li>
                            <li>Check if the incoming message text contains any of your configured keywords (<code className="bg-slate-200 px-1 rounded text-sm">incomingMsg</code>).</li>
                            <li>If a match is found, retrieve the corresponding <code className="bg-slate-200 px-1 rounded text-sm">responseMsg</code> and <code className="bg-slate-200 px-1 rounded text-sm">delayMinutes</code>.</li>
                            <li>After the delay, use the <code className="bg-slate-200 px-1 rounded text-sm">crmService.sendConfiguredWhatsAppMessage</code> logic to send the reply. You'll need to load the user's Green API credentials from Firebase to do this.</li>
                        </ol>
                    </div>

                     <div>
                        <h4 className="font-semibold text-lg text-slate-800 mb-2">3. Example Incoming Message Payload</h4>
                        <p className="mb-2">Your server will receive a JSON object that looks like this. Your code needs to parse this to get the sender's number and message.</p>
                        <pre className="bg-slate-800 text-white p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{payloadExample}</code>
                        </pre>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                         <button type="button" onClick={onClose} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Got it!</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface GreenApiProps {
    templates: MessageTemplate[]; 
    onSaveTemplate: (template: MessageTemplate) => void;
    onDeleteTemplate: (id: string) => void;
    triggers: Trigger[]; 
    setTriggers: (triggers: Trigger[]) => void;
    flow: FlowStep[]; 
    setFlow: (flow: FlowStep[]) => void;
    greenApiConfig: GreenApiConfig | null;
    onConnect: (instanceId: string, apiKey: string, webhookUrl: string) => void;
    onDisconnect: () => void;
    leads: Lead[];
}

const GreenApi: React.FC<GreenApiProps> = ({ templates, onSaveTemplate, onDeleteTemplate, triggers, setTriggers, flow, setFlow, greenApiConfig, onConnect, onDisconnect, leads }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<GreenApiTab>('triggers');
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    
    const isConnected = !!greenApiConfig;

    const handleConnect = (instanceId: string, apiKey: string, webhookUrl: string) => {
        onConnect(instanceId, apiKey, webhookUrl);
        setIsConnectModalOpen(false);
    };

    const handleSendTestMessage = async (mobile: string) => {
        if (!user) return { success: false, message: 'User not authenticated.'};
        return await crmService.sendTestWhatsAppMessage(user.uid, mobile);
    };

    return (
        <>
            <ConnectGreenApiModal 
                isOpen={isConnectModalOpen} 
                onClose={() => setIsConnectModalOpen(false)} 
                onConnect={handleConnect} 
                config={greenApiConfig}
            />
            <TestConnectionModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} onSendTest={handleSendTestMessage} />
            <WebhookGuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />

            <div className="bg-white p-6 rounded-xl shadow-md space-y-8">
                <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-6">Green API Integration</h3>

                     <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 mb-6 rounded-r-lg" role="alert">
                        <p className="font-bold">Action Required: Backend Server Needed for Flows</p>
                        <div className="flex justify-between items-center">
                            <p className="text-sm">
                                The "Flow Setup" feature is **not functional** without a backend server. Your server must receive data from Green API via your webhook URL and then use your credentials to send replies. This CRM only helps you *configure* the automation rules.
                            </p>
                            <button onClick={() => setIsGuideModalOpen(true)} className="ml-4 flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors">
                                View Backend Guide
                            </button>
                        </div>
                    </div>


                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                         <h4 className="font-semibold text-slate-800 mb-2">Connection Status</h4>
                         <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                            <div>
                                <p className="text-sm text-slate-600">
                                    Status: 
                                    {isConnected ? <span className="font-bold text-green-500"> Connected</span> : <span className="font-bold text-red-500"> Not Connected</span>}
                                </p>
                                {isConnected && greenApiConfig?.webhookUrl && (
                                    <p className="text-xs text-slate-500 mt-1">Webhook active at: <code className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded">{greenApiConfig.webhookUrl}</code></p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-3 sm:mt-0">
                                {isConnected && (
                                    <button
                                        onClick={() => setIsTestModalOpen(true)}
                                        className="font-bold py-2 px-4 rounded-lg transition-colors text-sm bg-sky-500 hover:bg-sky-600 text-white"
                                    >
                                        Test
                                    </button>
                                )}
                                <button 
                                    onClick={() => isConnected ? onDisconnect() : setIsConnectModalOpen(true)}
                                    className={`font-bold py-2 px-4 rounded-lg transition-colors text-sm ${isConnected ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                >
                                    {isConnected ? 'Disconnect' : 'Connect'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex space-x-2 border-b mb-6 pb-2">
                        <TabButton label="Triggers Setup" isActive={activeTab === 'triggers'} onClick={() => setActiveTab('triggers')} />
                        <TabButton label="Manage Templates" isActive={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
                        <TabButton label="Flow Setup" isActive={activeTab === 'flow'} onClick={() => setActiveTab('flow')} />
                    </div>

                    <div>
                        {activeTab === 'templates' && <TemplatesView templates={templates} onSave={onSaveTemplate} onDelete={onDeleteTemplate} />}
                        {activeTab === 'triggers' && <TriggersView triggers={triggers} setTriggers={setTriggers} templates={templates} leads={leads} />}
                        {activeTab === 'flow' && <FlowView flow={flow} setFlow={setFlow} />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GreenApi;