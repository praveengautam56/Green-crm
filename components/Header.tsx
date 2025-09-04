

import React, { useState, useRef } from 'react';
import { Admin, Page } from '../types';
import { LogoutIcon } from '../constants';

// --- Profile Modal Component ---
const ProfileModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: Admin;
    onSave: (updatedUser: Admin) => void;
}> = ({ isOpen, onClose, user, onSave }) => {
    if (!isOpen) return null;

    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        const updatedUser = {
            ...user,
            name,
            email,
            avatarUrl: avatarPreview || user.avatarUrl,
        };
        onSave(updatedUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-800">Profile Settings</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
                </div>
                
                <div className="flex flex-col items-center gap-4 mb-6">
                    <img src={avatarPreview || user.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-sky-600 hover:text-sky-700">
                        Change Photo
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Full Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Email Address</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

// --- Profile Icon ---
const ProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);


// --- Header Component ---
interface HeaderProps {
    currentPage: Page;
    adminUser: Admin;
    onUpdateAdmin: (user: Admin) => void;
    onLogout: () => void;
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, adminUser, onUpdateAdmin, onLogout, onToggleSidebar }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleOpenProfile = () => {
        setIsProfileModalOpen(true);
        setDropdownOpen(false);
    };

    const handleLogoutClick = () => {
        onLogout();
        setDropdownOpen(false);
    }

    return (
        <>
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={adminUser} onSave={onUpdateAdmin} />
            <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
                <div className="flex items-center">
                     <button
                        onClick={onToggleSidebar}
                        className="text-slate-500 hover:text-slate-700 focus:outline-none lg:hidden mr-4"
                        aria-label="Open sidebar"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">{currentPage}</h2>
                </div>
                <div className="relative">
                    <div className="flex items-center cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <img src={adminUser.avatarUrl} alt="Admin" className="w-10 h-10 rounded-full object-cover" />
                        <div className="ml-3 hidden sm:block">
                            <p className="font-semibold text-slate-800">{adminUser.name}</p>
                            <p className="text-sm text-slate-500">{adminUser.role}</p>
                        </div>
                    </div>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-10">
                             <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleOpenProfile(); }}
                                className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100"
                            >
                                <ProfileIcon />
                                <span className="ml-3">Profile Settings</span>
                            </a>
                             <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleLogoutClick(); }}
                                className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100"
                            >
                                <LogoutIcon />
                                <span className="ml-3">Logout</span>
                            </a>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
};

export default Header;