import React, { useState, useEffect, useRef } from 'react';
import { MessageTemplate, Trigger, GreenApiConfig, TriggerType, Lead } from '../types';
import { crmService } from '../services/crmService';
import { useAuth } from '../hooks/useAuth';
import { EditIcon, DeleteIcon } from '../constants';


const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                <div className="text-slate-600 mt-4">{message}</div>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">
                        No, Cancel
                    </button>
                    <button type="button" onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

type GreenApiTab = 'templates' | 'triggers';

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
    const [templateToDelete, setTemplateToDelete] = useState<MessageTemplate | null>(null);

    const openModal = (template: MessageTemplate | null = null) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };
    
    const confirmDelete = () => {
        if (templateToDelete) {
            onDelete(templateToDelete.id);
            setTemplateToDelete(null);
        }
    };

    const renderPreviewContent = (text: string) => {
        const sampleData: { [key: string]: string } = {
            name: 'Praveen',
            mobile: '9876543210',
            profession: 'Software Engineer',
            city: 'Bangalore',
        };
        const parts = text.split(/(\{\{\w+\}\})/g);

        return parts.map((part, index) => {
            if (part.match(/\{\{(\w+)\}\}/)) {
                const varName = part.replace(/[{}]/g, '');
                return (
                    <span key={index} className="font-bold text-sky-700 bg-sky-200/50 rounded-sm px-1 py-0.5">
                        {sampleData[varName] || 'Sample Data'}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div>
            <TemplateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onSave} template={editingTemplate} />
            <ConfirmationModal
                isOpen={!!templateToDelete}
                onClose={() => setTemplateToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirm Template Deletion"
                message={<p>Are you sure you want to delete the template "<strong>{templateToDelete?.name}</strong>"? This action cannot be undone.</p>}
            />
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-slate-700">Message Templates</h4>
                <button onClick={() => openModal()} className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg text-sm">+ Add Template</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                    <div key={template.id} className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm transition-shadow hover:shadow-lg flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-slate-800 break-words flex-1">{template.name}</p>
                                 <div className="flex gap-2 flex-shrink-0 ml-2">
                                   <button onClick={() => openModal(template)} className="text-xs font-medium text-sky-600 hover:text-sky-800">Edit</button>
                                   <button onClick={() => setTemplateToDelete(template)} className="text-xs font-medium text-red-600 hover:text-red-800">Del</button>
                                </div>
                            </div>
                             <p className="text-xs text-slate-400 mb-4">Updated: {template.lastUpdated}</p>
                        </div>
                        <div className="bg-[#DCF8C6] p-2 rounded-lg shadow-sm ml-auto w-full break-words">
                            <p className="text-sm text-slate-800 whitespace-pre-wrap">
                               {renderPreviewContent(template.content)}
                            </p>
                            <div className="text-right text-xs text-slate-400 mt-1">
                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>
                ))}
                 {templates.length === 0 && (
                    <div className="sm:col-span-2 lg:col-span-3 text-center py-10 text-slate-500 border-2 border-dashed rounded-lg">
                        <p>No templates yet.</p>
                        <p className="text-sm">Click "+ Add Template" to create your first message.</p>
                    </div>
                )}
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
            <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="bg-slate-800 p-4">
                    <h3 className="text-xl font-semibold text-white">{trigger ? name : 'Create Trigger'}</h3>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-slate-700">Trigger Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded text-slate-900" placeholder="e.g., New Lead Welcome" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-slate-700">Trigger Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value as TriggerType)} className="w-full p-2 border rounded bg-white text-slate-900">
                            <option value="new-lead">When a new lead is created</option>
                            <option value="meeting-reminder">Before a meeting</option>
                            <option value="scheduled">On a specific date/time</option>
                        </select>
                    </div>
                    
                    {type === 'meeting-reminder' && (
                        <div>
                            <label className="block text-sm font-bold mb-2 text-slate-700">Reminder Time</label>
                            <div className="flex items-center gap-2">
                                <input type="number" value={minutesBefore} onChange={e => setMinutesBefore(parseInt(e.target.value, 10))} className="w-full p-2 border rounded text-slate-900" />
                                <span className="text-slate-600">minutes before meeting</span>
                            </div>
                        </div>
                    )}

                    {type === 'scheduled' && (
                         <>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700">Scheduled Time</label>
                                <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="w-full p-2 border rounded text-slate-900" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700">Send To Lead</label>
                                <select value={targetLeadId} onChange={e => setTargetLeadId(e.target.value)} className="w-full p-2 border rounded bg-white text-slate-900" required>
                                    <option value="" disabled>Select a lead...</option>
                                    {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-2 text-slate-700">Send Template</label>
                         <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="w-full p-2 border rounded bg-white text-slate-900" required>
                            <option value="" disabled>Select a template...</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-lg">Save Trigger</button>
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
    const [triggerToDelete, setTriggerToDelete] = useState<Trigger | null>(null);

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

    const confirmDelete = () => {
        if (triggerToDelete) {
            handleDelete(triggerToDelete.id);
            setTriggerToDelete(null);
        }
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
            <ConfirmationModal
                isOpen={!!triggerToDelete}
                onClose={() => setTriggerToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirm Trigger Deletion"
                message={<p>Are you sure you want to delete the trigger "<strong>{triggerToDelete?.name}</strong>"?</p>}
            />
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
                                <button onClick={() => setTriggerToDelete(trigger)} className="font-medium text-red-600 hover:text-red-800">Delete</button>
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


const TemplateModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (template: MessageTemplate) => void; template: MessageTemplate | null }> = ({ isOpen, onClose, onSave, template }) => {
    if (!isOpen) return null;

    const [name, setName] = useState(template?.name || '');
    const [content, setContent] = useState(template?.content || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setName(template?.name || '');
        setContent(template?.content || '');
    }, [template]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const savedTemplate = {
            id: template?.id || '',
            name,
            content,
            lastUpdated: new Date().toISOString().split('T')[0],
        };
        onSave(savedTemplate);
        onClose();
    };

    const insertVariable = (variable: string) => {
        if (!textareaRef.current) return;
        const { selectionStart, selectionEnd, value } = textareaRef.current;
        const newContent = value.substring(0, selectionStart) + variable + value.substring(selectionEnd);
        setContent(newContent);
        
        // Use a timeout to ensure the state update has rendered before focusing
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = selectionStart + variable.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const renderPreviewContent = (text: string) => {
        const sampleData: { [key: string]: string } = {
            name: 'Praveen',
            mobile: '9876543210',
            profession: 'Software Engineer',
            city: 'Bangalore',
        };
        const parts = text.split(/(\{\{\w+\}\})/g);
        
        if (text.trim() === '') {
            return <span className="text-slate-400 italic">Your message will appear here...</span>;
        }

        return parts.map((part, index) => {
            if (part.match(/\{\{(\w+)\}\}/)) {
                const varName = part.replace(/[{}]/g, '');
                return (
                    <span key={index} className="font-bold text-sky-700 bg-sky-200/50 rounded-sm px-1 py-0.5">
                        {sampleData[varName] || 'Sample Data'}
                    </span>
                );
            }
            // Preserve line breaks from the textarea
            return part.split('\n').map((line, i) => <React.Fragment key={`${index}-${i}`}>{line}{i < part.split('\n').length - 1 && <br />}</React.Fragment>);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="bg-slate-800 p-4">
                    <h3 className="text-xl font-semibold text-white">{template ? 'Edit Template' : 'Add New Template'}</h3>
                </div>
                <div className="flex flex-col md:flex-row">
                    {/* Left Side: Form */}
                    <div className="w-full md:w-1/2 p-6 border-r border-slate-200">
                        <form id="templateForm" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700">Template Name</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-black bg-white rounded text-slate-900" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700">Content</label>
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={6}
                                    className="w-full p-2 border border-black bg-white rounded text-slate-900 font-sans"
                                    required
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700">Add Sample Variables</label>
                                <div className="flex flex-wrap gap-2">
                                     {['{{name}}', '{{mobile}}', '{{profession}}', '{{city}}'].map(variable => (
                                        <button
                                            key={variable}
                                            type="button"
                                            onClick={() => insertVariable(variable)}
                                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-mono font-bold py-1 px-2 rounded-md"
                                        >
                                            {variable}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Side: Preview */}
                    <div className="w-full md:w-1/2 p-6 bg-slate-50 flex flex-col justify-center items-center">
                        <p className="font-semibold text-slate-700 mb-4">Message Preview</p>
                        <div className="w-full max-w-xs">
                            <div className="bg-[#DCF8C6] p-2 rounded-lg shadow-sm ml-auto max-w-full break-words">
                                <p className="text-sm text-slate-800 whitespace-pre-wrap">
                                    {renderPreviewContent(content)}
                                </p>
                                <div className="text-right text-xs text-slate-400 mt-1">
                                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="flex justify-end gap-4 p-4 bg-slate-100 border-t">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-lg">Cancel</button>
                    <button type="submit" form="templateForm" className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};


const ConnectGreenApiModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConnect: (instanceId: string, apiKey: string) => void;
    config: GreenApiConfig | null;
}> = ({ isOpen, onClose, onConnect, config }) => {
    if (!isOpen) return null;
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onConnect(
            formData.get('instanceId') as string, 
            formData.get('apiKey') as string
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
                            pattern="\\d{10}"
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

interface GreenApiProps {
    templates: MessageTemplate[]; 
    onSaveTemplate: (template: MessageTemplate) => void;
    onDeleteTemplate: (id: string) => void;
    triggers: Trigger[]; 
    setTriggers: (triggers: Trigger[]) => void;
    greenApiConfig: GreenApiConfig | null;
    onConnect: (instanceId: string, apiKey: string) => void;
    onDisconnect: () => void;
    leads: Lead[];
}

const GreenApi: React.FC<GreenApiProps> = ({ templates, onSaveTemplate, onDeleteTemplate, triggers, setTriggers, greenApiConfig, onConnect, onDisconnect, leads }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<GreenApiTab>('triggers');
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    
    const isConnected = !!greenApiConfig;

    const handleConnect = (instanceId: string, apiKey: string) => {
        onConnect(instanceId, apiKey);
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

            <div className="bg-white p-6 rounded-xl shadow-md space-y-8">
                <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-6">Green API Integration</h3>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                         <h4 className="font-semibold text-slate-800 mb-2">Connection Status</h4>
                         <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                            <div>
                                <p className="text-sm text-slate-600">
                                    Status: 
                                    {isConnected ? <span className="font-bold text-green-500"> Connected</span> : <span className="font-bold text-red-500"> Not Connected</span>}
                                </p>
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
                    </div>

                    <div>
                        {activeTab === 'templates' && <TemplatesView templates={templates} onSave={onSaveTemplate} onDelete={onDeleteTemplate} />}
                        {activeTab === 'triggers' && <TriggersView triggers={triggers} setTriggers={setTriggers} templates={templates} leads={leads} />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GreenApi;