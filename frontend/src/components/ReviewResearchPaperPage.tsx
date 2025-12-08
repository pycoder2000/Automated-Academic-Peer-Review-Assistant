import { CheckCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { auth } from '../utils/auth';

interface ReviewResearchPaperPageProps {
    onBack: () => void;
}

interface Institution {
    id: number;
    name: string;
    type: string;
    country: string;
    city: string;
}

interface Company {
    id: number;
    name: string;
    industry: string;
    country: string;
    city: string;
    state: string;
}

interface ResearchInterest {
    id: number;
    name: string;
}

const ReviewResearchPaperPage: React.FC<ReviewResearchPaperPageProps> = ({ onBack }) => {
    const currentUser = auth.getCurrentUser();
    const currentYear = new Date().getFullYear();

    // Paper Information
    const [title, setTitle] = useState('');
    const [publicationYear, setPublicationYear] = useState(currentYear);
    const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
    const [authorName, setAuthorName] = useState(currentUser?.name || '');
    const [coAuthors, setCoAuthors] = useState('');
    const [abstract, setAbstract] = useState('');
    const [link, setLink] = useState('');

    // Author Information
    const [bachelorInstitution, setBachelorInstitution] = useState<number | ''>('');
    const [masterInstitution, setMasterInstitution] = useState<number | ''>('');
    const [phdInstitution, setPhdInstitution] = useState<number | ''>('');
    const [workplace, setWorkplace] = useState<number | ''>('');
    const [affiliation, setAffiliation] = useState<number | ''>('');
    const [advisorName, setAdvisorName] = useState('');
    const [researchGroup, setResearchGroup] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');

    // Dropdown data
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [researchInterests, setResearchInterests] = useState<ResearchInterest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        // Fetch dropdown data
        const fetchData = async () => {
            try {
                const [instRes, compRes, interestsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/institutions'),
                    fetch('http://localhost:5000/api/companies'),
                    fetch('http://localhost:5000/api/research-interests'),
                ]);

                const instData = await instRes.json();
                const compData = await compRes.json();
                const interestsData = await interestsRes.json();

                setInstitutions(instData);
                setCompanies(compData);
                setResearchInterests(interestsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleTopicToggle = (interestId: number) => {
        setSelectedTopics((prev) =>
            prev.includes(interestId)
                ? prev.filter((id) => id !== interestId)
                : [...prev, interestId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            alert('Please log in to submit a paper');
            return;
        }

        if (!title || !abstract || !link || selectedTopics.length === 0 || !authorName) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            // Get topic names from selected IDs
            const topicNames = selectedTopics
                .map((id) => researchInterests.find((r) => r.id === id)?.name)
                .filter(Boolean)
                .join(', ');

            const response = await fetch('http://localhost:5000/api/review-submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: currentUser.user_id,
                    title,
                    publication_year: publicationYear,
                    abstract,
                    link,
                    topic: topicNames,
                    keywords: topicNames,
                    author_name: authorName,
                    co_authors: coAuthors || '',
                    author_affiliation_id: affiliation || null,
                    author_workplace_id: workplace || null,
                    author_bachelor_institution_id: bachelorInstitution || null,
                    author_master_institution_id: masterInstitution || null,
                    author_phd_institution_id: phdInstitution || null,
                    author_advisor_name: advisorName || null,
                    author_research_group: researchGroup || null,
                    author_city: city || null,
                    author_state: state || null,
                    author_country: country || null,
                }),
            });

            if (response.ok) {
                setShowSuccessDialog(true);
                // Reset form
                setTitle('');
                setAbstract('');
                setLink('');
                setSelectedTopics([]);
                setCoAuthors('');
                setBachelorInstitution('');
                setMasterInstitution('');
                setPhdInstitution('');
                setWorkplace('');
                setAffiliation('');
                setAdvisorName('');
                setResearchGroup('');
                setCity('');
                setState('');
                setCountry('');
            } else {
                const error = await response.json();
                alert(`Error: ${error.error || 'Failed to submit paper'}`);
            }
        } catch (error) {
            console.error('Error submitting paper:', error);
            alert('Failed to submit paper. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-gray-600 text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <button
                        onClick={onBack}
                        className="mb-6 text-blue-700 hover:text-blue-800 font-medium inline-flex items-center"
                    >
                        ← Back to Home
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        Submit Paper for Review
                    </h1>
                    <p className="text-lg text-gray-600">
                        Fill in the details below to submit your research paper for peer review
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Paper Information Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Paper Information</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Paper Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Publication Year
                                </label>
                                <input
                                    type="number"
                                    value={publicationYear}
                                    onChange={(e) => setPublicationYear(parseInt(e.target.value) || currentYear)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Research Topic(s) <span className="text-red-500">*</span>
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2">
                                    {researchInterests.map((interest) => (
                                        <label
                                            key={interest.id}
                                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTopics.includes(interest.id)}
                                                onChange={() => handleTopicToggle(interest.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 text-sm">{interest.name}</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedTopics.length > 0 && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        {selectedTopics.length} topic(s) selected
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Author Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Co-Authors (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={coAuthors}
                                    onChange={(e) => setCoAuthors(e.target.value)}
                                    placeholder="John Doe, Jane Smith"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Abstract <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={abstract}
                                    onChange={(e) => setAbstract(e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Paper Link (URL) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://example.com/paper.pdf"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Author Information Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Author Information</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Current Academic Affiliation
                                </label>
                                <select
                                    value={affiliation}
                                    onChange={(e) => setAffiliation(e.target.value ? parseInt(e.target.value) : '')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Institution</option>
                                    {institutions.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.name} {inst.city && inst.country ? `(${inst.city}, ${inst.country})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Current Workplace/Company
                                </label>
                                <select
                                    value={workplace}
                                    onChange={(e) => setWorkplace(e.target.value ? parseInt(e.target.value) : '')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((comp) => (
                                        <option key={comp.id} value={comp.id}>
                                            {comp.name} {comp.city && comp.country ? `(${comp.city}, ${comp.country})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Bachelor's Institution
                                    </label>
                                    <select
                                        value={bachelorInstitution}
                                        onChange={(e) => setBachelorInstitution(e.target.value ? parseInt(e.target.value) : '')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Institution</option>
                                        {institutions.map((inst) => (
                                            <option key={inst.id} value={inst.id}>
                                                {inst.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Master's Institution
                                    </label>
                                    <select
                                        value={masterInstitution}
                                        onChange={(e) => setMasterInstitution(e.target.value ? parseInt(e.target.value) : '')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Institution</option>
                                        {institutions.map((inst) => (
                                            <option key={inst.id} value={inst.id}>
                                                {inst.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        PhD Institution
                                    </label>
                                    <select
                                        value={phdInstitution}
                                        onChange={(e) => setPhdInstitution(e.target.value ? parseInt(e.target.value) : '')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Institution</option>
                                        {institutions.map((inst) => (
                                            <option key={inst.id} value={inst.id}>
                                                {inst.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Advisor Name
                                </label>
                                <input
                                    type="text"
                                    value={advisorName}
                                    onChange={(e) => setAdvisorName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Research Group/Lab
                                </label>
                                <input
                                    type="text"
                                    value={researchGroup}
                                    onChange={(e) => setResearchGroup(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        State/Province
                                    </label>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {submitting ? 'Submitting...' : 'Submit Paper'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Dialog */}
            {showSuccessDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
                        <div className="flex flex-col items-center text-center">
                            <CheckCircle className="text-green-500 mb-4" size={64} />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Paper Successfully Submitted!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Your paper has been submitted for review. We'll match it with appropriate reviewers soon.
                            </p>
                            <button
                                onClick={() => {
                                    setShowSuccessDialog(false);
                                    onBack();
                                }}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewResearchPaperPage;

