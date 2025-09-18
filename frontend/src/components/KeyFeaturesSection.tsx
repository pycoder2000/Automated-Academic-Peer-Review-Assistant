import React from 'react';

const KeyFeaturesSection: React.FC = () => {
  const features = [
    {
      title: "Novelty Search",
      description: "Advanced FAISS embeddings compare your research against thousands of papers to identify truly novel contributions",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Plagiarism Detection",
      description: "Sophisticated algorithms detect not just direct copying, but paraphrasing and structural similarities",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Factual Verification",
      description: "Automated validation of numerical data, units, and statistical claims against established databases",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Claim Mapping",
      description: "Extract and cross-reference scientific claims with existing literature to ensure accuracy and context",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Citation Quality Check",
      description: "Comprehensive analysis of citation accuracy, relevance, and completeness with suggestions for improvement",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "LLM Review Synthesis",
      description: "Generate structured, professional reviewer-style feedback that matches human expert standards",
      gradient: "from-blue-600 to-blue-700",
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="uppercase text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Powerful Features for <br />
            <span className="bg-gradient-to-r from-blue-700 to-blue-600 to-blue-700 bg-clip-text text-transparent"> Comprehensive Analysis</span>
          </h2>
          <p className="text-xl text-gray-800 max-w-4xl mx-auto">
            Our AI-powered platform combines cutting-edge technology with deep academic expertise to provide thorough, professional peer review analysis
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