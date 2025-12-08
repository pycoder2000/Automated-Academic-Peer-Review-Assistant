import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Download, FileText, ArrowLeft, Edit, CheckCircle } from 'lucide-react';
import { auth } from '../utils/auth';

interface ViewPaperPageProps {
  paper: {
    publication_id?: number;
    submission_id?: number;
    title: string;
    publication_year: number | null;
    topic: string;
    abstract: string;
    link: string;
    author_name: string;
    co_authors?: string[];
    keywords_list?: string[];
  };
  onBack: () => void;
  onReviewPaper?: () => void;
}

const ViewPaperPage: React.FC<ViewPaperPageProps> = ({ paper, onBack, onReviewPaper }) => {
  const currentUser = auth.getCurrentUser();
  const [isReviewer, setIsReviewer] = useState(false);
  const [checkingReviewer, setCheckingReviewer] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [submittedReview, setSubmittedReview] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);

  useEffect(() => {
    // Check if user is reviewer for this submission
    const checkReviewerStatus = async () => {
      if (!currentUser || !paper.submission_id) {
        setIsReviewer(false);
        return;
      }

      setCheckingReviewer(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/check-reviewer?user_email=${encodeURIComponent(currentUser.email)}&submission_id=${paper.submission_id}`
        );
        if (response.ok) {
          const data = await response.json();
          setIsReviewer(data.is_reviewer);

          // If reviewer, fetch existing review
          if (data.is_reviewer) {
            setLoadingReview(true);
            try {
              const reviewResponse = await fetch(
                `http://localhost:5000/api/reviews?user_email=${encodeURIComponent(currentUser.email)}&submission_id=${paper.submission_id}`
              );
              if (reviewResponse.ok) {
                const reviewData = await reviewResponse.json();
                if (reviewData.review_text) {
                  setSubmittedReview(reviewData);
                  setReviewText(reviewData.review_text);
                }
              }
            } catch (error) {
              console.error('Error fetching review:', error);
            } finally {
              setLoadingReview(false);
            }
          }
        }
      } catch (error) {
        console.error('Error checking reviewer status:', error);
        setIsReviewer(false);
      } finally {
        setCheckingReviewer(false);
      }
    };

    checkReviewerStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, paper.submission_id]);

  const handleReviewClick = () => {
    setShowReviewForm(true);
    if (submittedReview) {
      setIsEditing(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!currentUser || !paper.submission_id || !reviewText.trim()) {
      alert('Please enter a review');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: currentUser.email,
          submission_id: paper.submission_id,
          review_text: reviewText.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmittedReview(data);
        setShowReviewForm(false);
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to submit review'}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = () => {
    setShowReviewForm(true);
    setIsEditing(true);
  };

  const getAllAuthors = (): string => {
    const authors = [paper.author_name, ...(paper.co_authors || [])].filter(Boolean);
    return authors.join(', ') || 'Unknown Author';
  };

  const getTopics = (): string[] => {
    const topics: string[] = [];
    if (paper.topic) {
      // If topic is a comma-separated string, split it
      if (paper.topic.includes(',')) {
        topics.push(...paper.topic.split(',').map(t => t.trim()).filter(Boolean));
      } else {
        topics.push(paper.topic);
      }
    }
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
        {isReviewer ? (
          // Reviewer sees both buttons side by side
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleDownload}
              disabled={!paper.link}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download Full Paper
            </button>
            <button
              onClick={handleReviewClick}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              Review This Paper
            </button>
          </div>
        ) : (
          // Non-reviewer sees only download button (full width)
          <div className="mb-8">
            <button
              onClick={handleDownload}
              disabled={!paper.link}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download Full Paper
            </button>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
            <p className="text-green-800 font-semibold">Review submitted successfully!</p>
          </div>
        )}

        {/* Review Form */}
        {isReviewer && showReviewForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isEditing ? 'Edit Your Review' : 'Submit a Review'}
            </h2>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Enter your review here..."
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={submitting || !reviewText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setIsEditing(false);
                  if (submittedReview) {
                    setReviewText(submittedReview.review_text);
                  } else {
                    setReviewText('');
                  }
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Submitted Review Display */}
        {isReviewer && submittedReview && !showReviewForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Review</h2>
              <button
                onClick={handleEditReview}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-3">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {submittedReview.review_text}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Submitted: {new Date(submittedReview.submitted_date).toLocaleString()}
              {submittedReview.last_updated !== submittedReview.submitted_date && (
                <span className="ml-2">
                  (Last updated: {new Date(submittedReview.last_updated).toLocaleString()})
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPaperPage;

