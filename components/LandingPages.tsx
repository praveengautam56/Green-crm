
import React, { useState } from 'react';
import { LandingPage, Lead } from '../types';

// Standalone component for the Thank You page
const ThankYouPage: React.FC<{ onBack: () => void; landingPageName: string }> = ({ onBack, landingPageName }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-center text-sky-600 mb-2">Thank You!</h3>
        <p className="text-center text-slate-600 mb-6">Your details for the "{landingPageName}" have been submitted. Book a meeting with us below.</p>
        <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-4">Schedule Your Meeting</h4>
            {/* This is a mock calendar embed */}
            <div className="bg-slate-100 p-10 text-center rounded-md">
                <p className="font-medium">Meeting Calendar Placeholder</p>
                <p className="text-sm text-slate-500">A full calendar component like Calendly would be embedded here.</p>
            </div>
        </div>
        <button onClick={onBack} className="mt-6 w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">
            Back to Landing Page Management
        </button>
    </div>
);

// Standalone component for the lead capture form
const LeadCaptureForm: React.FC<{
    onFormSubmit: (leadData: Omit<Lead, 'id' | 'status' | 'dateAdded'>) => void;
    onBack: () => void;
}> = ({ onFormSubmit, onBack }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newLeadData = {
            name: formData.get('fullName') as string,
            mobile: formData.get('mobileNumber') as string,
            profession: formData.get('profession') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
        };
        onFormSubmit(newLeadData);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Simulated Landing Page Form</h3>
            <form onSubmit={handleSubmit}>
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
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="profession">Profession/Job Title</label>
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

const MOCK_THANK_YOU_PAGES = [
    { id: 'TY001', name: 'Standard Thank You Page', linkedPage: 'Winter Offer Campaign', path: '/thank-you-winter' },
    { id: 'TY002', name: 'Ebook Download Thanks', linkedPage: 'Ebook Download', path: '/thank-you-ebook' },
];

const ThankYouPagesView: React.FC = () => (
    <div>
        <div className="space-y-4">
            {MOCK_THANK_YOU_PAGES.map(page => (
                <div key={page.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-slate-800">{page.name}</p>
                        <p className="text-sm text-slate-500">Path: {page.path}</p>
                        <p className="text-sm text-slate-500">Linked to Opt-in: {page.linkedPage}</p>
                    </div>
                    <button className="bg-slate-100 text-slate-700 font-medium py-1 px-3 rounded-md hover:bg-slate-200">
                        Edit
                    </button>
                </div>
            ))}
        </div>
    </div>
);


interface LandingPagesProps {
    landingPages: LandingPage[];
    setLandingPages: React.Dispatch<React.SetStateAction<LandingPage[]>>;
    onAddNewLead: (newLeadData: Omit<Lead, 'id' | 'status' | 'dateAdded'>) => void;
}

const LandingPages: React.FC<LandingPagesProps> = ({ landingPages, onAddNewLead }) => {
    const [view, setView] = useState<'list' | 'form' | 'thanks'>('list');
    const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
    const [activeTab, setActiveTab] = useState<'opt-in' | 'thank-you'>('opt-in');

    const handleFormSubmit = (leadData: Omit<Lead, 'id' | 'status' | 'dateAdded'>) => {
        onAddNewLead(leadData);
        setView('thanks');
    };
    
    const showLeadForm = (page: LandingPage) => {
        setSelectedPage(page);
        setView('form');
    }

    const resetToListView = () => {
        setView('list');
        setSelectedPage(null);
    }

    if (view === 'form') {
        return <LeadCaptureForm onFormSubmit={handleFormSubmit} onBack={resetToListView} />;
    }

    if (view === 'thanks' && selectedPage) {
        return <ThankYouPage onBack={resetToListView} landingPageName={selectedPage.name} />;
    }

    const OptInPagesView: React.FC = () => (
         <div className="space-y-4">
            {landingPages.map(page => (
                <div key={page.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-slate-800">{page.name}</p>
                        <p className="text-sm text-slate-500">Redirect (Opt-in) URL: {page.redirectUrl}</p>
                        <p className="text-sm text-slate-500">Created: {page.createdDate} | Leads: {page.leadsCount}</p>
                    </div>
                    <button onClick={() => showLeadForm(page)} className="bg-sky-100 text-sky-700 font-medium py-1 px-3 rounded-md hover:bg-sky-200">
                        View Opt-in Form
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Landing Pages</h3>
             <div className="flex space-x-2 border-b mb-6 pb-2">
                <TabButton label="Opt-in Pages" isActive={activeTab === 'opt-in'} onClick={() => setActiveTab('opt-in')} />
                <TabButton label="Thank-You Pages" isActive={activeTab === 'thank-you'} onClick={() => setActiveTab('thank-you')} />
            </div>

            {activeTab === 'opt-in' ? <OptInPagesView /> : <ThankYouPagesView />}
        </div>
    );
};

export default LandingPages;
