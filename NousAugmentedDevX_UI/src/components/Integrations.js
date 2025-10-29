import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Puzzle, GitBranch, Github, Trello, MessageSquare, Zap, Star, TrendingUp, Settings } from 'lucide-react';

const IntegrationItem = ({ icon: Icon, name, status, description, features, onConfigure }) => {
  const isSupported = status === 'supported';
  
  return (
    <div className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg ${
      isSupported 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300' 
        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300'
    }`}>
      {/* Status Badge */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
        isSupported 
          ? 'bg-green-100 text-green-700 border border-green-200' 
          : 'bg-amber-100 text-amber-700 border border-amber-200'
      }`}>
        {isSupported ? (
          <span className="flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Supported
          </span>
        ) : (
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start mb-4">
          <div className={`p-3 rounded-lg mr-4 ${
            isSupported 
              ? 'bg-green-100 text-green-600' 
              : 'bg-amber-100 text-amber-600'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Features */}
        {features && (
          <div className="space-y-2 mb-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  isSupported ? 'bg-green-400' : 'bg-amber-400'
                }`} />
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={() => onConfigure && onConfigure(name, isSupported)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            isSupported
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isSupported ? 'Configure Now' : 'Get Notified'}
        </button>
      </div>

      {/* Decorative Elements */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 ${
        isSupported ? 'bg-green-400' : 'bg-amber-400'
      }`} />
    </div>
  );
};

const Integrations = () => {
  const navigate = useNavigate();

  const handleConfigure = (integrationName, isSupported) => {
    if (integrationName === 'DevOps' && isSupported) {
      // Navigate to DevOps Integration page and focus on configuration
      navigate('/devops-integration', { 
        state: { focusOnConfiguration: true }
      });
    } else if (!isSupported) {
      // Handle "Get Notified" for upcoming integrations
      // You can add notification signup logic here
      alert(`Thank you for your interest in ${integrationName}! We'll notify you when it's available.`);
    }
  };

  const integrations = [
    {
      icon: Settings,
      name: "HARNESS",
      status: "upcoming",
      description: "Continuous delivery and feature flag platform for modern software delivery.",
      features: ["Continuous deployment", "Feature flags", "Chaos engineering", "Cloud cost management"]
    },
    {
      icon: GitBranch,
      name: "DevOps",
      status: "supported",
      description: "Full CI/CD pipeline integration with Azure DevOps for automated deployments.",
      features: ["Build automation", "Release management", "Code quality", "Security scanning"]
    },
    {
      icon: Trello,
      name: "Jira",
      status: "upcoming",
      description: "Project management and issue tracking integration for agile development workflows.",
      features: ["Sprint planning", "Issue tracking", "Agile boards", "Time logging"]
    },
    {
      icon: Github,
      name: "GitHub",
      status: "upcoming",
      description: "Source code management and collaboration platform integration.",
      features: ["Repository management", "Pull requests", "Code review", "Actions workflow"]
    },
    {
      icon: MessageSquare,
      name: "Teams",
      status: "upcoming",
      description: "Team collaboration and communication platform integration.",
      features: ["Real-time chat", "Video meetings", "File sharing", "Team channels"]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <Puzzle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Integrations Hub</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect your development tools and streamline your workflow with our growing ecosystem of integrations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Integrations</p>
              <p className="text-3xl font-bold">5</p>
            </div>
            <Zap className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available Now</p>
              <p className="text-3xl font-bold">1</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Coming Soon</p>
              <p className="text-3xl font-bold">4</p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {integrations.map((integration, index) => (
          <IntegrationItem key={index} {...integration} onConfigure={handleConfigure} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center">
        <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Want More Integrations?</h3>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          We're constantly expanding our integration ecosystem. Let us know what tools you'd like to see next!
        </p>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
          Request Integration
        </button>
      </div>
    </div>
  );
};

export default Integrations;


