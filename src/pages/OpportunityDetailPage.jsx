import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Shield, Clock, Phone, Navigation, ThumbsUp, AlertCircle, Loader, X, ArrowLeft, Trash2 } from 'lucide-react';
import { getOpportunityById, addVouch, deleteOpportunity } from '../services/db';
import { generateVerificationHash } from '../utils/trust';
import { onAuthChange, getUserProfile } from '../services/auth';

const OpportunityDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVouchModal, setShowVouchModal] = useState(false);
    const [vouchForm, setVouchForm] = useState({ name: '', comment: '', phone: '' });
    const [submittingVouch, setSubmittingVouch] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            setCurrentUser(user);
            if (user) {
                const profile = await getUserProfile(user.uid);
                setUserProfile(profile);
                setVouchForm(prev => ({
                    ...prev,
                    name: profile?.name || '',
                    phone: profile?.phone || ''
                }));
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchOpportunity = async () => {
        try {
            setLoading(true);
            const data = await getOpportunityById(id);
            setOpportunity(data);
        } catch (err) {
            console.error(err);
            setError("Could not load opportunity details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchOpportunity();
        }
    }, [id]);

    const handleGetDirections = () => {
        if (opportunity?.location?.lat && opportunity?.location?.lng) {
            // Include address in the URL for better navigation
            const address = opportunity.location?.address || '';
            const destination = address
                ? `${opportunity.location.lat},${opportunity.location.lng}`
                : `${opportunity.location.lat},${opportunity.location.lng}`;

            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&destination_place_id=`;
            window.open(url, '_blank');
        } else {
            alert('Location coordinates not available');
        }
    };

    const handleVouchSubmit = async (e) => {
        e.preventDefault();
        setSubmittingVouch(true);
        try {
            const timestamp = Date.now().toString();
            const hash = await generateVerificationHash(id, vouchForm.phone || 'anonymous', timestamp);

            await addVouch(id, {
                user: vouchForm.name || 'Anonymous',
                comment: vouchForm.comment,
                hash: hash,
                time: new Date().toLocaleDateString()
            });

            alert('Vouch submitted successfully!');
            setShowVouchModal(false);
            setVouchForm({ name: '', comment: '', phone: '' });
            fetchOpportunity();
        } catch (err) {
            console.error(err);
            alert('Failed to submit vouch.');
        } finally {
            setSubmittingVouch(false);
        }
    };

    const handleDelete = async () => {
        if (!currentUser) {
            alert('Please sign in to delete this posting');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteOpportunity(id, currentUser.uid);
            alert('Opportunity deleted successfully!');
            navigate('/opportunities');
        } catch (err) {
            console.error(err);
            alert(err.message || 'Failed to delete opportunity');
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !opportunity) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-red-600">
                <AlertCircle className="w-6 h-6 mr-2" />
                {error || "Opportunity not found"}
            </div>
        );
    }

    const isOwner = currentUser && opportunity && opportunity.userId === currentUser.uid;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
            </button>

            {/* Main Content */}
            <div className="glass-card rounded-2xl overflow-hidden mb-8 border border-white/20">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                        <div>
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary text-sm font-bold rounded-full mb-3 border border-primary/20">
                                {opportunity.category}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {opportunity.title}
                            </h1>
                            <div className="flex items-center text-gray-500">
                                <MapPin className="w-5 h-5 mr-2" />
                                {opportunity.location?.address || 'Location not available'}
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${opportunity.trustScore >= 70 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                <Shield className="w-6 h-6" />
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider">Trust Score</div>
                                    <div className="text-2xl font-bold leading-none">{opportunity.trustScore}/100</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                Posted {formatDate(opportunity.createdAt)}
                            </div>
                        </div>
                    </div>

                    <div className="prose max-w-none text-gray-600 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="whitespace-pre-line">{opportunity.description}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                        <a href={`tel:${opportunity.contact}`} className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                            <Phone className="w-5 h-5" />
                            Call Now
                        </a>
                        <button onClick={handleGetDirections} className="flex-1 glass border border-white/20 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 hover:shadow-md transition-all flex items-center justify-center gap-2">
                            <Navigation className="w-5 h-5" />
                            Get Directions
                        </button>
                        <button onClick={() => setShowVouchModal(true)} className="flex-1 bg-gradient-to-r from-secondary to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                            <ThumbsUp className="w-5 h-5" />
                            Vouch For This
                        </button>
                        {isOwner && (
                            <button onClick={handleDelete} className="px-6 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-semibold hover:bg-red-100 hover:border-red-300 transition-all flex items-center justify-center gap-2">
                                <Trash2 className="w-5 h-5" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Verification Ledger */}
            <div className="glass-card rounded-2xl overflow-hidden border border-white/20">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Verification Ledger
                    </h2>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        {opportunity.vouchCount || 0} Vouches
                    </span>
                </div>
                <div className="divide-y divide-gray-100">
                    {opportunity.vouches && opportunity.vouches.length > 0 ? (
                        opportunity.vouches.map((vouch, index) => (
                            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-semibold text-gray-900">{vouch.user || 'Anonymous'}</div>
                                    <div className="text-sm text-gray-500">{vouch.time || 'Recently'}</div>
                                </div>
                                <p className="text-gray-600 mb-3">{vouch.comment}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded inline-block">
                                    <Shield className="w-3 h-3" />
                                    Hash: {vouch.hash || 'N/A'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No vouches yet. Be the first to verify this opportunity!
                        </div>
                    )}
                </div>
            </div>

            {/* Vouch Modal */}
            {showVouchModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-slideUp">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Vouch for this Opportunity</h3>
                            <button onClick={() => setShowVouchModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleVouchSubmit} className="p-6 space-y-4">
                            {currentUser && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-blue-700 font-medium">
                                        Vouching as: {userProfile?.name}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none bg-gray-50"
                                    placeholder="John Doe"
                                    value={vouchForm.name}
                                    readOnly={!!currentUser}
                                    onChange={e => !currentUser && setVouchForm({ ...vouchForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (For Verification Hash)</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none bg-gray-50"
                                    placeholder="Required for trust score"
                                    required
                                    value={vouchForm.phone}
                                    readOnly={!!currentUser}
                                    onChange={e => !currentUser && setVouchForm({ ...vouchForm, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none resize-none"
                                    rows="3"
                                    placeholder="I worked here and..."
                                    required
                                    value={vouchForm.comment}
                                    onChange={e => setVouchForm({ ...vouchForm, comment: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={submittingVouch}
                                className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-70"
                            >
                                {submittingVouch ? 'Submitting...' : 'Submit Vouch'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpportunityDetailPage;
