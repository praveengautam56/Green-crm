import React, { useState } from 'react';
import { LeadsIcon, ApiIcon, CalendarIcon } from '../constants';
import { useAuth } from '../hooks/useAuth';

interface AuthFormProps {
    isSignup: boolean;
    name: string;
    email: string;
    password: string;
    error: string;
    loading: boolean;
    mobileFormVisible: boolean;
    setName: (value: string) => void;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    setIsSignup: (value: boolean) => void;
    setError: (value: string) => void;
    setMobileFormVisible: (value: boolean) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
    isSignup,
    name,
    email,
    password,
    error,
    loading,
    mobileFormVisible,
    setName,
    setEmail,
    setPassword,
    handleSubmit,
    setIsSignup,
    setError,
    setMobileFormVisible,
}) => (
    <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        {mobileFormVisible && (
             <button onClick={() => setMobileFormVisible(false)} className="absolute top-3 left-3 text-slate-500 hover:text-slate-800 md:hidden p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </button>
        )}
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
                {isSignup ? "Create Your Account" : "Welcome Back"}
            </h1>
            <p className="text-slate-500 mt-2">
                {isSignup ? "Get started with Green CRM." : "Sign in to continue."}
            </p>
        </div>
        <form onSubmit={handleSubmit}>
            {isSignup && (
                 <div className="mb-4">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">
                        Full Name
                    </label>
                    <input
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        id="name"
                        type="text"
                        placeholder="Alex Johnson"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
            )}
            <div className="mb-4">
                <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                </label>
                <input
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    id="email"
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
                    Password
                </label>
                <input
                   className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
             {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <div className="flex items-center justify-between">
                <button
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-sky-300"
                    type="submit"
                    disabled={loading}
                >
                   {loading ? 'Processing...' : (isSignup ? "Sign Up" : "Sign In")}
                </button>
            </div>
             <p className="text-center text-slate-500 text-sm mt-6">
                {isSignup ? "Already have an account?" : "Don't have an account?"}
                <button type="button" onClick={() => { setIsSignup(!isSignup); setError(''); }} className="font-bold text-sky-600 hover:text-sky-700 ml-1">
                    {isSignup ? "Log In" : "Sign Up"}
                </button>
            </p>
        </form>
    </div>
);

const HomePage: React.FC = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [mobileFormVisible, setMobileFormVisible] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignup) {
                await signUp(name, email, password);
            } else {
                await signIn(email, password);
            }
        } catch (err: any) {
            if (err.code === 'auth/invalid-credential') {
                setError("User Not Found or Invalid Password.");
            } else {
                setError(err.message || 'An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const showForm = (signup: boolean) => {
        setIsSignup(signup);
        setError('');
        setMobileFormVisible(true);
    };

    return (
        <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Section - Hidden on mobile */}
                <div className="max-w-lg hidden lg:block">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600 mb-6">
                        AI-Driven CRM for Coaches
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10">
                        Capture Meta ad leads instantly, auto-book sessions, and nurture clients with WhatsApp automation — all from one simple dashboard.
                    </p>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <div className="text-sky-500 mb-3">
                                <LeadsIcon />
                            </div>
                            <h3 className="text-xl font-semibold text-sky-600 mb-2">Lead Management</h3>
                            <p className="text-slate-500">Capture and track leads from any source, all in one place.</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <div className="text-sky-500 mb-3">
                                <ApiIcon />
                            </div>
                            <h3 className="text-xl font-semibold text-sky-600 mb-2">WhatsApp Automation</h3>
                            <p className="text-slate-500">Integrate with Green API to automate your messaging campaigns.</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <div className="text-sky-500 mb-3">
                                <CalendarIcon />
                            </div>
                            <h3 className="text-xl font-semibold text-sky-600 mb-2">Smart Scheduling</h3>
                            <p className="text-slate-500">Let clients book meetings with you effortlessly, just like Calendly.</p>
                        </div>
                    </div>
                </div>

                {/* Right Section: Login/Signup Form */}
                <div className="w-full max-w-md mx-auto">
                     {/* Mobile Buttons View */}
                    <div className={`md:hidden ${mobileFormVisible ? 'hidden' : 'block'}`}>
                        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                             <h1 className="text-3xl font-bold text-slate-800">Get Started</h1>
                             <p className="text-slate-500 mt-2">Sign in to your account or create a new one.</p>
                             <div className="mt-8 flex flex-col gap-4">
                                <button onClick={() => showForm(false)} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300">
                                    Sign In
                                </button>
                                <button onClick={() => showForm(true)} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300">
                                    Create Account
                                </button>
                             </div>
                        </div>
                    </div>

                    {/* Form View (Mobile/Desktop) */}
                    <div className={`${mobileFormVisible ? 'block' : 'hidden'} md:block`}>
                        <AuthForm 
                            isSignup={isSignup}
                            name={name}
                            email={email}
                            password={password}
                            error={error}
                            loading={loading}
                            mobileFormVisible={mobileFormVisible}
                            setName={setName}
                            setEmail={setEmail}
                            setPassword={setPassword}
                            handleSubmit={handleSubmit}
                            setIsSignup={setIsSignup}
                            setError={setError}
                            setMobileFormVisible={setMobileFormVisible}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;