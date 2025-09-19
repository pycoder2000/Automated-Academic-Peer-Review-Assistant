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
                    <p className="text-gray-600">Traditional peer review takes 6-18 months, delaying crucial research publication</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Inconsistent Quality</h4>
                    <p className="text-gray-600">Human reviewers bring bias, varying expertise, and subjective interpretations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Resource Intensive</h4>
                    <p className="text-gray-600">Requires significant time investment from expert researchers</p>
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
                    <h4 className="font-semibold text-gray-900 mb-2">Lightning Fast Analysis</h4>
                    <p className="text-gray-600">Get comprehensive feedback in minutes, not months</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Objective & Consistent</h4>
                    <p className="text-gray-600">AI provides unbiased, systematic analysis based on established criteria</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Scale & Accessibility</h4>
                    <p className="text-gray-600">Available 24/7, handling unlimited papers with consistent quality</p>
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
              Our AI accelerates the research process, improves review objectivity, and helps researchers 
              <span className="font-semibold text-blue-700"> focus on what matters most: innovation and discovery</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;