import React, { useEffect, useState } from 'react';
import { auth } from '../utils/auth';

interface LoginPageProps {
    onLogin: () => void;
    onBack: () => void;
}

interface ResearchInterest {
    id: number;
    name: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
    const [interests, setInterests] = useState<ResearchInterest[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingInterests, setLoadingInterests] = useState(false);

    useEffect(() => {
        const fetchInterests = async () => {
            setLoadingInterests(true);
            try {
                const response = await fetch('http://localhost:5000/api/research-interests');
                if (response.ok) {
                    const data = await response.json();
                    setInterests(data);
                }
            } catch (error) {
                console.error('Error fetching research interests:', error);
            } finally {
                setLoadingInterests(false);
            }
        };

        if (!isLogin) {
            fetchInterests();
        }
    }, [isLogin]);

    const handleInterestToggle = (interestId: number) => {
        setSelectedInterests(prev =>
            prev.includes(interestId)
                ? prev.filter(id => id !== interestId)
                : [...prev, interestId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const user = await auth.login(email, password);
                if (user) {
                    onLogin();
                } else {
                    setError('Invalid email or password');
                }
            } else {
                // Validation
                if (!name.trim()) {
                    setError('Name is required');
                    setLoading(false);
                    return;
                }
                if (!email.trim()) {
                    setError('Email is required');
                    setLoading(false);
                    return;
                }
                if (!password.trim() || password.length < 6) {
                    setError('Password must be at least 6 characters');
                    setLoading(false);
                    return;
                }

                // Convert selected interest IDs to comma-separated string of interest names (for backward compatibility)
                const selectedInterestNames = selectedInterests
                    .map(id => {
                        const interest = interests.find(i => i.id === id);
                        return interest?.name;
                    })
                    .filter(Boolean)
                    .join(', ');

                // Send both the comma-separated string and the interest IDs array
                const user = await auth.register(email, password, name, undefined, selectedInterestNames, selectedInterests);
                if (user) {
                    // Registration automatically logs in the user
                    onLogin();
                } else {
                    setError('User with this email already exists or registration failed');
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center px-6 py-20">
            <div className="max-w-md w-full">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="mb-6 text-blue-700 hover:text-blue-800 font-medium inline-flex items-center"
                >
                    ← Back to Home
                </button>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-gray-600">
                            {isLogin
                                ? 'Sign in to ReviewMatch AI'
                                : 'Join ReviewMatch AI to get started'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="John Doe"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Research Interests (Select one or more)
                                </label>
                                {loadingInterests ? (
                                    <div className="text-gray-500 text-sm py-4">Loading interests...</div>
                                ) : (
                                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2">
                                        {interests.length === 0 ? (
                                            <div className="text-gray-500 text-sm py-2">No interests available</div>
                                        ) : (
                                            interests.map((interest) => (
                                                <label
                                                    key={interest.id}
                                                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedInterests.includes(interest.id)}
                                                        onChange={() => handleInterestToggle(interest.id)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-gray-700 text-sm">{interest.name}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                )}
                                {selectedInterests.length > 0 && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        {selectedInterests.length} interest(s) selected
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setEmail('');
                                setPassword('');
                                setName('');
                                setSelectedInterests([]);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {isLogin
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

