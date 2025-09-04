

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { SYSTEM_RESOURCES, LogoutIcon } from '../constants';
import { Admin, Lead, LeadStatus } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
        {children}
    </div>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
     <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>
);

const ResourceBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-slate-600">{label}</span>
            <span className={`text-sm font-bold ${color}`}>{value}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className={`${color.replace('text-', 'bg-')} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

interface DashboardProps {
    adminUser: Admin;
    onLogout: () => void;
    leads: Lead[];
    leadStatuses: LeadStatus[];
}

const ApiUsageGauge: React.FC<{ usage: number }> = ({ usage }) => {
    const data = [{ name: 'usage', value: usage }, { name: 'remaining', value: 100 - usage }];
    const color = usage > 80 ? '#ef4444' : usage > 60 ? '#f59e0b' : '#0ea5e9';

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                    <Pie
                        data={[{ value: 100 }]}
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                        innerRadius="70%"
                        outerRadius="100%"
                        fill="#e2e8f0"
                        stroke="none"
                    />
                    <Pie
                        data={data}
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                        innerRadius="70%"
                        outerRadius="100%"
                        fill={color}
                        paddingAngle={2}
                        stroke="none"
                    >
                         <Cell fill={color} />
                         <Cell fill="transparent" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center" style={{ top: '60%' }}>
                 <span className="text-3xl font-bold" style={{ color }}>{usage}%</span>
                 <p className="text-slate-500 text-sm mt-1">of quota</p>
            </div>
        </div>
    )
}

const Dashboard: React.FC<DashboardProps> = ({ adminUser, onLogout, leads, leadStatuses }) => {
    const PIE_COLORS = ['#0ea5e9', '#6366f1', '#f43f5e', '#f97316', '#10b981', '#8b5cf6'];

    const leadsByStatusData = useMemo(() => {
        if (!leads || !leadStatuses) return [];
        return leadStatuses
            .map(status => ({
                name: status.name,
                value: leads.filter(lead => lead.status === status.name).length,
            }))
            .filter(data => data.value > 0);
    }, [leads, leadStatuses]);

    const last7DaysLeadsData = useMemo(() => {
        if (!leads) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dates = Array(7).fill(0).map((_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            return d;
        }).reverse();

        return dates.map((date) => {
            const count = leads.filter(lead => {
                try {
                    // Parse 'YYYY-MM-DD' string as local date at midnight to avoid timezone issues.
                    const parts = lead.dateAdded.split('-').map(p => parseInt(p, 10));
                    if (parts.length !== 3 || parts.some(isNaN)) return false;
                    const leadDate = new Date(parts[0], parts[1] - 1, parts[2]);
                    
                    return leadDate.setHours(0, 0, 0, 0) === date.getTime();
                } catch (e) {
                    return false;
                }
            }).length;
            
            // Format labels for better readability
            const dateTime = date.getTime();
            if (dateTime === today.getTime()) {
                return { name: 'Today', leads: count };
            }
            if (dateTime === yesterday.getTime()) {
                return { name: 'Yesterday', leads: count };
            }

            return { 
                name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                leads: count 
            };
        });
    }, [leads]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card>
                    <SectionTitle title="Admin Details" />
                    <div className="flex items-start gap-4">
                        <img src={adminUser.avatarUrl} alt="Admin" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                        <div className="flex flex-col">
                           <div>
                                <p className="font-semibold text-slate-800">{adminUser.name}</p>
                                <p className="text-sm text-slate-500">{adminUser.email}</p>
                           </div>
                             <button
                                onClick={onLogout}
                                className="mt-2 flex items-center justify-center gap-2 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 font-bold py-2 px-4 rounded-lg transition duration-300 text-sm"
                            >
                                <LogoutIcon />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </Card>
                 <Card className="md:col-span-2">
                    <SectionTitle title="System Resources Status" />
                    <div className="space-y-4">
                        <ResourceBar label="CPU Usage" value={SYSTEM_RESOURCES.cpu} color="text-sky-500" />
                        <ResourceBar label="Memory Load" value={SYSTEM_RESOURCES.memory} color="text-indigo-500" />
                        <ResourceBar label="Storage" value={SYSTEM_RESOURCES.storage} color="text-amber-500" />
                    </div>
                </Card>
                <Card>
                     <SectionTitle title="API Usage" />
                     <div className="h-full flex items-center justify-center">
                        <ApiUsageGauge usage={SYSTEM_RESOURCES.apiUsage} />
                     </div>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <Card>
                    <SectionTitle title="New Leads (Last 7 Days)" />
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={last7DaysLeadsData}>
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="leads" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card>
                <SectionTitle title="Leads by Status" />
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={leadsByStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                             {leadsByStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                         <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                         <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>

        </div>
    );
};

export default Dashboard;