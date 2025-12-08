import React from 'react';

const ProblemSolutionSection: React.FC = () => {
  return (
    <section id="problem" className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #6366f1 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="uppercase text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Why Peer Review Needs
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> Reinvention ?</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Problem Side */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-8 rounded-3xl border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">The Current Problems</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Extremely Slow Process</h4>
                    <p className="text-gray-600">Traditional peer review takes 6-18 months, and finding suitable reviewers adds weeks of delay</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Bias & Inconsistent Quality</h4>
                    <p className="text-gray-600">Reviewers may favor prestigious institutions, and keyword-based matching leads to suboptimal reviewer assignments</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Reviewer Shortage & COI Issues</h4>
                    <p className="text-gray-600">Editors struggle to find committed reviewers, and conflict-of-interest detection is often overlooked</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Surface-Level Matching</h4>
                    <p className="text-gray-600">Existing systems rely on superficial keyword matching, missing nuanced content and context</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Side */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-8 rounded-3xl border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our AI Solution</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Instant Feedback</h4>
                    <p className="text-gray-600">Get comprehensive, structured review analysis in minutes with AI-driven novelty, plagiarism, and factual checks</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Intelligent Reviewer Matching</h4>
                    <p className="text-gray-600">Semantic AI analysis matches papers with expert reviewers based on deep content understanding, not just keywords</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Fair & Unbiased Process</h4>
                    <p className="text-gray-600">Anonymization and automated COI detection ensure merit-based reviews free from institutional or personal bias</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Token-Based Balance</h4>
                    <p className="text-gray-600">Smart token system incentivizes reviews and maintains equilibrium between submissions and reviewer availability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Statement */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-blue-50 p-8 rounded-3xl border border-indigo-100 max-w-4xl mx-auto">
            <p className="text-xl text-gray-800 leading-relaxed">
              Our platform revolutionizes peer review by combining AI-powered analysis with intelligent matching, ensuring
              <span className="font-semibold text-blue-700"> faster, fairer, and more objective scientific publishing</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;