import React, { useState } from 'react';
import { calculateTrustScore, generateVerificationHash } from '../utils/trust';
import { Shield, CheckCircle, AlertCircle, Search } from 'lucide-react';

const VerificationPage = () => {
    const [opportunityId, setOpportunityId] = useState('');
    const [phone, setPhone] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate network delay for better UX
        setTimeout(async () => {
            const hash = await generateVerificationHash(opportunityId, phone, Date.now());
            // Mock vouch count for demo purposes
            const mockVouchCount = Math.floor(Math.random() * 50);
            const score = calculateTrustScore(mockVouchCount, Date.now());

            setResult({ hash, score, vouchCount: mockVouchCount });
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">YakeeN</h1>
                    <p className="text-blue-100 mt-2 text-sm">Trust & Verification Platform</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity ID</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={opportunityId}
                                    onChange={(e) => setOpportunityId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                    placeholder="e.g. OPP-1234"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="animate-pulse">Verifying...</span>
                            ) : (
                                <>
                                    <Search className="w-5 h-5 mr-2" />
                                    Verify Trust
                                </>
                            )}
                        </button>
                    </form>

                    {/* Results */}
                    {result && (
                        <div className="mt-8 animate-fade-in">
                            <div className={`p-6 rounded-xl border ${result.score > 50 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Verification Result</h3>
                                    {result.score > 50 ? (
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Trust Score</span>
                                        <span className={`text-2xl font-bold ${result.score > 50 ? 'text-green-700' : 'text-yellow-700'}`}>
                                            {result.score}/100
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Vouches</span>
                                        <span className="font-medium text-gray-900">{result.vouchCount}</span>
                                    </div>

                                    <div className="pt-3 border-t border-gray-200/50">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Verification Hash</p>
                                        <p className="text-xs font-mono text-gray-600 break-all bg-white/50 p-2 rounded border border-gray-100">
                                            {result.hash}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
