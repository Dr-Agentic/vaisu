
import { Check, Loader2, Zap } from 'lucide-react';
import { useState } from 'react';

import { Modal, Button } from '../primitives';
import { apiClient } from '../../services/apiClient';
import { useUserStore } from '../../stores/userStore';

export function UpgradeModal() {
    const { isUpgradeModalOpen, setUpgradeModalOpen } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        <Modal
            isOpen={isUpgradeModalOpen}
            onClose={() => setUpgradeModalOpen(false)}
            title="Unlock Unlimited Potential"
            size="lg"
        >
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Side: Value Prop */}
                <div className="flex-1 space-y-4">
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
                            <Zap size={20} />
                            Why Upgrade?
                        </h3>
                        <p className="text-gray-300 text-sm">
                            You've hit the limits of the Free plan. Upgrade to Pro to remove all restrictions and unlock advanced features.
                        </p>
                    </div>

                    <ul className="space-y-3">
                        {[
                            'Unlimited documents',
                            'Advanced AI Analysis (GPT-4)',
                            'Unlimited Storage',
                            'Priority Email Support',
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center text-gray-300 text-sm">
                                <Check className="text-green-400 mr-2 flex-shrink-0" size={16} />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Side: Action */}
                <div className="flex-1 flex flex-col justify-center items-center bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
                        <div className="flex items-baseline justify-center mt-2">
                            <span className="text-4xl font-bold text-blue-400">$29</span>
                            <span className="text-gray-400 ml-2">/month</span>
                        </div>
                    </div>

                    {error && (
                        <div className="w-full mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none"
                        onClick={handleUpgrade}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={18} />
                                Processing...
                            </>
                        ) : (
                            'Upgrade Now'
                        )}
                    </Button>

                    <p className="mt-4 text-xs text-gray-500 text-center">
                        Secure processing via Stripe. Cancel anytime.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
