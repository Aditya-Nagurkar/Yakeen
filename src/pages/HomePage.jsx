import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Wrench, GraduationCap, Landmark, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import BlurText from '../components/BlurText';

const HomePage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [categoryCounts, setCategoryCounts] = useState({
        jobs: 0,
        services: 0,
        training: 0,
        schemes: 0
    });

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (locationQuery) params.append('loc', locationQuery);
        navigate(`/opportunities?${params.toString()}`);
    };

    useEffect(() => {
        const fetchCategoryCounts = async () => {
            try {
                console.log('Fetching category counts...');

                // Fetch all opportunities and count by category
                const q = query(collection(db, 'opportunities'));
                const snapshot = await getDocs(q);

                const counts = {
                    jobs: 0,
                    services: 0,
                    training: 0,
                    schemes: 0
                };

                snapshot.forEach((doc) => {
                    const category = doc.data().category;
                    if (category) {
                        const categoryLower = category.toLowerCase();
                        if (counts.hasOwnProperty(categoryLower)) {
                            counts[categoryLower]++;
                        }
                    }
                });

                console.log('Final counts:', counts);
                setCategoryCounts(counts);
            } catch (error) {
                console.error('Error fetching category counts:', error);
            }
        };

        fetchCategoryCounts();
    }, []);

    const categories = [
        { id: 'jobs', name: 'Jobs', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
        { id: 'services', name: 'Services', icon: Wrench, color: 'bg-orange-100 text-orange-600' },
        { id: 'training', name: 'Training', icon: GraduationCap, color: 'bg-green-100 text-green-600' },
        { id: 'schemes', name: 'Schemes', icon: Landmark, color: 'bg-purple-100 text-purple-600' },
    ];

    return (
        <div className="flex flex-col">
            <section className="relative py-20 px-4 overflow-hidden bg-grid-pattern">
                {/* Animated Background Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-float mix-blend-multiply filter"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -z-10 animate-float-delayed mix-blend-multiply filter"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl -z-10 animate-float-slow mix-blend-multiply filter"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-gray-900">
                        <BlurText text="Trust That's" className="inline" /> <BlurText text="Near You" className="inline text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500" delay={0.3} />
                    </h1>

                    <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        Find verified jobs, services, and government schemes in your neighborhood.
                        Backed by community trust.
                    </p>

                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl p-2 flex shadow-xl animate-slideUp hover:shadow-2xl transition-shadow duration-300" style={{ animationDelay: '0.2s' }}>
                        <div className="flex-1 flex items-center px-4 border-r border-gray-200/50">
                            <MapPin className="w-5 h-5 text-primary mr-3" />
                            <input
                                type="text"
                                placeholder="Pincode or City"
                                className="w-full py-3 outline-none text-gray-700 bg-transparent placeholder-gray-400"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex-[1.5] flex items-center px-4">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Search jobs, services..."
                                className="w-full py-3 outline-none text-gray-700 bg-transparent placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="px-8 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
                            Search
                        </button>
                    </form>
                </div>
            </section>

            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
                        <button onClick={() => navigate('/opportunities')} className="text-primary font-medium flex items-center hover:underline">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((cat, index) => (
                            <div
                                key={cat.id}
                                onClick={() => navigate(`/opportunities?category=${cat.id}`)}
                                className="glass-card p-6 rounded-2xl flex flex-col items-center cursor-pointer group animate-fadeIn border border-black"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${cat.color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                                    <cat.icon className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{cat.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {categoryCounts[cat.id]} Active
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;