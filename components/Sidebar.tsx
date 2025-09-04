import React from 'react';
import { Page } from '../types';
import { DashboardIcon, LeadsIcon, ApiIcon, LandingPageIcon, CalendarIcon, LogoutIcon } from '../constants';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onLogout: () => void;
}

const NavItem: React.FC<{ icon: JSX.Element; label: Page; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <li
        onClick={onClick}
        className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
            isActive
                ? 'bg-emerald-200 text-emerald-800 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
        }`}
    >
        {icon}
        <span className="ml-4 font-medium">{label}</span>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen, onLogout }) => {
    const navItems = [
        { icon: <DashboardIcon />, label: Page.Dashboard },
        { icon: <LeadsIcon />, label: Page.Leads },
        { icon: <ApiIcon />, label: Page.GreenApi },
        { icon: <LandingPageIcon />, label: Page.LandingPages },
        { icon: <CalendarIcon />, label: Page.Calendar },
    ];
    
    const handleNavClick = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 1024) { // Close sidebar on mobile after navigation
            setIsOpen(false);
        }
    };


    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            ></div>

            <aside 
                className={`fixed top-0 left-0 h-full w-64 bg-emerald-50 text-slate-900 border-r border-slate-200 flex flex-col z-30
                           transform transition-transform duration-300 ease-in-out 
                           lg:relative lg:translate-x-0
                           ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Sidebar"
            >
                <div className="flex items-center justify-center h-20 border-b border-slate-200 flex-shrink-0">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-green-600">
                        Green CRM
                    </h1>
                </div>
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul>
                        {navItems.map((item) => (
                            <NavItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                isActive={currentPage === item.label}
                                onClick={() => handleNavClick(item.label)}
                            />
                        ))}
                    </ul>
                </nav>
                 <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full p-3 rounded-lg text-slate-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
                    >
                        <LogoutIcon />
                        <span className="ml-4 font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;