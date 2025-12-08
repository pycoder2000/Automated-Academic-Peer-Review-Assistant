import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, ExternalLink, CheckCircle, Clock, XCircle, AlertCircle, Network } from 'lucide-react';
import { auth } from '../utils/auth';

interface ReviewPaperPageProps {
    onBack: () => void;
    onViewPaper: (submission: ReviewSubmission) => void;
    onViewConnections?: () => void;
}

interface ReviewSubmission {
    submission_id: number;
    title: string;
    publication_year: number | null;
    abstract: string;
    link: string;
    topic: string;
    author_name: string;
    submission_date: string;
    status: string;
    submitter_name: string;
    submitter_email: string;
    assignment_status?: string;
}

const ReviewPaperPage: React.FC<ReviewPaperPageProps> = ({ onBack, onViewPaper, onViewConnections }) => {
    const currentUser = auth.getCurrentUser();
    const ADMIN_EMAIL = 'desaiparth2000@gmail.com';
    const isAdmin = currentUser?.email === ADMIN_EMAIL;

    const [submissions, setSubmissions] = useState<ReviewSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!currentUser) {
                setError('Please log in to view papers');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:5000/api/review-submissions?user_email=${encodeURIComponent(currentUser.email)}&is_admin=${isAdmin}`
                );

                if (response.ok) {
                    const data = await response.json();
                    setSubmissions(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to fetch submissions');
                }
            } catch (err) {
                setError('Failed to fetch submissions. Please try again.');
                console.error('Error fetching submissions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [currentUser, isAdmin]);

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
            pending: {
                label: 'Pending',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                icon: <Clock size={16} />
            },
            in_review: {
                label: 'In Review',
                color: 'bg-blue-100 text-blue-800 border-blue-300',
                icon: <FileText size={16} />
            },
            reviewed: {
                label: 'Reviewed',
                color: 'bg-green-100 text-green-800 border-green-300',
                icon: <CheckCircle size={16} />
            },
            rejected: {
                label: 'Rejected',
                color: 'bg-red-100 text-red-800 border-red-300',
                icon: <XCircle size={16} />
            },
            withdrawn: {
                label: 'Withdrawn',
                color: 'bg-gray-100 text-gray-800 border-gray-300',
                icon: <AlertCircle size={16} />
            }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    const getAssignmentStatusBadge = (status?: string) => {
        if (!status) return null;

        const statusConfig: Record<string, { label: string; color: string }> = {
            assigned: {
                label: 'Assigned',
                color: 'bg-purple-100 text-purple-800 border-purple-300'
            },
            in_progress: {
                label: 'In Progress',
                color: 'bg-orange-100 text-orange-800 border-orange-300'
            },
            completed: {
                label: 'Completed',
                color: 'bg-green-100 text-green-800 border-green-300'
            },
            declined: {
                label: 'Declined',
                color: 'bg-red-100 text-red-800 border-red-300'
            }
        };

        const config = statusConfig[status] || statusConfig.assigned;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 flex items-center justify-center">
                <div className="text-gray-600 text-lg">Loading papers...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="text-center mb-12">
                        <button
                            onClick={onBack}
                            className="mb-6 text-blue-700 hover:text-blue-800 font-medium inline-flex items-center"
                        >
                            ← Back to Home
                        </button>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                            Review Papers
                        </h1>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                        <p className="text-red-800 font-semibold">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <button
                        onClick={onBack}
                        className="mb-6 text-blue-700 hover:text-blue-800 font-medium inline-flex items-center"
                    >
                        ← Back to Home
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        {isAdmin ? 'Review Papers' : 'My Assigned Papers'}
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        {isAdmin
                            ? 'View all papers submitted for review and their status'
                            : 'Papers assigned to you for review'}
                    </p>

                    {/* Admin Connection Matrix Button */}
                    {isAdmin && onViewConnections && (
                        <button
                            onClick={onViewConnections}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none"
                        >
                            <Network size={20} />
                            <span>View Connection Matrix</span>
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span>
                        </button>
                    )}
                </div>

                {/* Papers List */}
                {submissions.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                        <FileText className="mx-auto mb-4 text-gray-400" size={64} />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Papers Found</h3>
                        <p className="text-gray-600">
                            {isAdmin
                                ? 'No papers have been submitted for review yet.'
                                : 'You have no papers assigned for review at this time.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {submissions.map((submission) => (
                            <div
                                key={submission.submission_id}
                                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col"
                            >
                                {/* Header with Status */}
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
                                        {submission.title || 'Untitled Paper'}
                                    </h2>
                                    <div className="ml-4 flex flex-col gap-2">
                                        {getStatusBadge(submission.status)}
                                        {getAssignmentStatusBadge(submission.assignment_status)}
                                    </div>
                                </div>

                                {/* Author */}
                                <div className="flex items-start gap-2 mb-3">
                                    <User className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Author</p>
                                        <p className="text-sm text-gray-700">{submission.author_name}</p>
                                    </div>
                                </div>

                                {/* Year */}
                                {submission.publication_year && (
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar className="text-gray-400" size={16} />
                                        <span className="text-sm text-gray-600">{submission.publication_year}</span>
                                    </div>
                                )}

                                {/* Topic */}
                                {submission.topic && (
                                    <div className="mb-3">
                                        <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
                                            {submission.topic}
                                        </span>
                                    </div>
                                )}

                                {/* Abstract Preview */}
                                <div className="mb-4 flex-grow">
                                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                        {submission.abstract || 'No abstract available.'}
                                    </p>
                                </div>

                                {/* Admin Info */}
                                {isAdmin && submission.submitter_name && (
                                    <div className="mb-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            Submitted by: <span className="font-semibold">{submission.submitter_name}</span>
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Date: {new Date(submission.submission_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 mt-auto">
                                    <button
                                        onClick={() => onViewPaper(submission)}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <ExternalLink size={16} />
                                        Review Paper
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewPaperPage;

