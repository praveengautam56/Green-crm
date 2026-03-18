import React, { useState, useMemo, useEffect } from 'react';
import { Meeting, AvailabilitySettings, DayAvailability, BookingQuestion, QuestionType } from '../types';
// Fix: Import EditIcon.
import { DeleteIcon, EditIcon } from '../constants';

const DeleteMeetingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    meetingTitle: string;
}> = ({ isOpen, onClose, onConfirm, meetingTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-slate-800">Confirm Deletion</h3>
                <p className="text-slate-600 mt-4">
                    Are you sure you want to delete the meeting: <span className="font-semibold">{meetingTitle}</span>? This action cannot be undone.
                </p>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
                        Delete Meeting
                    </button>
                </div>
            </div>
        </div>
    );
};

const ManageEventModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: AvailabilitySettings | null;
    onSave: (newSettings: AvailabilitySettings) => void;
}> = ({ isOpen, onClose, settings, onSave }) => {
    if (!isOpen) return null;

    const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const DEFAULT_SCHEDULE = WEEKDAYS.reduce((acc, day) => {
        acc[day] = {
            enabled: !['Sunday', 'Saturday'].includes(day),
            startTime: '09:00',
            endTime: '17:00'
        };
        return acc;
    }, {} as { [key: string]: DayAvailability });

    const [schedule, setSchedule] = useState(settings?.schedule || DEFAULT_SCHEDULE);
    const [duration, setDuration] = useState(settings?.duration || 30);
    const [buffer, setBuffer] = useState(settings?.buffer || 15);
    const [bookingWindowDays, setBookingWindowDays] = useState(settings?.bookingWindowDays || 30);
    const [minBookingNoticeHours, setMinBookingNoticeHours] = useState(settings?.minBookingNoticeHours || 4);
    
    const [expandedSections, setExpandedSections] = useState({
        availability: true,
        timing: true,
        advanced: true,
    });

    const handleScheduleChange = (day: string, field: keyof DayAvailability, value: string | boolean) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...settings, schedule, duration, buffer, bookingWindowDays, minBookingNoticeHours });
        onClose();
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    );
    
    const CollapsibleSection: React.FC<{ title: string; sectionKey: keyof typeof expandedSections; children: React.ReactNode; }> = ({ title, sectionKey, children }) => (
        <div className="border border-slate-200 rounded-lg">
            <button type="button" onClick={() => toggleSection(sectionKey)} className="w-full flex justify-between items-center text-left p-3 bg-slate-50 rounded-lg hover:bg-slate-100 focus:outline-none">
                <span className="font-semibold text-slate-700">{title}</span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections[sectionKey] && (
                <div className="p-4 bg-white border-t border-slate-200 rounded-b-lg">
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-800">Manage Booking Availability</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <CollapsibleSection title="Available Days & Times" sectionKey="availability">
                        <div className="space-y-2">
                            {WEEKDAYS.map(day => (
                                <div key={day} className="p-2 rounded-md hover:bg-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input type="checkbox" id={day} checked={schedule[day].enabled} onChange={(e) => handleScheduleChange(day, 'enabled', e.target.checked)} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                                            <label htmlFor={day} className="ml-3 text-sm font-medium text-slate-700">{day}</label>
                                        </div>
                                        {schedule[day].enabled ? (
                                            <div className="flex items-center gap-2">
                                                <input type="time" value={schedule[day].startTime} onChange={e => handleScheduleChange(day, 'startTime', e.target.value)} className="w-full p-1 border rounded-md text-sm" />
                                                <span className="text-slate-500">-</span>
                                                <input type="time" value={schedule[day].endTime} onChange={e => handleScheduleChange(day, 'endTime', e.target.value)} className="w-full p-1 border rounded-md text-sm" />
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">Unavailable</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Meeting Duration & Buffer" sectionKey="timing">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">Meeting Duration</label>
                                <select id="duration" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2 bg-white">
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>60 minutes</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="buffer" className="block text-sm font-medium text-slate-700 mb-1">Buffer Time</label>
                                <div className="relative rounded-md shadow-sm">
                                    <input type="number" id="buffer" value={buffer} onChange={e => setBuffer(Number(e.target.value))} min="0" step="5" className="block w-full rounded-md border-slate-300 pl-3 pr-16 focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="text-slate-500 sm:text-sm">minutes</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>
                    
                    <CollapsibleSection title="Booking Window & Notice" sectionKey="advanced">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="bookingWindow" className="block text-sm font-medium text-slate-700 mb-1">Booking Window</label>
                                <div className="relative rounded-md shadow-sm">
                                    <input type="number" id="bookingWindow" value={bookingWindowDays} onChange={e => setBookingWindowDays(Number(e.target.value))} min="1" className="block w-full rounded-md border-slate-300 pl-3 pr-12 focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="text-slate-500 sm:text-sm">days</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Clients can book this far in advance.</p>
                            </div>
                            <div>
                                <label htmlFor="minNotice" className="block text-sm font-medium text-slate-700 mb-1">Minimum Notice</label>
                                <div className="relative rounded-md shadow-sm">
                                    <input type="number" id="minNotice" value={minBookingNoticeHours} onChange={e => setMinBookingNoticeHours(Number(e.target.value))} min="0" className="block w-full rounded-md border-slate-300 pl-3 pr-12 focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="text-slate-500 sm:text-sm">hours</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Prevent last-minute bookings.</p>
                            </div>
                        </div>
                    </CollapsibleSection>
                </form>
                <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="submit" form="manage-availability-form" onClick={handleSubmit} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuestionInput: React.FC<{
    question: BookingQuestion;
    value: string | string[];
    onChange: (value: string | string[]) => void;
}> = ({ question, value, onChange }) => {
    const handleCheckboxChange = (option: string, checked: boolean) => {
        const currentValue = (Array.isArray(value) ? value : []) as string[];
        if (checked) {
            onChange([...currentValue, option]);
        } else {
            onChange(currentValue.filter(item => item !== option));
        }
    };

    switch (question.type) {
        case 'text':
            return <input type="text" value={value as string || ''} onChange={(e) => onChange(e.target.value)} required={question.required} className="w-full px-3 py-2 border rounded-md" />;
        case 'textarea':
            return <textarea value={value as string || ''} onChange={(e) => onChange(e.target.value)} required={question.required} rows={3} className="w-full px-3 py-2 border rounded-md" />;
        case 'radio':
            return (
                <div className="space-y-2">
                    {question.options?.map(option => (
                        <label key={option} className="flex items-center">
                            <input type="radio" name={question.id} value={option} checked={value === option} onChange={(e) => onChange(e.target.value)} required={question.required} className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500"/>
                            <span className="ml-2 text-slate-700">{option}</span>
                        </label>
                    ))}
                </div>
            );
        case 'checkbox':
            return (
                 <div className="space-y-2">
                    {question.options?.map(option => (
                        <label key={option} className="flex items-center">
                            <input type="checkbox" value={option} checked={(Array.isArray(value) ? value : []).includes(option)} onChange={(e) => handleCheckboxChange(option, e.target.checked)} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                            <span className="ml-2 text-slate-700">{option}</span>
                        </label>
                    ))}
                </div>
            );
        case 'dropdown':
            return (
                <select value={value as string || ''} onChange={(e) => onChange(e.target.value)} required={question.required} className="w-full px-3 py-2 border rounded-md bg-white">
                    <option value="" disabled>Select an option</option>
                    {question.options?.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            );
        default: return null;
    }
};


const BookMeetingForClientModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onBookMeeting: (meetingData: Omit<Meeting, 'id'>) => void;
    date: Date;
    settings: AvailabilitySettings | null;
    meetings: Meeting[];
}> = ({ isOpen, onClose, onBookMeeting, date, settings, meetings }) => {
    if (!isOpen) return null;
    
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

    const questions = settings?.bookingQuestions || [];

    const availableTimeSlots = useMemo(() => {
        if (!settings || !date) return [];
        
        const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
        const daySchedule = settings.schedule[dayOfWeek];
        if (!daySchedule || !daySchedule.enabled) return [];

        const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
        
        const dayStartTime = new Date(date);
        dayStartTime.setHours(startHour, startMinute, 0, 0);
        
        const dayEndTime = new Date(date);
        dayEndTime.setHours(endHour, endMinute, 0, 0);

        const now = new Date();
        const minNoticeHours = settings.minBookingNoticeHours || 0;
        const earliestTimeByNotice = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);

        let effectiveStartTime = new Date(Math.max(dayStartTime.getTime(), earliestTimeByNotice.getTime()));

        const slotInterval = settings.duration;
        const minutes = effectiveStartTime.getMinutes();
        const remainder = minutes % slotInterval;
        if (remainder !== 0) {
            effectiveStartTime.setMinutes(minutes - remainder + slotInterval);
            effectiveStartTime.setSeconds(0,0);
        }

        let slotIterator = effectiveStartTime;
        const slots = [];
        
        while (slotIterator < dayEndTime) {
            const slotEnd = new Date(slotIterator.getTime() + settings.duration * 60000);

            if (slotEnd > dayEndTime) break;
            
            const isBooked = meetings.some(meeting => {
                const meetingStart = new Date(meeting.startTime);
                const meetingEnd = new Date(meeting.endTime);

                const blockedStartTime = new Date(meetingStart.getTime() - settings.buffer * 60000);
                const blockedEndTime = new Date(meetingEnd.getTime() + settings.buffer * 60000);

                return slotIterator < blockedEndTime && slotEnd > blockedStartTime;
            });

            if (!isBooked) {
                slots.push(new Date(slotIterator));
            }
            
            slotIterator = new Date(slotIterator.getTime() + slotInterval * 60000);
        }
        return slots;
    }, [date, settings, meetings]);

    const handleBookMeeting = (e: React.FormEvent) => {
        e.preventDefault();
        const clientName = (answers['clientName'] as string) || 'Unnamed Client';
        if (!clientName || !selectedTime || !settings) return;

        setIsBooking(true);
        const [hour, minute] = selectedTime.split(':').map(Number);
        const startTime = new Date(date);
        startTime.setHours(hour, minute, 0, 0);
        const endTime = new Date(startTime.getTime() + settings.duration * 60000);
        
        onBookMeeting({
            title: `Meeting with ${clientName}`,
            attendee: clientName,
            startTime,
            endTime,
            bookingAnswers: answers,
        });
        setIsBooking(false);
        onClose();
    };
    
     const handleAnswerChange = (questionId: string, value: string | string[]) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-slate-800">Book for Client</h3>
                <p className="text-slate-600 mt-1 mb-4">
                    Date: <span className="font-semibold">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </p>

                {!selectedTime ? (
                    <div className="max-h-60 overflow-y-auto pr-2">
                        <p className="text-sm font-medium text-slate-700 mb-2">Select an available time slot:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {availableTimeSlots.length > 0 ? availableTimeSlots.map(slot => (
                                <button key={slot.toISOString()} onClick={() => setSelectedTime(slot.toTimeString().substring(0,5))} className="w-full p-2 border rounded-lg hover:bg-sky-500 hover:text-white transition-colors text-slate-800">
                                    {slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </button>
                            )) : <p className="col-span-2 text-center text-slate-500">No available slots on this day.</p>}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleBookMeeting} className="space-y-4">
                        <p className="text-center text-slate-600">Confirm booking for <span className="font-semibold text-sky-600">{selectedTime}</span></p>

                        {questions.map(q => (
                             <div key={q.id}>
                                <label className="block text-sm font-bold mb-2 text-slate-700">
                                    {q.label} {q.required && <span className="text-red-500">*</span>}
                                </label>
                                <QuestionInput question={q} value={answers[q.id]} onChange={(value) => handleAnswerChange(q.id, value)} />
                            </div>
                        ))}

                        <div className="mt-4 flex gap-2">
                            <button type="button" onClick={() => setSelectedTime(null)} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Back</button>
                            <button type="submit" disabled={isBooking} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-sky-300">
                                {isBooking ? 'Booking...' : 'Confirm'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

const ManageBookingQuestionsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: AvailabilitySettings | null;
    onSave: (newSettings: AvailabilitySettings) => void;
}> = ({ isOpen, onClose, settings, onSave }) => {
    if (!isOpen) return null;

    const [questions, setQuestions] = useState<BookingQuestion[]>(settings?.bookingQuestions || []);
    const [editingQuestion, setEditingQuestion] = useState<Partial<BookingQuestion> & { optionsStr?: string }>({ label: '', type: 'text', required: true });

    const handleSave = () => {
        if (!settings) return;
        const finalSettings = {
            ...settings,
            bookingQuestions: questions,
        };
        onSave(finalSettings);
        onClose();
    };

    const addOrUpdateQuestion = () => {
        if (!editingQuestion.label) return;

        // Base properties for any question type
        const newBaseQuestion: Omit<BookingQuestion, 'id' | 'options'> = {
            label: editingQuestion.label,
            type: editingQuestion.type || 'text',
            required: editingQuestion.required || false,
        };
        
        let newQuestionData: Omit<BookingQuestion, 'id'>;

        // Conditionally add 'options' property for relevant types
        if (['radio', 'checkbox', 'dropdown'].includes(editingQuestion.type || '')) {
            newQuestionData = {
                ...newBaseQuestion,
                options: (editingQuestion.optionsStr || '').split('\n').map(s => s.trim()).filter(Boolean),
            };
        } else {
            newQuestionData = newBaseQuestion;
        }

        if (editingQuestion.id) { // Update existing question
            setQuestions(questions.map(q => {
                if (q.id === editingQuestion.id) {
                    // Reconstruct the object to ensure old 'options' are removed if the type changed
                    return {
                        id: q.id,
                        ...newQuestionData
                    };
                }
                return q;
            }));
        } else { // Add a new question
            setQuestions([...questions, { id: `q${Date.now()}`, ...newQuestionData }]);
        }

        // Reset the form
        setEditingQuestion({ label: '', type: 'text', required: true, optionsStr: '' });
    };

    const editQuestion = (question: BookingQuestion) => {
        setEditingQuestion({ ...question, optionsStr: (question.options || []).join('\n') });
    };

    const deleteQuestion = (id: string) => {
        if (id === 'clientName') {
            alert("The 'Full Name' question is required for booking and cannot be deleted. You can edit the label if you wish.");
            return;
        }
        setQuestions(questions.filter(q => q.id !== id));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-800">Manage Booking Questions</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh]">
                    {/* Left: Question Editor */}
                    <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                        <h4 className="font-semibold text-lg text-slate-800">{editingQuestion.id ? 'Edit Question' : 'Add New Question'}</h4>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Question Label</label>
                            <input type="text" value={editingQuestion.label} onChange={e => setEditingQuestion({ ...editingQuestion, label: e.target.value })} className="w-full p-2 border rounded-md" placeholder="e.g., What's your business name?"/>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Answer Type</label>
                                <select value={editingQuestion.type} onChange={e => setEditingQuestion({ ...editingQuestion, type: e.target.value as QuestionType })} className="w-full p-2 border rounded-md bg-white">
                                    <option value="text">One Line Answer</option>
                                    <option value="textarea">Multiline Answer</option>
                                    <option value="radio">Radio Options</option>
                                    <option value="checkbox">Checkbox Options</option>
                                    <option value="dropdown">Dropdown List</option>
                                </select>
                            </div>
                             <div className="pt-6">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={editingQuestion.required} onChange={e => setEditingQuestion({ ...editingQuestion, required: e.target.checked })} className="h-4 w-4 text-sky-600 border-slate-300 rounded"/>
                                    <span className="ml-2 text-slate-700">Required</span>
                                </label>
                            </div>
                        </div>

                        {['radio', 'checkbox', 'dropdown'].includes(editingQuestion.type || '') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Options (one per line)</label>
                                <textarea value={editingQuestion.optionsStr} onChange={e => setEditingQuestion({ ...editingQuestion, optionsStr: e.target.value })} rows={4} className="w-full p-2 border rounded-md" />
                            </div>
                        )}
                        <div className="flex gap-2">
                             <button onClick={addOrUpdateQuestion} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">{editingQuestion.id ? 'Update Question' : 'Add Question'}</button>
                             {editingQuestion.id && <button onClick={() => setEditingQuestion({ label: '', type: 'text', required: true })} className="w-full bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel Edit</button>}
                        </div>
                    </div>
                    
                    {/* Right: Question List */}
                    <div className="space-y-3 overflow-y-auto pr-2">
                        {questions.length > 0 ? questions.map(q => (
                            <div key={q.id} className="p-3 border rounded-lg flex justify-between items-center bg-white">
                                <div>
                                    <p className="font-semibold text-slate-800">{q.label} {q.required && <span className="text-red-500">*</span>}</p>
                                    <p className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">{q.type}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => editQuestion(q)} className="text-slate-500 hover:text-sky-600"><EditIcon /></button>
                                    {q.id !== 'clientName' && (
                                        <button onClick={() => deleteQuestion(q.id)} className="text-slate-500 hover:text-red-600"><DeleteIcon /></button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-slate-500 p-8">No questions added yet.</div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Save Questions</button>
                </div>
            </div>
        </div>
    );
};


const ShareLinkModal: React.FC<{ isOpen: boolean; onClose: () => void; link: string }> = ({ isOpen, onClose, link }) => {
    if (!isOpen) return null;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                 <h3 className="text-xl font-semibold text-slate-800">Share Your Booking Link</h3>
                 <p className="text-slate-600 mt-2">Share this link with your clients to let them book a meeting with you.</p>
                 <div className="mt-4 flex items-center gap-2 p-2 border rounded-lg bg-slate-50">
                    <input type="text" readOnly value={link} className="w-full bg-transparent outline-none text-slate-700"/>
                    <button onClick={handleCopy} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex-shrink-0">
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                 </div>
                 <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Close</button>
                 </div>
            </div>
        </div>
    );
};


interface CalendarProps {
    meetings: Meeting[];
    onAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
    onDeleteMeeting: (meetingId: string) => void;
    availabilitySettings: AvailabilitySettings | null;
    onUpdateAvailability: (settings: AvailabilitySettings) => void;
    userId: string;
}

const Calendar: React.FC<CalendarProps> = ({ meetings, onAddMeeting, onDeleteMeeting, availabilitySettings, onUpdateAvailability, userId }) => {
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
    const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookingDate, setBookingDate] = useState<Date | null>(null);

    const ChevronLeftIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    );

    const ChevronRightIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
    );
    
    const now = new Date();
    const upcomingMeetings = meetings.filter(m => m.startTime >= now).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const pastMeetings = meetings.filter(m => m.startTime < now).sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    const meetingsToShow = activeTab === 'upcoming' ? upcomingMeetings : pastMeetings;
    const bookingLink = `${window.location.origin}?booking=${userId}`;

    const handleDeleteClick = (meeting: Meeting) => {
        setMeetingToDelete(meeting);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (meetingToDelete) {
            onDeleteMeeting(meetingToDelete.id);
            setIsDeleteModalOpen(false);
            setMeetingToDelete(null);
        }
    };
    
    const groupedMeetings = useMemo(() => {
        return meetingsToShow.reduce((acc: Record<string, Meeting[]>, meeting) => {
            const dateKey = meeting.startTime.toDateString();
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(meeting);
            return acc;
        }, {});
    }, [meetingsToShow]);

    const formatDateHeader = (dateString: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const meetingDate = new Date(dateString);
        meetingDate.setHours(0, 0, 0, 0);

        if (meetingDate.getTime() === today.getTime()) {
            return `Today, ${meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
        }
        if (meetingDate.getTime() === tomorrow.getTime()) {
            return `Tomorrow, ${meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
        }
        if (meetingDate.getTime() === yesterday.getTime()) {
            return `Yesterday, ${meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
        }

        return meetingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    
    const calendarGrid = useMemo(() => {
        const days: { day: number; type: 'prev' | 'current' | 'next'; isBookable: boolean; isToday?: boolean; }[] = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Previous month's days
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({
                day: daysInPrevMonth - firstDayOfMonth + 1 + i,
                type: 'prev',
                isBookable: false
            });
        }

        const today = new Date();
        today.setHours(0,0,0,0);
        
        const bookingWindow = availabilitySettings?.bookingWindowDays ?? 30; // Use setting or default
        const lastBookableDate = new Date(today);
        lastBookableDate.setDate(today.getDate() + bookingWindow);
        lastBookableDate.setHours(23, 59, 59, 999); // Ensure it includes the whole day

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            dayDate.setHours(0,0,0,0);
            const isToday = dayDate.getTime() === today.getTime();
            
            const dayOfWeek = dayDate.toLocaleString('en-US', { weekday: 'long' });
            const schedule = availabilitySettings?.schedule;
            const daySchedule = schedule && typeof schedule === 'object' && !Array.isArray(schedule) ? schedule[dayOfWeek] : undefined;
            
            const isWithinWindow = dayDate <= lastBookableDate;
            const isBookable = !!(daySchedule?.enabled && dayDate.getTime() >= today.getTime() && isWithinWindow);
            
            days.push({
                day: i,
                type: 'current',
                isToday,
                isBookable,
            });
        }

        // Next month's days
        const remainingCells = 42 - days.length; // Ensure 6 rows for a consistent grid
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                day: i,
                type: 'next',
                isBookable: false
            });
        }

        return days;

    }, [currentDate, availabilitySettings]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <>
            <ManageEventModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} settings={availabilitySettings} onSave={onUpdateAvailability} />
            <ManageBookingQuestionsModal isOpen={isQuestionsModalOpen} onClose={() => setIsQuestionsModalOpen(false)} settings={availabilitySettings} onSave={onUpdateAvailability} />

            {bookingDate && (
                <BookMeetingForClientModal
                    isOpen={!!bookingDate}
                    onClose={() => setBookingDate(null)}
                    onBookMeeting={onAddMeeting}
                    date={bookingDate}
                    settings={availabilitySettings}
                    meetings={meetings}
                />
            )}
            <DeleteMeetingModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                meetingTitle={meetingToDelete?.title || ''}
            />
            <ShareLinkModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} link={bookingLink} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Meeting List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
                        <h3 className="text-xl font-semibold text-slate-800">Meeting Schedule</h3>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                             <button 
                                onClick={() => setIsShareModalOpen(true)} 
                                className="bg-green-500 hover:bg-green-600 text-white font-bold p-2 rounded-lg"
                                title="Share Booking Link"
                                aria-label="Share Booking Link"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button 
                                onClick={() => setIsManageModalOpen(true)} 
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold p-2 rounded-lg"
                                title="Set Availability"
                                aria-label="Set Availability"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                            </button>
                             <button 
                                onClick={() => setIsQuestionsModalOpen(true)} 
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold p-2 rounded-lg"
                                title="Manage Booking Questions"
                                aria-label="Manage Booking Questions"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
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
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {Object.keys(groupedMeetings).length > 0 ? (
                            Object.entries(groupedMeetings).map(([date, meetingsOnDate]) => (
                                <div key={date}>
                                    <div className="sticky top-0 bg-white py-2 z-10">
                                        <h4 className="text-md font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-md inline-block">{formatDateHeader(date)}</h4>
                                    </div>
                                    <div className="space-y-3 mt-2">
                                        {meetingsOnDate.map(meeting => (
                                        <div key={meeting.id} className="p-4 border-l-4 border-sky-500 bg-slate-50 rounded-r-lg flex justify-between items-start group">
                                            <div className="space-y-1">
                                                <p className="font-semibold text-slate-800">{meeting.title}</p>
                                                <p className="text-sm text-slate-600">With: {meeting.attendee}</p>
                                                 {meeting.mobile && (
                                                    <p className="text-sm text-slate-600">Mobile: <a href={`tel:${meeting.mobile}`} className="text-sky-600 hover:underline">{meeting.mobile}</a></p>
                                                )}
                                                <p className="text-sm text-slate-500 pt-1">
                                                    {meeting.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - {meeting.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                                {/* Fix: Add type guards to safely render booking answers and questions. */}
                                                {meeting.bookingAnswers && typeof meeting.bookingAnswers === 'object' && !Array.isArray(meeting.bookingAnswers) && Object.keys(meeting.bookingAnswers).length > 0 && (
                                                    <div className="text-sm text-slate-500 mt-2 pt-2 border-t border-slate-200 whitespace-pre-wrap space-y-2">
                                                        {Object.entries(meeting.bookingAnswers as Record<string, string | string[]>).map(([questionId, answer]) => (
                                                            <div key={questionId}>
                                                                <span className="font-medium text-slate-600">{(Array.isArray(availabilitySettings?.bookingQuestions) ? availabilitySettings.bookingQuestions : []).find(q => q.id === questionId)?.label || questionId}:</span>{' '}
                                                                {Array.isArray(answer) ? answer.join(', ') : answer}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteClick(meeting)}
                                                className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                aria-label={`Delete meeting: ${meeting.title}`}
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-center py-4">No {activeTab} meetings.</p>
                        )}
                    </div>
                </div>
                
                {/* Right Column: Calendar View */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-4 rounded-xl shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-slate-700">{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h4>
                            <div className="flex gap-1">
                                <button onClick={handlePrevMonth} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="Previous month"><ChevronLeftIcon /></button>
                                <button onClick={handleNextMonth} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="Next month"><ChevronRightIcon /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-medium text-slate-500">{day}</div>)}
                            
                            {calendarGrid.map((date, index) => {
                                if (date.type === 'prev') {
                                    return (
                                        <button
                                            key={`prev-${index}`}
                                            onClick={handlePrevMonth}
                                            className="flex items-center justify-center h-9 w-9 mx-auto rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                                        >
                                            {date.day}
                                        </button>
                                    );
                                }
                                if (date.type === 'next') {
                                    return (
                                        <button
                                            key={`next-${index}`}
                                            onClick={handleNextMonth}
                                            className="flex items-center justify-center h-9 w-9 mx-auto rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                                        >
                                            {date.day}
                                        </button>
                                    );
                                }
                                // Current month day
                                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date.day);
                                const isPast = dayDate < new Date(new Date().setHours(0,0,0,0));
                                
                                return (
                                    <button
                                        key={`current-${date.day}`}
                                        disabled={isPast || !date.isBookable}
                                        onClick={() => !isPast && date.isBookable && setBookingDate(dayDate)}
                                        className={`relative flex items-center justify-center h-9 w-9 mx-auto rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                        ${date.isToday ? 'bg-sky-500 text-white font-semibold' : ''}
                                        ${!date.isToday && date.isBookable ? 'bg-sky-100 text-sky-800 cursor-pointer hover:bg-sky-200' : ''}
                                        ${!date.isToday && !date.isBookable ? 'text-slate-700' : ''}
                                        `}
                                    >
                                        {date.day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Calendar;