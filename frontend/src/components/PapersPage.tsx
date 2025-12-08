import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Calendar, User } from 'lucide-react';

interface PapersPageProps {
  onBack: () => void;
  onViewPaper: (paper: Publication) => void;
}

interface Publication {
  publication_id: number;
  title: string;
  publication_year: number | null;
  topic: string;
  abstract: string;
  link: string;
  author_name: string;
  co_authors: string[];
  keywords_list: string[];
}

const PapersPage: React.FC<PapersPageProps> = ({ onBack, onViewPaper }) => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/publications');
        if (response.ok) {
          const data = await response.json();
          setPublications(data);
          setFilteredPublications(data);
        }
      } catch (error) {
        console.error('Error fetching publications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPublications(publications);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = publications.filter(pub =>
      pub.title.toLowerCase().includes(query)
    );
    setFilteredPublications(filtered);
  }, [searchQuery, publications]);

  const handleViewPaper = (paper: Publication) => {
    onViewPaper(paper);
  };

  const getAllAuthors = (pub: Publication): string => {
    const authors = [pub.author_name, ...pub.co_authors].filter(Boolean);
    return authors.join(', ') || 'Unknown Author';
  };

  const getTopics = (pub: Publication): string[] => {
    const topics: string[] = [];
    if (pub.topic) topics.push(pub.topic);
    if (pub.keywords_list && pub.keywords_list.length > 0) {
      topics.push(...pub.keywords_list.slice(0, 3)); // Limit to 3 keywords
    }
    return topics;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 text-blue-700 hover:text-blue-800 font-medium inline-flex items-center"
        >
          ← Back to Home
        </button>

        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Papers
        </h1>

        {/* Search Box - Full width matching grid */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search papers by title..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredPublications.length} paper{filteredPublications.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading papers...</p>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No papers found</p>
          </div>
        ) : (
          /* Papers Grid - 2 Columns */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPublications.map((pub) => {
              const authors = getAllAuthors(pub);
              const topics = getTopics(pub);

              return (
                <div
                  key={pub.publication_id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {pub.title || 'Untitled Paper'}
                  </h2>

                  {/* Authors */}
                  <div className="flex items-start gap-2 mb-3">
                    <User className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {authors}
                    </p>
                  </div>

                  {/* Publication Year */}
                  {pub.publication_year && (
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">{pub.publication_year}</span>
                    </div>
                  )}

                  {/* Topics/Keywords */}
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Abstract */}
                  <div className="mb-4 flex-grow">
                    <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                      {pub.abstract || 'No abstract available.'}
                    </p>
                  </div>

                  {/* View Paper Button */}
                  <button
                    onClick={() => handleViewPaper(pub)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} />
                    View Paper
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PapersPage;

