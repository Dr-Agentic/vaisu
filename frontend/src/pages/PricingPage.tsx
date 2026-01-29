import { Check, Loader2, Shield, Zap } from 'lucide-react';
import { useState } from 'react';

import { apiClient } from '../services/apiClient';
import { useUserStore } from '../stores/userStore';

export default function PricingPage() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = user?.subscriptionStatus === 'active';

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);
      const { url } = await apiClient.createCheckoutSession();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Invalid checkout URL received');
      }
    } catch (err: any) {
      console.error('Upgrade failed:', err);
      setError(err.message || 'Failed to initiate checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Choose the plan that fits your analysis needs. Unlock deeper
            insights with our Pro plan.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="relative p-8 rounded-2xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield size={100} />
            </div>
            <h3 className="text-2xl font-bold text-gray-100 mb-2">Free</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-400 ml-2">/month</span>
            </div>
            <p className="text-gray-400 mb-8">
              Perfect for getting started with text analysis.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                'Up to 10 documents per month',
                'Basic text analysis',
                '1GB Storage',
                'Standard support',
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-gray-300">
                  <Check className="text-green-400 mr-3" size={20} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full py-3 px-6 rounded-lg bg-gray-700 text-gray-400 font-medium cursor-default border border-gray-600"
            >
              {isPro ? 'Included' : 'Current Plan'}
            </button>
          </div>

          {/* Pro Plan */}
          <div
            className={`relative p-8 rounded-2xl bg-gray-800 border-2 ${isPro ? 'border-green-500' : 'border-blue-500'} shadow-xl shadow-blue-900/20`}
          >
            <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-bl-xl rounded-tr-xl text-xs font-bold uppercase tracking-wider">
              Recommended
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 mt-8">
              <Zap size={100} />
            </div>

            <h3 className="text-2xl font-bold text-gray-100 mb-2">Pro</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-gray-400 ml-2">/month</span>
            </div>
            <p className="text-gray-400 mb-8">
              For power users who need deeper insights and more volume.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                'Unlimited documents',
                'Advanced AI Analysis (GPT-4)',
                'Unlimited Storage',
                'Priority Email Support',
                'Early access to new features',
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-gray-300">
                  <Check className="text-blue-400 mr-3" size={20} />
                  {feature}
                </li>
              ))}
            </ul>

            {isPro ? (
              <button
                disabled
                className="w-full py-3 px-6 rounded-lg bg-green-500/20 text-green-400 font-medium cursor-default border border-green-500/50 flex items-center justify-center"
              >
                <Check size={20} className="mr-2" />
                Active Plan
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </>
                ) : (
                  'Upgrade to Pro'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
