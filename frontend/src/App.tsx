import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemSolutionSection from './components/ProblemSolutionSection';
import KeyFeaturesSection from './components/KeyFeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import Footer from './components/Footer';
import PeerReviewPage from './components/PeerReviewPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'review'>('landing');

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

  return (
    <div className="App">
      <Navbar
        onNavigate={scrollToSection}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {currentPage === 'landing' ? (
        <>
          <HeroSection onNavigateToReview={navigateToReview} />
          <ProblemSolutionSection />
          <KeyFeaturesSection />
          <HowItWorksSection />
          <div id="about" className="py-10 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="uppercase text-5xl font-extrabold text-gray-900 mb-8">
              Our Story: The Mission Behind the <span className='bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent'>Peer Review AI</span>
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Before the Automated Academic Peer Review Assistant, the process of scholarly review was a bottleneck. Researchers faced long, uncertain waiting periods and often received inconsistent feedback, slowing down the pace of innovation. We experienced this challenge firsthand and knew there had to be a better way. <br />
              <br />
              Our mission is to empower the academic community by making the peer review process faster, more objective, and accessible to everyone. This tool is a direct result of our belief that technology can and should be used to support the core principles of academic integrity and the free exchange of ideas.
              <br />
              <br />
              By using this tool, researchers can get immediate, structured feedback that helps them refine their work with confidence. Our assistant not only saves valuable time but also enhances the quality of submissions, helping to accelerate the entire cycle of scholarly publication. We are committed to a future where innovation isn't slowed by traditional processes, but is instead amplified by intelligent systems.
              </p>
            </div>

              <div className="mt-11 text-center">
                <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-4xl p-6 text-gray-900 border border-blue-200 max-w-6xl mx-auto">
                  <h3 className="text-3xl font-bold mb-4">
                    Ready to <span className='bg-gradient-to-r from-blue-700 to-blue-700 bg-clip-text text-transparent'>Experience</span> AI-Powered Peer Review?
                  </h3>
                  <p className="text-xl mb-6 text-grey-50">
                    Join researchers worldwide who are accelerating their publication process
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