
import React, { useState } from 'react';
import { Meeting } from '../types';

const ManageEventModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
     if (!isOpen) return null;
     const [availability, setAvailability] = useState({
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '09:00',
        endTime: '17:00',
        noticePeriod: 24, // in hours
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-800">Manage Event Settings</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>
                <form className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Available Days</label>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                 <div key={day} className="flex items-center">
                                     <input type="checkbox" id={day} defaultChecked={availability.days.some(d => d.startsWith(day))} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                                     <label htmlFor={day} className="ml-2 text-sm text-slate-600">{day}</label>
                                 </div>
                             ))}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Available Time</label>
                        <div className="flex items-center gap-2 mt-1">
                             <input type="time" defaultValue={availability.startTime} className="w-full p-2 border rounded-md" />
                             <span>to</span>
                             <input type="time" defaultValue={availability.endTime} className="w-full p-2 border rounded-md" />
                        </div>
                     </div>
                      <div>
                        <label htmlFor="notice" className="block text-sm font-medium text-slate-700">Minimum Notice Period</label>
                         <div className="relative mt-1 rounded-md shadow-sm">
                            <input type="number" id="notice" defaultValue={availability.noticePeriod} className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-sky-500 focus:ring-sky-500 sm:text-sm" placeholder="24" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-500 sm:text-sm">hours</span>
                            </div>
                        </div>
                     </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ScheduleMeetingModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    onAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
}> = ({ isOpen, onClose, onAddMeeting }) => {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newMeeting = {
            title: formData.get('title') as string,
            attendee: formData.get('attendee') as string,
            startTime: new Date(formData.get('startTime') as string),
            endTime: new Date(formData.get('endTime') as string),
        };
        onAddMeeting(newMeeting);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-800">Schedule New Meeting</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="title">Meeting Title</label>
                        <input name="title" type="text" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="attendee">Attendee Name</label>
                        <input name="attendee" type="text" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="startTime">Start Time</label>
                        <input name="startTime" type="datetime-local" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="endTime">End Time</label>
                        <input name="endTime" type="datetime-local" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Schedule Meeting</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface CalendarProps {
    meetings: Meeting[];
    onAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
}

const Calendar: React.FC<CalendarProps> = ({ meetings, onAddMeeting }) => {
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    
    const now = new Date();
    const upcomingMeetings = meetings.filter(m => m.startTime >= now).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const pastMeetings = meetings.filter(m => m.startTime < now).sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    const meetingsToShow = activeTab === 'upcoming' ? upcomingMeetings : pastMeetings;

    return (
        <>
            <ManageEventModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} />
            <ScheduleMeetingModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} onAddMeeting={onAddMeeting} />

            <div className="bg-white p-6 rounded-xl shadow-md">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
                    <h3 className="text-xl font-semibold text-slate-800">Meeting Calendar</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setIsScheduleModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                            + Schedule Meeting
                        </button>
                         <button onClick={() => setIsManageModalOpen(true)} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg text-sm">
                            Manage Event
                        </button>
                    </div>
                </div>
                 <div className="border-b border-slate-200 mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'upcoming' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Upcoming
                        </button>
                        <button
                             onClick={() => setActiveTab('past')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'past' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            Past
                        </button>
                    </nav>
                </div>
                <div className="space-y-4">
                    {meetingsToShow.length > 0 ? meetingsToShow.map(meeting => (
                        <div key={meeting.id} className="p-4 border-l-4 border-sky-500 bg-slate-50 rounded-r-lg">
                            <p className="font-semibold text-slate-800">{meeting.title}</p>
                            <p className="text-sm text-slate-600">With: {meeting.attendee}</p>
                            <p className="text-sm text-slate-500">
                                {meeting.startTime.toLocaleString()} - {meeting.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    )) : (
                        <p className="text-slate-500">No {activeTab} meetings.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Calendar;