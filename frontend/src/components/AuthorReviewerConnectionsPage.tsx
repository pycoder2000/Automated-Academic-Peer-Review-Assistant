import { AlertTriangle, ArrowLeft, Briefcase, Building2, CheckCircle, GraduationCap, MapPin, Network, UserCheck, Users, XCircle, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { auth } from '../utils/auth';

interface ConnectionFactor {
    factor: string;
    authorValue: string | null;
    reviewerValue: string | null;
    isConflict: boolean;
    icon: string;
}

interface AuthorReviewerConnection {
    submission_id: number;
    paper_title: string;
    author_name: string;
    reviewer_name: string;
    reviewer_email: string;
    degrees_of_separation: number;
    max_possible_conflicts: number;
    separation_score: number; // 0-100 percentage
    assignment_status: string;
    connection_factors: ConnectionFactor[];
}

interface AuthorReviewerConnectionsPageProps {
    onBack: () => void;
}

const AuthorReviewerConnectionsPage: React.FC<AuthorReviewerConnectionsPageProps> = ({ onBack }) => {
    const currentUser = auth.getCurrentUser();
    const ADMIN_EMAIL = 'desaiparth2000@gmail.com';
    const isAdmin = currentUser?.email === ADMIN_EMAIL;

    const [connections, setConnections] = useState<AuthorReviewerConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedConnection, setSelectedConnection] = useState<AuthorReviewerConnection | null>(null);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [isModalClosing, setIsModalClosing] = useState(false);

    const handleCloseModal = () => {
        setIsModalClosing(true);
        setTimeout(() => {
            setSelectedConnection(null);
            setIsModalClosing(false);
        }, 200);
    };

    useEffect(() => {
        const fetchConnections = async () => {
            if (!currentUser || !isAdmin) {
                setError('Only admins can access this page');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:5000/api/author-reviewer-connections?user_email=${encodeURIComponent(currentUser.email)}`
                );

                if (response.ok) {
                    const data = await response.json();
                    setConnections(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to fetch connections');
                }
            } catch (err) {
                setError('Failed to fetch connections. Please try again.');
                console.error('Error fetching connections:', err);
            } finally {
                setLoading(false);
                setTimeout(() => setAnimationComplete(true), 500);
            }
        };

        fetchConnections();
    }, [currentUser, isAdmin]);

    const getSeparationColor = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-green-500';
        if (score >= 60) return 'from-blue-500 to-cyan-500';
        if (score >= 40) return 'from-amber-500 to-yellow-500';
        return 'from-red-500 to-rose-500';
    };

    const getSeparationBgColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'bg-blue-50 border-blue-200';
        if (score >= 40) return 'bg-amber-50 border-amber-200';
        return 'bg-red-50 border-red-200';
    };

    const getSeparationLabel = (score: number) => {
        if (score >= 80) return 'Excellent Separation';
        if (score >= 60) return 'Good Separation';
        if (score >= 40) return 'Moderate Separation';
        return 'Low Separation';
    };

    const getFactorIcon = (iconName: string) => {
        switch (iconName) {
            case 'affiliation': return <Building2 size={16} />;
            case 'workplace': return <Briefcase size={16} />;
            case 'education': return <GraduationCap size={16} />;
            case 'location': return <MapPin size={16} />;
            case 'advisor': return <UserCheck size={16} />;
            case 'group': return <Users size={16} />;
            default: return <Network size={16} />;
        }
    };

    const avgSeparation = connections.length > 0
        ? Math.round(connections.reduce((sum, c) => sum + c.separation_score, 0) / connections.length)
        : 0;

    const excellentCount = connections.filter(c => c.separation_score >= 80).length;
    const warningCount = connections.filter(c => c.separation_score < 40).length;

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-12">
                        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
                        <p className="text-gray-300">Only administrators can view author-reviewer connections.</p>
                        <button
                            onClick={onBack}
                            className="mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500" />

                {/* Network Lines Animation */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                    <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
                            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="1" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {[...Array(8)].map((_, i) => (
                        <line
                            key={i}
                            x1={`${10 + i * 12}%`}
                            y1="0%"
                            x2={`${90 - i * 12}%`}
                            y2="100%"
                            stroke="url(#lineGrad)"
                            strokeWidth="1"
                            className="animate-pulse"
                            style={{ animationDelay: `${i * 200}ms` }}
                        />
                    ))}
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <button
                        onClick={onBack}
                        className="mb-6 text-purple-300 hover:text-white font-medium inline-flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </button>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-bounce">
                            <Network className="text-white" size={24} />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                            Connection Matrix
                        </h1>
                    </div>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Visualize author-reviewer relationships and conflict of interest separations
                    </p>
                </div>

                {/* Stats Cards */}
                {!loading && connections.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                        {[
                            { label: 'Total Assignments', value: connections.length, icon: Users, color: 'from-purple-500 to-indigo-500' },
                            { label: 'Avg. Separation', value: `${avgSeparation}%`, icon: Zap, color: getSeparationColor(avgSeparation) },
                            { label: 'Excellent Matches', value: excellentCount, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
                            { label: 'Needs Review', value: warningCount, icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
                        ].map((stat, index) => (
                            <div
                                key={stat.label}
                                className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transform transition-all duration-700 hover:scale-105 hover:bg-white/10 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                    <stat.icon className="text-white" size={20} />
                                </div>
                                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-gray-400 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping" />
                            <div className="absolute inset-2 border-4 border-t-purple-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin" />
                            <div className="absolute inset-4 border-4 border-t-transparent border-r-transparent border-b-blue-500 border-l-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                            <Network className="absolute inset-0 m-auto text-white" size={28} />
                        </div>
                        <p className="text-gray-300 text-lg">Loading connection matrix...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center">
                        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-300 text-lg">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && connections.length === 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                        <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Assignments Yet</h3>
                        <p className="text-gray-400">There are no author-reviewer assignments to display.</p>
                    </div>
                )}

                {/* Connection Cards */}
                {!loading && !error && connections.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {connections.map((connection, index) => (
                            <div
                                key={connection.submission_id}
                                className={`group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 cursor-pointer transition-all duration-500 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                                    }`}
                                style={{ transitionDelay: `${(index + 4) * 100}ms` }}
                                onClick={() => setSelectedConnection(connection)}
                            >
                                {/* Paper Title */}
                                <h3 className="text-lg font-semibold text-white mb-4 line-clamp-2 group-hover:text-purple-200 transition-colors">
                                    {connection.paper_title}
                                </h3>

                                {/* Author-Reviewer Visual Connection */}
                                <div className="relative flex items-center justify-between mb-6">
                                    {/* Author Node */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                            <span className="text-white font-bold text-lg">
                                                {connection.author_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 text-center max-w-20 truncate">
                                            {connection.author_name.split(' ')[0]}
                                        </p>
                                        <span className="text-[10px] text-blue-400 font-medium">AUTHOR</span>
                                    </div>

                                    {/* Connection Line with Score */}
                                    <div className="flex-1 mx-4 relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-30" />
                                        </div>
                                        <div className={`absolute inset-0 flex items-center overflow-hidden`}>
                                            <div
                                                className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-1000 group-hover:shadow-glow"
                                                style={{ width: animationComplete ? `${connection.separation_score}%` : '0%' }}
                                            />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getSeparationColor(connection.separation_score)} text-white text-xs font-bold shadow-lg`}>
                                                {connection.separation_score}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reviewer Node */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                            <span className="text-white font-bold text-lg">
                                                {connection.reviewer_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 text-center max-w-20 truncate">
                                            {connection.reviewer_name.split(' ')[0]}
                                        </p>
                                        <span className="text-[10px] text-emerald-400 font-medium">REVIEWER</span>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className={`px-3 py-1 rounded-full ${getSeparationBgColor(connection.separation_score)} border text-gray-700`}>
                                        {getSeparationLabel(connection.separation_score)}
                                    </span>
                                    <span className="text-gray-400">
                                        {connection.degrees_of_separation}/{connection.max_possible_conflicts} conflicts
                                    </span>
                                </div>

                                {/* Hover Indicator */}
                                <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-purple-300 text-xs">Click to view details →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Detail Modal */}
                {selectedConnection && (
                    <div
                        className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${isModalClosing ? 'opacity-0' : 'animate-fadeIn'}`}
                        onClick={handleCloseModal}
                    >
                        <div
                            className={`bg-gradient-to-br from-slate-900 to-purple-900 border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl modal-scrollbar transition-all duration-200 ${isModalClosing ? 'scale-95 opacity-0' : 'animate-scaleIn'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-white">Connection Details</h2>
                                    <button
                                        onClick={handleCloseModal}
                                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center text-white hover:text-red-400 transition-all duration-200 hover:rotate-90"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                                <p className="text-gray-300 line-clamp-2">{selectedConnection.paper_title}</p>
                            </div>

                            {/* Connection Visualization */}
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    {/* Author */}
                                    <div className="text-center">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-blue-500/30">
                                            <span className="text-white font-bold text-2xl">
                                                {selectedConnection.author_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-white font-medium">{selectedConnection.author_name}</p>
                                        <span className="text-blue-400 text-sm">Author</span>
                                    </div>

                                    {/* Separation Gauge */}
                                    <div className="flex-1 mx-8">
                                        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getSeparationColor(selectedConnection.separation_score)} rounded-full transition-all duration-1000`}
                                                style={{ width: `${selectedConnection.separation_score}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span className="text-red-400 text-xs">High Conflict</span>
                                            <span className="text-white font-bold text-lg">{selectedConnection.separation_score}%</span>
                                            <span className="text-emerald-400 text-xs">Well Separated</span>
                                        </div>
                                    </div>

                                    {/* Reviewer */}
                                    <div className="text-center">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-emerald-500/30">
                                            <span className="text-white font-bold text-2xl">
                                                {selectedConnection.reviewer_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-white font-medium">{selectedConnection.reviewer_name}</p>
                                        <span className="text-emerald-400 text-sm">Reviewer</span>
                                    </div>
                                </div>

                                {/* Separation Factors */}
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Network size={20} />
                                    Separation Analysis
                                </h3>
                                <div className="space-y-3">
                                    {selectedConnection.connection_factors.map((factor, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-xl border ${factor.isConflict
                                                ? 'bg-red-500/10 border-red-500/30'
                                                : 'bg-emerald-500/10 border-emerald-500/30'
                                                } transition-all duration-300 hover:scale-[1.02]`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${factor.isConflict ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                                        }`}>
                                                        {getFactorIcon(factor.icon)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{factor.factor}</p>
                                                        <p className="text-gray-400 text-sm">
                                                            Author: {factor.authorValue || 'N/A'} • Reviewer: {factor.reviewerValue || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {factor.isConflict ? (
                                                    <XCircle className="text-red-400" size={20} />
                                                ) : (
                                                    <CheckCircle className="text-emerald-400" size={20} />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className={`mt-6 p-4 rounded-xl ${getSeparationBgColor(selectedConnection.separation_score)} border`}>
                                    <p className="text-gray-800 font-medium text-center">
                                        {getSeparationLabel(selectedConnection.separation_score)} : {selectedConnection.degrees_of_separation} out of {selectedConnection.max_possible_conflicts} potential conflicts detected
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Styles */}
            <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px currentColor; }
          50% { box-shadow: 0 0 20px currentColor; }
        }
        .group-hover\\:shadow-glow:hover {
          animation: glow 1s ease-in-out infinite;
        }

        /* Modal animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Hide scrollbar */
        .modal-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .modal-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
        </div>
    );
};

export default AuthorReviewerConnectionsPage;