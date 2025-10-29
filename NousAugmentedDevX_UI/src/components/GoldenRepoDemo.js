import React from 'react';
import { Database, BookOpen, FileText, Code, TestTube, Rocket, Shield } from 'lucide-react';

const GoldenRepoDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-xl">
              <Database className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Golden Repository Navigation
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            A beautiful and intuitive way to navigate through your Insurance Golden Repository with 
            6 organized sections, each containing documentation, code, data, and resources.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rich Documentation</h3>
              <p className="text-gray-600">Browse through comprehensive documentation, templates, and guides.</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">File Preview</h3>
              <p className="text-gray-600">View file contents directly in the browser with syntax highlighting.</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Code className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Code Integration</h3>
              <p className="text-gray-600">Access SDKs, example services, and integration templates.</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-orange-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TestTube className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Testing Framework</h3>
              <p className="text-gray-600">Comprehensive testing tools and CI/CD integration examples.</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-pink-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Deployment Ready</h3>
              <p className="text-gray-600">MLOps pipelines, monitoring dashboards, and rollback strategies.</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-teal-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance First</h3>
              <p className="text-gray-600">Built-in compliance checks, audit logs, and regulatory guidance.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-xl text-blue-100 mb-6">
            Click on "Golden Repo" in the navigation sidebar to start exploring the Insurance Golden Repository.
          </p>
          <div className="text-sm text-blue-200">
            Navigate through 6 organized sections with beautiful UI and intuitive file browsing.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldenRepoDemo;
