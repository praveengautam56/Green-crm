
import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus } from '../types';
import { CallIcon } from '../constants';

interface LeadsProps {
    leads: Lead[];
    onAddNewLead: (newLeadData: Omit<Lead, 'id' | 'status' | 'dateAdded'>) => void;
    leadStatuses: LeadStatus[];
    setLeadStatuses: (statuses: LeadStatus[]) => void;
    onDeleteLeads: (leadIds: string[]) => void;
    onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

const STATUS_COLOR_MAP: { [key in LeadStatus['color']]: string } = {
  sky: 'bg-sky-100 text-sky-800 border-sky-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  amber: 'bg-amber-100 text-amber-800 border-amber-300',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  slate: 'bg-slate-100 text-slate-800 border-slate-300',
};

const getStatusBadgeClass = (statusName: string, statuses: LeadStatus[]) => {
    const status = statuses.find(s => s.name === statusName);
    const colorClass = status ? STATUS_COLOR_MAP[status.color] : STATUS_COLOR_MAP['slate'];
    return colorClass || STATUS_COLOR_MAP['slate'];
};

const formatDateAdded = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString; // Return original string if it's not a valid date
    }

    // For old data that might be just 'YYYY-MM-DD'
    if (!dateString.includes('T')) {
        const [year, month, day] = dateString.split('-').map(Number);
        // Using UTC methods to display the date as it was intended, without timezone shift.
        const utcDate = new Date(Date.UTC(year, month - 1, day));
         return utcDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });
    }

    // For new data with full ISO string, format with local time.
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

const AddLeadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddLead: (newLeadData: Omit<Lead, 'id' | 'status' | 'dateAdded'>) => void;
}> = ({ isOpen, onClose, onAddLead }) => {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newLeadData = {
            name: formData.get('name') as string,
            mobile: formData.get('mobile') as string,
            profession: formData.get('profession') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
        };
        onAddLead(newLeadData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-800">Add New Lead</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
                            <input name="name" type="text" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                        </div>
                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="mobile">Mobile Number</label>
                             <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span className="text-slate-500 sm:text-sm">+91</span>
                                </div>
                                <input name="mobile" type="tel" className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" required pattern="\d{10}" title="Please enter a 10-digit mobile number" placeholder="9876543210" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="profession">Profession</label>
                            <input name="profession" type="text" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="city">City</label>
                            <input name="city" type="text" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="state">State</label>
                            <input name="state" type="text" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Add Lead</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManageStatusesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    statuses: LeadStatus[];
    setStatuses: (statuses: LeadStatus[]) => void;
}> = ({ isOpen, onClose, statuses, setStatuses }) => {
    if (!isOpen) return null;

    const handleAddStatus = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const color = formData.get('color') as LeadStatus['color'];
        if (name && color && !statuses.some(s => s.name.toLowerCase() === name.toLowerCase())) {
            setStatuses([...statuses, { name, color }]);
            e.currentTarget.reset();
        }
    };
    
    const handleDeleteStatus = (name: string) => {
        setStatuses(statuses.filter(s => s.name !== name));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-800">Manage Lead Statuses</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>
                <div>
                    <h4 className="text-md font-semibold text-slate-700 mb-2">Add New Status</h4>
                    <form onSubmit={handleAddStatus} className="flex items-center gap-2 mb-6">
                        <input name="name" placeholder="Status Name" className="w-full px-3 py-2 border rounded-md" required />
                        <select name="color" className="px-3 py-2 border rounded-md" defaultValue="slate">
                            {Object.keys(STATUS_COLOR_MAP).map(color => <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>)}
                        </select>
                        <button type="submit" className="bg-sky-500 text-white font-bold p-2 rounded-md">+</button>
                    </form>

                    <h4 className="text-md font-semibold text-slate-700 mb-2">Existing Statuses</h4>
                    <ul className="space-y-2">
                        {statuses.map(status => (
                            <li key={status.name} className="flex justify-between items-center p-2 rounded-md bg-slate-50">
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR_MAP[status.color]}`}>{status.name}</span>
                                <button onClick={() => handleDeleteStatus(status.name)} className="text-red-500 font-bold text-lg">&times;</button>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Done</button>
                </div>
            </div>
        </div>
    );
};

const FilterLeadsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    filters: { status: string; city: string; date: string; };
    setFilterStatus: (value: string) => void;
    setFilterCity: (value: string) => void;
    setFilterDate: (value: string) => void;
    clearFilters: () => void;
    leadStatuses: LeadStatus[];
    uniqueCities: string[];
}> = ({
    isOpen,
    onClose,
    filters,
    setFilterStatus,
    setFilterCity,
    setFilterDate,
    clearFilters,
    leadStatuses,
    uniqueCities
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start pt-20 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-slate-800">Filter Leads</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border">
                     <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                        <select id="status-filter" value={filters.status} onChange={e => setFilterStatus(e.target.value)} className="w-full p-2 border rounded-md bg-white text-slate-900">
                            <option value="all">All Statuses</option>
                            {leadStatuses.map(status => <option key={status.name} value={status.name}>{status.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="city-filter" className="block text-sm font-medium text-slate-600 mb-1">City</label>
                        <select id="city-filter" value={filters.city} onChange={e => setFilterCity(e.target.value)} className="w-full p-2 border rounded-md bg-white text-slate-900">
                            <option value="all">All Cities</option>
                            {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date-filter" className="block text-sm font-medium text-slate-600 mb-1">Date Added</label>
                        <select id="date-filter" value={filters.date} onChange={e => setFilterDate(e.target.value)} className="w-full p-2 border rounded-md bg-white text-slate-900">
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={clearFilters} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    count: number;
}> = ({ isOpen, onClose, onConfirm, count }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-slate-800">Confirm Deletion</h3>
                <p className="text-slate-600 mt-4">
                    Are you sure you want to delete {count} selected lead{count > 1 ? 's' : ''}? This action cannot be undone.
                </p>
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

const ChangeStatusModal: React.FC<{
    lead: Lead | null;
    statuses: LeadStatus[];
    onClose: () => void;
    onSave: (leadId: string, newStatus: string) => void;
}> = ({ lead, statuses, onClose, onSave }) => {
    if (!lead) return null;

    const [selectedStatus, setSelectedStatus] = useState(lead.status);

    const handleSave = () => {
        onSave(lead.id, selectedStatus);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-slate-800">Change Lead Status</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>
                <p className="text-slate-600 mb-6">
                    Updating status for lead: <span className="font-semibold text-slate-800">{lead.name}</span>
                </p>
                
                <div>
                    <label htmlFor="status-select" className="block text-slate-700 text-sm font-bold mb-2">New Status</label>
                    <select 
                        id="status-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        {statuses.map(status => (
                            <option key={status.name} value={status.name}>{status.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Save Status</button>
                </div>
            </div>
        </div>
    );
};


const Leads: React.FC<LeadsProps> = ({ leads, onAddNewLead, leadStatuses, setLeadStatuses, onDeleteLeads, onUpdateLead }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [statusChangeTarget, setStatusChangeTarget] = useState<Lead | null>(null);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCity, setFilterCity] = useState('all');
    const [filterDate, setFilterDate] = useState('all');

    const leadsPerPage = 10;

    const uniqueCities = useMemo(() => [...new Set(leads.map(lead => lead.city).filter(Boolean))], [leads]);
    
    // The `leads` prop is now pre-sorted with the newest leads first from crmService.
    const filteredLeads = useMemo(() => {
        let filtered = leads;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(lead => lead.status === filterStatus);
        }

        if (filterCity !== 'all') {
            filtered = filtered.filter(lead => lead.city === filterCity);
        }

        if (filterDate !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            filtered = filtered.filter(lead => {
                const leadDate = new Date(lead.dateAdded);
                if (isNaN(leadDate.getTime())) return false; // Invalid date

                switch (filterDate) {
                    case 'today':
                        return leadDate >= today;
                    case '7d':
                        const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return leadDate >= last7Days;
                    case '30d':
                        const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return leadDate >= last30Days;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [leads, filterStatus, filterCity, filterDate]);

    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        setSelectedLeads([]);
    };

    const handleSelectLead = (leadId: string) => {
        setSelectedLeads(prev =>
            prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedLeads(currentLeads.map(lead => lead.id));
        } else {
            setSelectedLeads([]);
        }
    };
    
    const handleClearFilters = () => {
        setFilterStatus('all');
        setFilterCity('all');
        setFilterDate('all');
    };

    const confirmDelete = () => {
        onDeleteLeads(selectedLeads);
        setSelectedLeads([]);
        setIsDeleteModalOpen(false);
    };

    const handleStatusSave = (leadId: string, newStatus: string) => {
        onUpdateLead(leadId, { status: newStatus });
    };

    return (
        <>
            <AddLeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddLead={onAddNewLead} />
            <ManageStatusesModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} statuses={leadStatuses} setStatuses={setLeadStatuses} />
            <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} count={selectedLeads.length} />
             <ChangeStatusModal 
                lead={statusChangeTarget} 
                statuses={leadStatuses} 
                onClose={() => setStatusChangeTarget(null)} 
                onSave={handleStatusSave} 
            />
            <FilterLeadsModal 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                filters={{ status: filterStatus, city: filterCity, date: filterDate }}
                setFilterStatus={setFilterStatus}
                setFilterCity={setFilterCity}
                setFilterDate={setFilterDate}
                clearFilters={handleClearFilters}
                leadStatuses={leadStatuses}
                uniqueCities={uniqueCities}
            />
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-semibold text-slate-800">All Leads</h3>
                        <span className="bg-slate-200 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full">
                            {filteredLeads.length} / {leads.length} Total
                        </span>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                         {selectedLeads.length > 0 && (
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-opacity"
                            >
                                Delete ({selectedLeads.length})
                            </button>
                        )}
                        <button onClick={() => setIsFilterModalOpen(true)} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">
                            Filter Leads
                        </button>
                        <button onClick={() => setIsStatusModalOpen(true)} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">
                            Manage Statuses
                        </button>
                        <button onClick={() => setIsAddModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">
                            + Add New Lead
                        </button>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {currentLeads.map(lead => (
                         <div key={lead.id} className={`p-3 rounded-lg shadow-sm border-l-4 ${getStatusBadgeClass(lead.status, leadStatuses).split(' ')[2]}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 text-sky-600 rounded"
                                        checked={selectedLeads.includes(lead.id)}
                                        onChange={() => handleSelectLead(lead.id)}
                                    />
                                    <div>
                                        <p className="font-bold text-slate-800">{lead.name}</p>
                                        <p className="text-sm text-slate-600">{lead.profession}</p>
                                    </div>
                                </div>
                                 <button onClick={() => setStatusChangeTarget(lead)} className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-transform hover:scale-105 ${getStatusBadgeClass(lead.status, leadStatuses)}`}>
                                    {lead.status}
                                </button>
                            </div>
                            <div className="mt-2 text-sm text-slate-500 space-y-1">
                                <p><strong>Mobile:</strong> +91 {lead.mobile}</p>
                                <p><strong>Location:</strong> {lead.city}, {lead.state}</p>
                                <p><strong>Added:</strong> {formatDateAdded(lead.dateAdded)}</p>
                            </div>
                             <div className="mt-3 flex items-center justify-end">
                                <a href={`tel:+91${lead.mobile}`} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                                    <CallIcon />
                                    <span>Call</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input type="checkbox" className="w-4 h-4 text-sky-600 rounded" onChange={handleSelectAll} checked={currentLeads.length > 0 && selectedLeads.length === currentLeads.length} />
                                </th>
                                <th scope="col" className="px-6 py-3">Date Added</th>
                                <th scope="col" className="px-6 py-3">Full Name</th>
                                <th scope="col" className="px-6 py-3">Mobile Number</th>
                                <th scope="col" className="px-6 py-3">Profession</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLeads.map((lead) => (
                                <tr key={lead.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="w-4 p-4">
                                        <input type="checkbox" className="w-4 h-4 text-sky-600 rounded" checked={selectedLeads.includes(lead.id)} onChange={() => handleSelectLead(lead.id)} />
                                    </td>
                                    <td className="px-6 py-4">{formatDateAdded(lead.dateAdded)}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{lead.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span>+91 {lead.mobile}</span>
                                            <a href={`tel:+91${lead.mobile}`} className="text-sky-500 hover:text-sky-700">
                                                <CallIcon />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{lead.profession}</td>
                                    <td className="px-6 py-4">{lead.city}, {lead.state}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setStatusChangeTarget(lead)} className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-transform hover:scale-105 ${getStatusBadgeClass(lead.status, leadStatuses)}`}>
                                            {lead.status}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLeads.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>No leads found.</p>
                    </div>
                )}


                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-6 gap-y-4 mt-4">
                    <span className="text-sm text-slate-600">
                        Showing {filteredLeads.length > 0 ? indexOfFirstLead + 1 : 0} to {Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length} leads
                    </span>
                    {totalPages > 1 && (
                         <div className="flex items-center gap-2">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold">Previous</button>
                            <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold">Next</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Leads;