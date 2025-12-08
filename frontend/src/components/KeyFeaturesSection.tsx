import React from 'react';

const KeyFeaturesSection: React.FC = () => {
  const features = [
    {
      title: "AI-Powered Review Analysis",
      description: "Comprehensive automated analysis including novelty search, plagiarism detection, factual verification, and citation quality checks",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Semantic Reviewer Matching",
      description: "Deep NLP-based matching that goes beyond keywords to understand content context and match papers with domain experts",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Conflict of Interest Detection",
      description: "Automated COI screening evaluates co-authorship, institutional affiliations, and professional relationships to ensure unbiased reviews",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Anonymized Review Process",
      description: "Complete anonymization of authors and reviewers eliminates bias based on institutional prestige or personal backgrounds",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Token-Based Engagement System",
      description: "Balanced ecosystem where authors earn tokens by reviewing, ensuring reviewer availability matches submission volume",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Multi-Stage Matching Pipeline",
      description: "Intelligent 4-stage process: information extraction, reviewer identification, COI separation, and assignment monitoring",
      gradient: "from-blue-600 to-blue-700",
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="uppercase text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Powerful Features for <br />
            <span className="bg-gradient-to-r from-blue-700 to-blue-600 to-blue-700 bg-clip-text text-transparent"> Fair & Intelligent Review</span>
          </h2>
          <p className="text-xl text-gray-800 max-w-4xl mx-auto">
            Our platform combines AI-powered paper analysis with intelligent reviewer matching to revolutionize peer review—ensuring quality, fairness, and efficiency
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            >
              {/* Content */}
              <div className="relative z-10">
                {/* Icon/Visual Element */}
                <div className="mb-6">

                  <div className={`h-1 w-12 bg-gradient-to-r ${feature.gradient} rounded-full`}></div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>

                    <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="w-full mt-20 border-b-2 border-line border-gray-200">
        </footer>
      </div>
    </section>
  );
};

export default KeyFeaturesSection;