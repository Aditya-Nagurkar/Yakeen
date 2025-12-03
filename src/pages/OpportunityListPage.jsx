import React, { useEffect, useState } from 'react';
import { MapPin, Shield, Clock, ThumbsUp, Filter, Loader, ArrowRight, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllOpportunities } from '../services/db';
import { getUserLocation, getCoordinatesFromAddress } from '../services/location';

const OpportunityList = () => {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [filteredOpportunities, setFilteredOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [searchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: 'all',
        trustScore: 'all',
        maxDistance: 20000 // Default to a very large distance (effectively "All")
    });

    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setFilters(prevFilters => ({ ...prevFilters, category: categoryParam }));
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const locParam = searchParams.get('loc');
                const qParam = searchParams.get('q');

                let location;

                // 1. Determine Location (Param vs GPS)
                if (locParam) {
                    try {
                        console.log("Geocoding search param:", locParam);
                        location = await getCoordinatesFromAddress(locParam);
                        console.log("Geocoded location:", location);
                        // Auto-set distance filter to 50km for specific location searches
                        setFilters(prev => ({ ...prev, maxDistance: 50 }));
                    } catch (e) {
                        console.warn("Geocoding failed, falling back to GPS", e);
                        location = await getUserLocation();
                    }
                } else {
                    location = await getUserLocation();
                }

                setUserLocation(location);

                // 2. Fetch All Opportunities
                const data = await getAllOpportunities([location.lat, location.lng]);

                // 3. Filter by Search Query (Client-side)
                let filteredData = data;
                if (qParam) {
                    const query = qParam.toLowerCase();
                    filteredData = data.filter(opp =>
                        opp.title.toLowerCase().includes(query) ||
                        opp.description?.toLowerCase().includes(query) ||
                        opp.category.toLowerCase().includes(query)
                    );
                }

                setOpportunities(filteredData);
                setFilteredOpportunities(filteredData);
            } catch (err) {
                console.error(err);
                setError(err.message || 'Could not fetch opportunities.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    // Apply filters whenever filter state changes
    useEffect(() => {
        let filtered = [...opportunities];

        // Category filter
        if (filters.category !== 'all') {
            filtered = filtered.filter(opp =>
                opp.category.toLowerCase() === filters.category.toLowerCase()
            );
        }

        // Trust score filter
        if (filters.trustScore !== 'all') {
            if (filters.trustScore === 'high') {
                filtered = filtered.filter(opp => opp.trustScore >= 70);
            } else if (filters.trustScore === 'medium') {
                filtered = filtered.filter(opp => opp.trustScore >= 40 && opp.trustScore < 70);
            } else if (filters.trustScore === 'low') {
                filtered = filtered.filter(opp => opp.trustScore < 40);
            }
        }

        // Distance filter
        filtered = filtered.filter(opp => {
            const distance = typeof opp.distance === 'number' ? opp.distance : parseFloat(opp.distance);
            return distance <= filters.maxDistance;
        });

        setFilteredOpportunities(filtered);
    }, [filters, opportunities]);

    const resetFilters = () => {
        setFilters({
            category: 'all',
            trustScore: 'all',
            maxDistance: 20000
        });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-red-600 px-4 text-center">
                <p className="mb-2 font-semibold">Error loading opportunities:</p>
                <p>{error}</p>
                {error.includes('index') && (
                    <p className="mt-4 text-sm text-gray-500">
                        Developer Note: Check the console or the link above to create the required Firestore index.
                    </p>
                )}
            </div>
        );
    }

    const activeFiltersCount =
        (filters.category !== 'all' ? 1 : 0) +
        (filters.trustScore !== 'all' ? 1 : 0) +
        (filters.maxDistance !== 20000 ? 1 : 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fadeIn relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Opportunities Near You</h1>
                    <p className="text-gray-500 mt-1">
                        Showing {filteredOpportunities.length} of {opportunities.length} results near <span className="font-medium text-primary">{userLocation ? `${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}` : 'you'}</span>
                    </p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-gray-700 hover:bg-white/90 hover:shadow-md transition-all"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {/* Filter Dropdown */}
                    {showFilters && (
                        <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl shadow-xl p-6 z-[100] animate-fadeIn">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900">Filters</h3>
                                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="jobs">Jobs</option>
                                    <option value="services">Services</option>
                                    <option value="training">Training</option>
                                    <option value="schemes">Schemes</option>
                                </select>
                            </div>

                            {/* Trust Score Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Trust Score</label>
                                <select
                                    value={filters.trustScore}
                                    onChange={(e) => setFilters({ ...filters, trustScore: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="all">All Scores</option>
                                    <option value="high">High (70+)</option>
                                    <option value="medium">Medium (40-69)</option>
                                    <option value="low">Low (&lt;40)</option>
                                </select>
                            </div>

                            {/* Distance Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Distance: {filters.maxDistance >= 20000 ? 'Unlimited' : `${filters.maxDistance} km`}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20000"
                                    value={filters.maxDistance}
                                    onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1 km</span>
                                    <span>Unlimited</span>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={resetFilters}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Opportunities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
                {filteredOpportunities.map((opp, index) => (
                    <div
                        key={opp.id}
                        onClick={() => navigate(`/opportunity/${opp.id}`)}
                        className="glass-card p-6 rounded-2xl cursor-pointer group hover:shadow-2xl transition-all duration-300 animate-fadeIn border border-black"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        {/* Category Badge */}
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide border border-primary/20">
                                {opp.category}
                            </span>
                            {/* Trust Score Badge */}
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${opp.trustScore >= 70
                                ? 'bg-green-100/80 text-green-700 border border-green-200'
                                : opp.trustScore >= 40
                                    ? 'bg-yellow-100/80 text-yellow-700 border border-yellow-200'
                                    : 'bg-gray-100/80 text-gray-600 border border-gray-200'
                                }`}>
                                <Shield className="w-3 h-3" />
                                {opp.trustScore}
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {opp.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{opp.location?.address || 'Location not available'}</span>
                            <span className="ml-auto text-primary font-semibold whitespace-nowrap">
                                {opp.distance ? (typeof opp.distance === 'number' ? `${opp.distance.toFixed(1)} km` : `${opp.distance} km`) : ''}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {opp.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp className="w-3 h-3 text-secondary" />
                                        <span className="font-medium">{opp.vouchCount || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatDate(opp.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                View <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredOpportunities.length === 0 && !loading && (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Opportunities Found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or location</p>
                    <button
                        onClick={() => navigate('/post')}
                        className="px-6 py-3 bg-gradient-to-r from-secondary to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                    >
                        Post an Opportunity
                    </button>
                </div>
            )}
        </div>
    );
};

export default OpportunityList;