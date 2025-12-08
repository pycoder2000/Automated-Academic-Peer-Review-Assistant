import React from 'react';
import { Calendar, User, Download, FileText, ArrowLeft } from 'lucide-react';

interface ViewPaperPageProps {
  paper: {
    publication_id: number;
    title: string;
    publication_year: number | null;
    topic: string;
    abstract: string;
    link: string;
    author_name: string;
    co_authors: string[];
    keywords_list: string[];
  };
  onBack: () => void;
  onReviewPaper?: () => void;
}

const ViewPaperPage: React.FC<ViewPaperPageProps> = ({ paper, onBack, onReviewPaper }) => {
  const getAllAuthors = (): string => {
    const authors = [paper.author_name, ...paper.co_authors].filter(Boolean);
    return authors.join(', ') || 'Unknown Author';
  };

  const getTopics = (): string[] => {
    const topics: string[] = [];
    if (paper.topic) topics.push(paper.topic);
    if (paper.keywords_list && paper.keywords_list.length > 0) {
      topics.push(...paper.keywords_list);
    }
    return topics;
  };

  const handleDownload = () => {
    if (paper.link) {
      window.open(paper.link, '_blank', 'noopener,noreferrer');
    }
  };

  const authors = getAllAuthors();
  const topics = getTopics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 text-blue-700 hover:text-blue-800 font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Papers
        </button>

        {/* Paper Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {paper.title || 'Untitled Paper'}
        </h1>

        {/* Authors */}
        <div className="flex items-start gap-3 mb-6">
          <User className="text-gray-400 mt-1 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Authors</p>
            <p className="text-lg text-gray-800">
              {authors}
            </p>
          </div>
        </div>

        {/* Publication Year */}
        {paper.publication_year && (
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-gray-400" size={20} />
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Publication Year</p>
              <p className="text-lg text-gray-800">{paper.publication_year}</p>
            </div>
          </div>
        )}

        {/* Topics/Keywords */}
        {topics.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Topics & Keywords</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-200"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Abstract */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-gray-400" size={20} />
            <p className="text-sm font-semibold text-gray-500 uppercase">Abstract</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {paper.abstract || 'No abstract available.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownload}
            disabled={!paper.link}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download Full Paper
          </button>
          <button
            onClick={onReviewPaper}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FileText size={20} />
            Review This Paper
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPaperPage;

