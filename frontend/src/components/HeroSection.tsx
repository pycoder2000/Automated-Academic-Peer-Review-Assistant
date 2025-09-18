import React from 'react';

interface HeroSectionProps {
  onNavigateToReview: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateToReview }) => {
  return (
    <section id="hero" className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-40 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Geometric Patterns */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            <span className="block">Automated Academic</span>
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 bg-clip-text text-transparent">
              Peer Review Assistant
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            Accelerate your research with AI-powered structured feedback. <br />
            Get reviewer-style analysis of your research papers in minutes, not weeks.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={onNavigateToReview}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-200 hover:scale-105"
            >
              <span className="relative z-10">Try It Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold text-lg rounded-2xl hover:border-blue-600 hover:text-blue-800 transition-all duration-300"
            >
              Learn How It Works
            </button>
          </div>

          {/* Stats or Social Proof */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10x</div>
              <div className="text-gray-600">Faster Review Process</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">High</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;