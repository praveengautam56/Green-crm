import React, { useState, useEffect } from 'react';
import { LandingPage, Lead, ThankYouPage } from '../types';
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


// --- Child Components & Modals ---

const ThankYouPageSimulation: React.FC<{ onBack: () => void; thankYouPageName: string | undefined }> = ({ onBack, thankYouPageName }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-center text-sky-600 mb-2">Thank You!</h3>
        <p className="text-center text-slate-600 mb-6">Your details have been submitted. You've reached the "{thankYouPageName || 'Default Thank You'}" page. Book a meeting with us below.</p>
        <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-lg text-slate-800 text-center mb-4">Schedule Your Meeting</h4>
            <div className="bg-slate-100 p-10 text-center rounded-md">
                <p className="font-semibold text-slate-700">Meeting Calendar Placeholder</p>
                <p className="text-sm text-slate-600 mt-1">A full calendar component would be embedded here.</p>
            </div>
        </div>
        <button onClick={onBack} className="mt-6 w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">
            Back to Landing Page Management
        </button>
    </div>
);

const LeadCaptureForm: React.FC<{ onFormSubmit: (leadData: Omit<Lead, 'id' | 'status' | 'dateAdded'>) => void; onBack: () => void; }> = ({ onFormSubmit, onBack }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onFormSubmit({
            name: formData.get('fullName') as string,
            mobile: formData.get('mobileNumber') as string,
            profession: formData.get('profession') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
        });
    };
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Simulated Landing Page Form</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="fullName">Full Name</label>
                        <input name="fullName" type="text" className="w-full px-3 py-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="mobileNumber">Mobile Number</label>
                        <input name="mobileNumber" type="tel" className="w-full px-3 py-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="profession">Profession</label>
                        <input name="profession" type="text" className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="city">City</label>
                        <input name="city" type="text" className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="state">State</label>
                        <input name="state" type="text" className="w-full px-3 py-2 border rounded" />
                    </div>
                </div>
                <div className="mt-6 flex gap-4">
                    <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Submit</button>
                    <button type="button" onClick={onBack} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                </div>
            </form>
        </div>
    );
};

const Modal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
);

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>
        {label}
    </button>
);

const ManageThankYouPageModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (page: ThankYouPage) => void;
    page: ThankYouPage | null;
}> = ({ isOpen, onClose, onSave, page }) => {
    if (!isOpen) return null;

    const [name, setName] = useState(page?.name || '');
    const [path, setPath] = useState(page?.path || '');

    const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-/]/g, '');
        setPath(value.startsWith('/') ? value : `/${value}`);
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave({ id: page?.id || '', name, path });
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">{page ? 'Edit' : 'Create'} Thank You Page</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">Page Name</label>
                        <input name="name" value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-3 py-2 border rounded" required placeholder="e.g., Standard Thank You" />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="path">URL Path</label>
                        <div className="flex items-center">
                            <span className="text-slate-500 bg-slate-100 p-2 border rounded-l-md">/</span>
                            <input name="path" value={path.substring(1)} onChange={handlePathChange} type="text" className="w-full px-3 py-2 border-t border-b border-r rounded-r-md" required placeholder="your-path" />
                        </div>
                         <p className="text-xs text-slate-500 mt-1">Only letters, numbers, and hyphens. No spaces.</p>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Save Page</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

const EditLandingPageModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (page: LandingPage) => void;
    page: LandingPage | null;
    thankYouPages: ThankYouPage[];
}> = ({ isOpen, onClose, onSave, page, thankYouPages }) => {
    if (!isOpen || !page) return null;

    const [name, setName] = useState(page.name);
    const [thankYouPageId, setThankYouPageId] = useState(page.thankYouPageId || '');
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave({ ...page, name, thankYouPageId });
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Edit Landing Page</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">Landing Page Name</label>
                        <input name="name" value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-3 py-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="thankYouPageId">Redirect to Thank You Page</label>
                        <select name="thankYouPageId" value={thankYouPageId} onChange={e => setThankYouPageId(e.target.value)} className="w-full px-3 py-2 border rounded bg-white" required>
                            <option value="" disabled>Select a page...</option>
                            {thankYouPages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

const AddLandingPageModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (pageData: { name: string; thankYouPageId: string }) => void;
    thankYouPages: ThankYouPage[];
}> = ({ isOpen, onClose, onSave, thankYouPages }) => {
    if (!isOpen) return null;

    const [name, setName] = useState('');
    const [thankYouPageId, setThankYouPageId] = useState('');

    useEffect(() => {
        if (thankYouPages.length > 0 && !thankYouPageId) {
            setThankYouPageId(thankYouPages[0].id);
        }
    }, [thankYouPages, thankYouPageId]);
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave({ name, thankYouPageId });
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Opt-in Page</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">Page Name</label>
                        <input name="name" value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-3 py-2 border rounded" required placeholder="e.g., Summer Campaign Opt-in" />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="thankYouPageId">Redirect to Thank You Page</label>
                        <select name="thankYouPageId" value={thankYouPageId} onChange={e => setThankYouPageId(e.target.value)} className="w-full px-3 py-2 border rounded bg-white text-slate-900" required>
                            <option value="" disabled>Select a page...</option>
                            {thankYouPages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Create Page</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};


// --- Main Component ---
interface LandingPagesProps {
    landingPages: LandingPage[];
    thankYouPages: ThankYouPage[];
    onSaveLandingPage: (page: LandingPage) => void;
    onSaveThankYouPage: (page: ThankYouPage) => void;
    onDeleteThankYouPage: (pageId: string) => void;
    onAddNewLead: (newLeadData: Omit<Lead, 'id' | 'status' | 'dateAdded'>) => void;
    onAddLandingPage: (pageData: { name: string; thankYouPageId: string }) => void;
}

const LandingPages: React.FC<LandingPagesProps> = ({ landingPages, thankYouPages, onSaveLandingPage, onSaveThankYouPage, onDeleteThankYouPage, onAddNewLead, onAddLandingPage }) => {
    const [modalView, setModalView] = useState<'none' | 'form' | 'thanks'>('none');
    const [selectedPageForSim, setSelectedPageForSim] = useState<LandingPage | null>(null);
    const [activeTab, setActiveTab] = useState<'opt-in' | 'thank-you'>('opt-in');
    
    const [isEditLpModalOpen, setIsEditLpModalOpen] = useState(false);
    const [editingLp, setEditingLp] = useState<LandingPage | null>(null);

    const [isManageTyModalOpen, setIsManageTyModalOpen] = useState(false);
    const [editingTyPage, setEditingTyPage] = useState<ThankYouPage | null>(null);
    
    const [isAddLpModalOpen, setIsAddLpModalOpen] = useState(false);
    const [tyPageToDelete, setTyPageToDelete] = useState<ThankYouPage | null>(null);


    const handleFormSubmit = (leadData: Omit<Lead, 'id' | 'status' | 'dateAdded'>) => {
        onAddNewLead(leadData);
        setModalView('thanks');
    };
    
    const showLeadForm = (page: LandingPage) => {
        setSelectedPageForSim(page);
        setModalView('form');
    }

    const closeSimulationModal = () => {
        setModalView('none');
        setSelectedPageForSim(null);
    }
    
    const openLpEditModal = (page: LandingPage) => {
        setEditingLp(page);
        setIsEditLpModalOpen(true);
    };

    const openTyPageModal = (page: ThankYouPage | null) => {
        setEditingTyPage(page);
        setIsManageTyModalOpen(true);
    }
    
    const confirmDeleteThankYouPage = () => {
        if (tyPageToDelete) {
            onDeleteThankYouPage(tyPageToDelete.id);
            setTyPageToDelete(null);
        }
    };

    const OptInPagesView: React.FC = () => {
        const getThankYouPageName = (id: string) => thankYouPages.find(p => p.id === id)?.name || 'Not Linked';
        return (
            <div>
                <div className="flex justify-end mb-4">
                    <button onClick={() => setIsAddLpModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                        + Add Opt-in Page
                    </button>
                </div>
                <div className="space-y-4">
                    {landingPages.map(page => (
                        <div key={page.id} className="group p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-800">{page.name}</p>
                                    <button onClick={() => openLpEditModal(page)} className="text-slate-400 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <EditIcon />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-500">Redirects to: <span className="font-medium text-slate-700">{getThankYouPageName(page.thankYouPageId)}</span></p>
                                <p className="text-sm text-slate-500">Created: {page.createdDate} | Leads: {page.leadsCount}</p>
                            </div>
                            <div className="flex gap-2 self-end sm:self-center">
                                <button onClick={() => showLeadForm(page)} className="bg-sky-100 text-sky-700 font-medium py-1 px-3 rounded-md hover:bg-sky-200 text-sm">
                                    View Opt-in Form
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    };
    
    const ThankYouPagesView: React.FC = () => (
        <div>
            <div className="flex justify-end mb-4">
                 <button onClick={() => openTyPageModal(null)} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                    + Create Thank You Page
                </button>
            </div>
            <div className="space-y-4">
                {thankYouPages.map(page => (
                    <div key={page.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-800">{page.name}</p>
                            <p className="text-sm text-slate-500">Path: {page.path}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => openTyPageModal(page)} className="text-slate-500 hover:text-sky-600 p-1"><EditIcon /></button>
                            <button onClick={() => setTyPageToDelete(page)} className="text-slate-500 hover:text-red-600 p-1"><DeleteIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Landing Pages</h3>
                 <div className="flex space-x-2 border-b mb-6 pb-2">
                    <TabButton label="Opt-in Pages" isActive={activeTab === 'opt-in'} onClick={() => setActiveTab('opt-in')} />
                    <TabButton label="Thank-You Pages" isActive={activeTab === 'thank-you'} onClick={() => setActiveTab('thank-you')} />
                </div>

                {activeTab === 'opt-in' ? <OptInPagesView /> : <ThankYouPagesView />}
            </div>

            {/* Simulation Modals */}
            {modalView === 'form' && selectedPageForSim && (
                <Modal onClose={closeSimulationModal}>
                    <LeadCaptureForm onFormSubmit={handleFormSubmit} onBack={closeSimulationModal} />
                </Modal>
            )}
            {modalView === 'thanks' && selectedPageForSim && (
                <Modal onClose={closeSimulationModal}>
                    <ThankYouPageSimulation onBack={closeSimulationModal} thankYouPageName={thankYouPages.find(p => p.id === selectedPageForSim.thankYouPageId)?.name} />
                </Modal>
            )}

            {/* Editing Modals */}
            <AddLandingPageModal
                isOpen={isAddLpModalOpen}
                onClose={() => setIsAddLpModalOpen(false)}
                onSave={(pageData) => { onAddLandingPage(pageData); setIsAddLpModalOpen(false); }}
                thankYouPages={thankYouPages}
            />
            <EditLandingPageModal 
                isOpen={isEditLpModalOpen}
                onClose={() => setIsEditLpModalOpen(false)}
                onSave={(page) => { onSaveLandingPage(page); setIsEditLpModalOpen(false); }}
                page={editingLp}
                thankYouPages={thankYouPages}
            />
            <ManageThankYouPageModal
                isOpen={isManageTyModalOpen}
                onClose={() => setIsManageTyModalOpen(false)}
                onSave={(page) => { onSaveThankYouPage(page); setIsManageTyModalOpen(false); }}
                page={editingTyPage}
            />
            <ConfirmationModal
                isOpen={!!tyPageToDelete}
                onClose={() => setTyPageToDelete(null)}
                onConfirm={confirmDeleteThankYouPage}
                title="Confirm Thank You Page Deletion"
                message={<p>Are you sure you want to delete the page "<strong>{tyPageToDelete?.name}</strong>"?</p>}
            />
        </>
    );
};

export default LandingPages;