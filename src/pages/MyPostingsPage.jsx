import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Shield, Trash2, Loader, ArrowLeft } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { onAuthChange } from '../services/auth';
import { deleteOpportunity } from '../services/db';

const MyPostingsPage = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            setCurrentUser(user);
            if (user) {
                fetchMyOpportunities(user.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchMyOpportunities = async (userId) => {
        try {
            setLoading(true);
            const q = query(
                collection(db, 'opportunities'),
                where('userId', '==', userId)
            );
            const snapshot = await getDocs(q);
            const opps = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOpportunities(opps);
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (oppId) => {
        if (!window.confirm('Are you sure you want to delete this opportunity?')) {
            return;
        }

        try {
            await deleteOpportunity(oppId, currentUser.uid);
            alert('Opportunity deleted successfully!');
            // Refresh the list
            fetchMyOpportunities(currentUser.uid);
        } catch (error) {
            console.error('Error deleting:', error);
            alert(error.message || 'Failed to delete opportunity');
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please sign in to view your postings</p>
                    <button
                        onClick={() => navigate('/signin')}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Postings</h1>

            {opportunities.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center border border-white/20">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Postings Yet</h3>
                    <p className="text-gray-500 mb-6">You haven't posted any opportunities yet</p>
                    <button
                        onClick={() => navigate('/post')}
                        className="px-6 py-3 bg-gradient-to-r from-secondary to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                    >
                        Post an Opportunity
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opp) => (
                        <div
                            key={opp.id}
                            className="glass-card p-6 rounded-2xl border border-white/20 hover:shadow-xl transition-all duration-300"
                        >
                            {/* Category Badge */}
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide border border-primary/20">
                                    {opp.category}
                                </span>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${opp.trustScore >= 70
                                        ? 'bg-green-100/80 text-green-700 border border-green-200'
                                        : 'bg-yellow-100/80 text-yellow-700 border border-yellow-200'
                                    }`}>
                                    <Shield className="w-3 h-3" />
                                    {opp.trustScore}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                {opp.title}
                            </h3>

                            {/* Location */}
                            <div className="flex items-center text-gray-500 text-sm mb-3">
                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{opp.location?.address || 'Location not available'}</span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {opp.description}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => navigate(`/opportunity/${opp.id}`)}
                                    className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 transition-all text-sm"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleDelete(opp.id)}
                                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100 transition-all flex items-center gap-2 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPostingsPage;
