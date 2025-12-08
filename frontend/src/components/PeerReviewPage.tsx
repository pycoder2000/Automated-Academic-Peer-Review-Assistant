import { AlertCircle, CheckCircle, FileText, Loader, Upload } from 'lucide-react';
import React, { useState } from 'react';

interface PeerReviewPageProps {
    onBackToHome: () => void;
}

const PeerReviewPage: React.FC<PeerReviewPageProps> = ({ onBackToHome }) => {
    const [file, setFile] = useState<File | null>(null);
    const [enableDeepSearch, setEnableDeepSearch] = useState(false);
    const [topic, setTopic] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileUpload = (uploadedFile: File) => {
        if (uploadedFile.type === 'application/pdf') {
            setFile(uploadedFile);
        } else {
            alert('Please upload a PDF file');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileUpload(droppedFile);
        }
    };

    const handleRunReview = async () => {
        if (!file) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("deep_search", enableDeepSearch ? "true" : "");
        formData.append("topic", topic);

        try {
            const response = await fetch("http://localhost:5000/api/review", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.error) {
                alert(data.error);
            } else {
                const detailedFeedback = Object.keys(data.review).map((key) => ({
                    category: key,
                    feedback: data.review[key],
                    status: "good"
                }));

                setResults({
                    overallRecommendation: data.review["9. Final Recommendation"] || "Check review.txt",
                    detailedFeedback,
                });
            }
        } catch (error) {
            alert("Error contacting backend: " + error);
        }

        setIsProcessing(false);
    };

    const formatMarkdown = (text: string) => {
        if (!text) return '';
        // simple bold formatter for **text**
        return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    };

    const splitLines = (text: string) => {
        if (!text) return [];
        return text
            .split(/\r?\n+/)
            .map(l => l.trim())
            .filter(Boolean)
            .map(l => l.replace(/^[•\-]\s*/, ''));
    };

    const extractDecision = (text: string) => {
        if (!text) return { decision: 'Unknown', tone: 'neutral' };
        const match = text.match(/Decision:\s*([A-Za-z ]+)/i);
        const decision = match ? match[1].trim() : 'Unknown';
        const lower = decision.toLowerCase();
        if (lower.includes('reject')) return { decision, tone: 'danger' };
        if (lower.includes('major')) return { decision, tone: 'warning' };
        if (lower.includes('minor')) return { decision, tone: 'info' };
        if (lower.includes('accept')) return { decision, tone: 'success' };
        return { decision, tone: 'neutral' };
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'excellent': return <CheckCircle className="text-green-500" size={20} />;
            case 'good': return <CheckCircle className="text-blue-500" size={20} />;
            case 'warning': return <AlertCircle className="text-yellow-500" size={20} />;
            default: return <AlertCircle className="text-red-500" size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <button
                        onClick={onBackToHome}
                        className="mb-6 text-blue-700 hover:text-blue-800 font-medium inline-flex items-center"
                    >
                        ← Back to Home
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        Run AI Review
                    </h1>
                    <p className="text-lg text-gray-600">
                        Upload your research paper (PDF) for automated peer review analysis
                    </p>
                </div>

                {!results ? (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        {/* File Upload */}
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-gray-900 mb-4">
                                Upload Research Paper
                            </label>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                                    } ${file ? 'border-green-400 bg-green-50' : ''}`}
                            >
                                {file ? (
                                    <div className="flex items-center justify-center space-x-3">
                                        <FileText className="text-green-500" size={40} />
                                        <div>
                                            <p className="font-semibold text-green-700">{file.name}</p>
                                            <p className="text-sm text-green-600">Ready for analysis</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                                        <p className="text-lg font-medium text-gray-700 mb-2">
                                            Drop your PDF here or{' '}
                                            <label htmlFor="file-upload" className="text-blue-700 underline cursor-pointer">
                                                click to browse
                                            </label>
                                        </p>
                                        <p className="text-gray-500">Maximum file size: 25MB</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    className="hidden"
                                    id="file-upload"
                                />
                            </div>
                        </div>

                        {/* Options */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={enableDeepSearch}
                                        onChange={(e) => setEnableDeepSearch(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">Enable Deep Search</div>
                                        <div className="text-sm text-gray-600">More comprehensive analysis (takes longer time)</div>
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Research Topic (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Machine Learning, Biology"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Run Review Button */}
                        <button
                            onClick={handleRunReview}
                            disabled={!file || isProcessing}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center space-x-2">
                                    <Loader className="animate-spin" size={20} />
                                    <span>Analyzing Paper...</span>
                                </span>
                            ) : (
                                'Run Review'
                            )}
                        </button>
                    </div>
                ) : (
                    /* Results Display */
                    <div className="space-y-6">
                        {/* Overall Score */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">AI</div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Review Summary</h2>
                                    <p className="text-gray-600">Insights from automated peer review</p>
                                </div>
                            </div>


                            {/* Decision box with tone */}
                            {(() => {
                                const { decision, tone } = extractDecision(results.overallRecommendation);
                                const toneClasses: Record<string, { bg: string; text: string; border: string }> = {
                                    danger: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200 border-4' },
                                    warning: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200 border-4' },
                                    info: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200 border-4' },
                                    success: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
                                    neutral: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200 border-4' },
                                };
                                const toneClass = toneClasses[tone] || toneClasses.neutral;
                                return (
                                    <div className={`p-5 rounded-2xl border shadow-sm ${toneClass.bg} ${toneClass.border}`}>
                                        <h4 className="font-semibold text-gray-900 mb-1">Decision</h4>
                                        <p className={`${toneClass.text} font-semibold text-lg`}>
                                            {decision || 'Decision not found'}
                                        </p>
                                    </div>
                                );
                            })()}

                            {/* Overall Recommendation (neutral blue) */}
                            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-4 border-blue-300 shadow-inner">
                                <h3 className="font-semibold text-gray-900 mb-3">Overall Recommendation</h3>
                                <div className="space-y-2 text-gray-500 font-medium whitespace-pre-wrap">
                                    {splitLines(results.overallRecommendation).map((line, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <span className="text-indigo-500">•</span>
                                            <span dangerouslySetInnerHTML={{ __html: formatMarkdown(line) }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Feedback */}
                        <div className="grid gap-6">
                            {results.detailedFeedback.map((item: any, index: number) => {
                                const lines = splitLines(item.feedback);
                                return (
                                    <div key={index} className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                {getStatusIcon(item.status)}
                                                <h3 className="text-xl font-semibold text-gray-900">{item.category}</h3>
                                            </div>
                                        </div>
                                        <ul className="space-y-2 text-gray-700 leading-relaxed">
                                            {lines.map((line, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-stone-900 ">→</span>
                                                    <span dangerouslySetInnerHTML={{ __html: formatMarkdown(line) }} />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setResults(null)}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                Analyze Another Paper
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Loader className="text-white animate-spin" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Research</h3>
                        <p className="text-gray-600">
                            Our AI is performing comprehensive analysis including novelty search, plagiarism detection, and factual verification...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeerReviewPage;