import React, { useEffect, useState } from 'react';

interface HeroSectionProps {
    onNavigateToReview: () => void;
    onNavigateToSubmitPaper?: () => void;
}

interface Statistics {
    active_authors: number;
    research_topics: number;
    papers_reviewed: number;
}

// Animated counter component
const AnimatedCounter: React.FC<{ target: number; duration?: number }> = ({ target, duration = 5000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (target === 0) return;

        const startTime = Date.now();
        const startValue = 0;
        const endValue = target;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(target); // Ensure we end at the exact target
            }
        };

        const frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [target, duration]);

    return <>{count}</>;
};

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateToReview, onNavigateToSubmitPaper }) => {
    const [stats, setStats] = useState<Statistics>({
        active_authors: 0,
        research_topics: 0,
        papers_reviewed: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/statistics');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching statistics:', error);
                // Keep default values (0) on error
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);
    return (
        <section id="hero" className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-60 right-40 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Geometric Patterns */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="text-center">
                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                        <span className="block">AI-Powered Peer Review</span>
                        <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 bg-clip-text text-transparent">
                            & Intelligent Matching
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
                        Get instant AI-powered structured feedback on your research papers. <br />
                        Plus, intelligent reviewer matching that ensures fair, unbiased, and expert peer review.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <button
                            onClick={onNavigateToReview}
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-200 hover:scale-105"
                        >
                            <span className="relative z-10">Run AI Review</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>

                        {onNavigateToSubmitPaper && (
                            <button
                                onClick={onNavigateToSubmitPaper}
                                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold text-lg rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-200 hover:scale-105"
                            >
                                <span className="relative z-10">Submit Paper</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        )}

                        <button
                            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold text-lg rounded-2xl hover:border-blue-600 hover:text-blue-800 transition-all duration-300"
                        >
                            Learn How It Works
                        </button>
                    </div>

                    {/* Stats or Social Proof */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 text-center hover:shadow-xl transition-all duration-300">
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                                {loading ? '...' : <AnimatedCounter target={stats.active_authors} />}
                            </div>
                            <div className="text-gray-700 font-medium">Active Authors</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 text-center hover:shadow-xl transition-all duration-300">
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                                {loading ? '...' : <AnimatedCounter target={stats.research_topics} />}
                            </div>
                            <div className="text-gray-700 font-medium">Research Topics</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 text-center hover:shadow-xl transition-all duration-300">
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                                {loading ? '...' : <AnimatedCounter target={stats.papers_reviewed} />}
                            </div>
                            <div className="text-gray-700 font-medium">Papers Reviewed</div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="mt-10 flex justify-center">
                        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
                        </div>
                    </div>

                    {/* Feature Description */}
                    <div className="mt-16 max-w-5xl mx-auto">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-blue-100">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
                                Platform Features
                            </h2>

                            <div className="space-y-8">
                                {/* Peer Review Matching */}
                                <div className="border-l-4 border-blue-600 pl-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        Intelligent Peer Review Matching
                                    </h3>
                                    <p className="text-lg text-gray-700 leading-relaxed">
                                        Our AI-powered semantic matching system goes beyond keyword searches to intelligently pair research papers with expert reviewers. Using deep NLP analysis, we understand the nuanced content and context of your work, ensuring reviewers have the right domain expertise. The system automatically detects conflicts of interest, maintains complete anonymization, and provides editors with expertly matched reviewer assignments—all while balancing reviewer availability through our token-based engagement system.
                                    </p>
                                </div>

                                {/* Other Features */}
                                <div className="grid md:grid-cols-2 gap-6 pt-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Analysis</h4>
                                        <p className="text-gray-700">
                                            Comprehensive automated review including novelty detection, plagiarism checking, factual verification, and citation quality analysis.
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">Fair & Unbiased</h4>
                                        <p className="text-gray-700">
                                            Complete anonymization and automated COI detection ensure merit-based reviews free from institutional or personal bias.
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">Token System</h4>
                                        <p className="text-gray-700">
                                            Balanced ecosystem where authors earn tokens by reviewing, ensuring reviewer availability matches submission volume.
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">Multi-Stage Pipeline</h4>
                                        <p className="text-gray-700">
                                            Intelligent 4-stage matching process: information extraction, reviewer identification, COI separation, and assignment monitoring.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;