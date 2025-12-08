import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemSolutionSection from './components/ProblemSolutionSection';
import KeyFeaturesSection from './components/KeyFeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import Footer from './components/Footer';
import PeerReviewPage from './components/PeerReviewPage';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import { auth } from './utils/auth';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'review' | 'login' | 'profile'>('landing');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navigateToReview = () => {
    setCurrentPage('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => {
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      {currentPage !== 'login' && (
        <Navbar
          onNavigate={scrollToSection}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'login' ? (
        <LoginPage
          onLogin={handleLogin}
          onBack={navigateToHome}
        />
      ) : currentPage === 'profile' ? (
        <ProfilePage
          onBack={navigateToHome}
          onLogout={handleLogout}
        />
      ) : currentPage === 'landing' ? (
        <>
          <HeroSection onNavigateToReview={navigateToReview} />
          <ProblemSolutionSection />
          <KeyFeaturesSection />
          <HowItWorksSection />
          <div id="about" className="py-10 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="uppercase text-5xl font-extrabold text-gray-900 mb-8">
              Our Story: The Mission Behind <span className='bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent'>ReviewMatch AI</span>
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Traditional peer review faces two critical challenges: finding the right reviewers takes weeks, and the review process itself is slow and often biased. Researchers wait months for feedback, while editors struggle with reviewer shortages and potential conflicts of interest. We experienced these problems firsthand and knew there had to be a better way. <br />
              <br />
              Our mission is to revolutionize scientific publishing by combining AI-powered paper analysis with intelligent reviewer matching. ReviewMatch AI ensures researchers get instant, structured feedback while editors receive expertly matched, conflict-free reviewer assignments. We believe technology should support academic integrity, fairness, and the free exchange of ideas—without the biases and delays of traditional systems.
              <br />
              <br />
              By using ReviewMatch AI, researchers receive immediate, comprehensive analysis that helps refine their work, while the platform's semantic matching and anonymization ensure fair, expert peer review. Our system not only accelerates the review cycle but also maintains the highest standards of objectivity and quality. We are committed to a future where scientific innovation isn't slowed by outdated processes, but is instead amplified by intelligent, fair, and efficient systems.
              </p>
            </div>

              <div className="mt-11 text-center">
                <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-4xl p-6 text-gray-900 border border-blue-200 max-w-6xl mx-auto">
                  <h3 className="text-3xl font-bold mb-4">
                    Ready to <span className='bg-gradient-to-r from-blue-700 to-blue-700 bg-clip-text text-transparent'>Experience</span> the Future of Peer Review?
                  </h3>
                  <p className="text-xl mb-6 text-grey-50">
                    Join researchers and editors worldwide who are transforming scientific publishing with AI-powered analysis and intelligent matching
                  </p>
                  <button
                    className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                    onClick={navigateToReview}
                  >
                    Start Your Free Analysis
                  </button>
                </div>
            </div>
          </div>
          <Footer />
        </>
      ) : (
        <PeerReviewPage onBackToHome={navigateToHome} />
      )}
    </div>
  );
}

export default App;