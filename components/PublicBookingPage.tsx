import React, { useState, useEffect, useMemo } from 'react';
import { crmService } from '../services/crmService';
import { Meeting, AvailabilitySettings, BookingQuestion } from '../types';

interface PublicBookingPageProps {
    userId: string;
}

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

const PublicBookingPage: React.FC<PublicBookingPageProps> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adminName, setAdminName] = useState('User');
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [settings, setSettings] = useState<AvailabilitySettings | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [mobileNumber, setMobileNumber] = useState('');
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await crmService.getPublicBookingData(userId);
                if (data) {
                    setMeetings(data.meetings);
                    setSettings(data.settings);
                    setAdminName(data.adminName);
                } else {
                    setError('This booking link is invalid or the user does not exist.');
                }
            } catch (e: any) {
                setError('Failed to load booking information.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const availableTimeSlots = useMemo(() => {
        if (!selectedDate || !settings) return [];
        
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
        const daySchedule = settings.schedule[dayOfWeek];
        
        if (!daySchedule || !daySchedule.enabled) return [];

        const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
        
        const dayStartTime = new Date(selectedDate);
        dayStartTime.setHours(startHour, startMinute, 0, 0);
        
        const dayEndTime = new Date(selectedDate);
        dayEndTime.setHours(endHour, endMinute, 0, 0);

        const now = new Date();
        const minNoticeHours = settings.minBookingNoticeHours || 0;
        let earliestPossibleTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);

        if (selectedDate.toDateString() === now.toDateString()) {
            earliestPossibleTime = new Date(Math.max(dayStartTime.getTime(), earliestPossibleTime.getTime()));
        } else {
            earliestPossibleTime = dayStartTime;
        }

        const slotInterval = settings.duration;
        const minutes = earliestPossibleTime.getMinutes();
        const remainder = minutes % slotInterval;
        if (remainder !== 0) {
            earliestPossibleTime.setMinutes(minutes - remainder + slotInterval);
        }
        earliestPossibleTime.setSeconds(0, 0);

        let slotIterator = earliestPossibleTime;
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
    }, [selectedDate, settings, meetings]);

    const handleDateSelect = (day: number) => {
        const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newSelectedDate);
        setSelectedTime(null);
    };

    const handleAnswerChange = (questionId: string, value: string | string[]) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const clientName = (answers['clientName'] as string) || 'Unnamed Client';
        if (!selectedDate || !selectedTime || !clientName || !settings) return;

        setIsBooking(true);
        const [hour, minute] = selectedTime.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hour, minute);

        const endTime = new Date(startTime.getTime() + settings.duration * 60000);

        const newMeeting: Omit<Meeting, 'id'> = {
            title: `Meeting with ${clientName}`,
            attendee: clientName,
            startTime,
            endTime,
            mobile: mobileNumber,
            bookingAnswers: answers,
        };

        try {
            await crmService.addPublicMeeting(userId, newMeeting);
            setBookingSuccess(true);
        } catch (err) {
            setError("Could not book the meeting. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };
    
     const calendarGrid = useMemo(() => {
        const days = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingWindow = settings?.bookingWindowDays || 90;
        const lastBookableDate = new Date(today);
        lastBookableDate.setDate(today.getDate() + bookingWindow);

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ day: null, isAvailable: false });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
            
            const isWithinWindow = date >= today && date <= lastBookableDate;
            const daySchedule = settings?.schedule[dayOfWeek];
            const isDayAvailable = daySchedule ? daySchedule.enabled : false;
            
            days.push({ day: i, isAvailable: isWithinWindow && isDayAvailable });
        }
        return days;

    }, [currentDate, settings]);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-slate-100 text-slate-600">Loading booking page...</div>;
    }

    if (error) {
        return <div className="h-screen w-screen flex items-center justify-center bg-slate-100 text-red-500 font-semibold p-4">{error}</div>;
    }

    if (bookingSuccess) {
        return (
             <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
                    <h1 className="text-2xl font-bold text-green-600">Meeting Confirmed!</h1>
                    <p className="text-slate-600 mt-4">Your meeting with {adminName} has been scheduled. You will receive a confirmation shortly.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Calendar and Details */}
                <div>
                    <h2 className="text-sm text-slate-500">{adminName}</h2>
                    <h1 className="text-2xl font-bold text-slate-800 mt-1">Book a Meeting</h1>
                    <p className="text-slate-600 mt-2">Select a date and time that works for you.</p>
                    
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-slate-700">{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h4>
                            <div className="flex gap-1">
                                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100">&lt;</button>
                                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100">&gt;</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="font-medium text-slate-500 w-10 h-10 flex items-center justify-center">{day}</div>)}
                            {calendarGrid.map((dateInfo, index) => (
                                <div key={index} className="w-10 h-10 flex items-center justify-center">
                                    {dateInfo.day && (
                                        <button 
                                            onClick={() => handleDateSelect(dateInfo.day!)}
                                            disabled={!dateInfo.isAvailable}
                                            className={`w-full h-full rounded-full transition-colors disabled:text-slate-400 disabled:cursor-not-allowed 
                                            ${selectedDate?.getDate() === dateInfo.day && selectedDate.getMonth() === currentDate.getMonth() ? 'bg-sky-500 text-white' : 'hover:bg-slate-100'}`}
                                        >
                                            {dateInfo.day}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Time Slots & Booking Form */}
                <div className="max-h-[500px] overflow-y-auto pr-3">
                    {selectedDate && (
                        <div>
                            <h3 className="font-semibold text-center mb-4">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                            {!selectedTime ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {availableTimeSlots.length > 0 ? availableTimeSlots.map(slot => (
                                        <button key={slot.toISOString()} onClick={() => setSelectedTime(slot.toTimeString().substring(0,5))} className="w-full p-3 border rounded-lg hover:bg-sky-500 hover:text-white transition-colors text-slate-800">
                                            {slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </button>
                                    )) : <p className="text-center text-slate-500">No available slots on this day.</p>}
                                </div>
                            ) : (
                                <form onSubmit={handleBookingSubmit}>
                                    <p className="text-center text-slate-600 mb-4">Confirm booking for <span className="font-semibold text-sky-600">{selectedTime}</span></p>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="mobileNumber" className="block text-sm font-bold mb-2 text-slate-700">Mobile Number</label>
                                            <input 
                                                id="mobileNumber"
                                                type="tel"
                                                value={mobileNumber}
                                                onChange={(e) => setMobileNumber(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md"
                                                required
                                                placeholder="e.g., 9876543210"
                                            />
                                        </div>
                                        
                                        {(settings?.bookingQuestions || []).map(q => (
                                             <div key={q.id}>
                                                <label className="block text-sm font-bold mb-2 text-slate-700">
                                                    {q.label} {q.required && <span className="text-red-500">*</span>}
                                                </label>
                                                <QuestionInput question={q} value={answers[q.id]} onChange={(value) => handleAnswerChange(q.id, value)} />
                                            </div>
                                        ))}

                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <button type="button" onClick={() => setSelectedTime(null)} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Back</button>
                                        <button type="submit" disabled={isBooking} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-sky-300">
                                            {isBooking ? 'Booking...' : 'Confirm'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicBookingPage;