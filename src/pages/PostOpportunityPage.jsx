import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Briefcase, Phone, FileText, Hash, ArrowLeft } from 'lucide-react';
import { addOpportunity } from '../services/db';
import { getUserLocation, getCoordinatesFromAddress, getPincodeFromCoordinates, searchAddresses } from '../services/location';
import { useNavigate } from 'react-router-dom';
import { onAuthChange } from '../services/auth';

const PostOpportunityPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const addressInputRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Jobs',
        description: '',
        address: '',
        pincode: '',
        lat: null,
        lng: null,
        contact: ''
    });

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationDetect = async () => {
        setLocationLoading(true);
        try {
            const coords = await getUserLocation();

            // Get pincode and address from coordinates
            const locationData = await getPincodeFromCoordinates(coords.lat, coords.lng);

            setFormData(prev => ({
                ...prev,
                lat: coords.lat,
                lng: coords.lng,
                address: locationData.address || `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
                pincode: locationData.pincode || prev.pincode
            }));
            setShowSuggestions(false);
        } catch (error) {
            alert('Error detecting location: ' + error.message);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleAddressChange = async (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, address: value }));

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for search
        const timeout = setTimeout(async () => {
            if (value.length >= 3) {
                console.log('Searching for:', value);
                try {
                    const suggestions = await searchAddresses(value);
                    console.log('Got suggestions:', suggestions);
                    setAddressSuggestions(suggestions);
                    setShowSuggestions(suggestions.length > 0);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                    setAddressSuggestions([]);
                    setShowSuggestions(false);
                }
            } else {
                setAddressSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500); // Wait 500ms after user stops typing

        setSearchTimeout(timeout);
    };

    const handleSuggestionClick = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            address: suggestion.display_name,
            lat: suggestion.lat,
            lng: suggestion.lng,
            pincode: suggestion.postcode || prev.pincode
        }));
        setShowSuggestions(false);
        setAddressSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalLat = formData.lat;
            let finalLng = formData.lng;

            // If no GPS, try to geocode Pincode or Address
            if (!finalLat || !finalLng) {
                if (formData.pincode) {
                    try {
                        const coords = await getCoordinatesFromAddress(formData.pincode);
                        finalLat = coords.lat;
                        finalLng = coords.lng;
                    } catch (err) {
                        console.warn("Pincode geocoding failed", err);
                    }
                }

                // Fallback to address if pincode failed or not provided
                if ((!finalLat || !finalLng) && formData.address) {
                    try {
                        const coords = await getCoordinatesFromAddress(formData.address);
                        finalLat = coords.lat;
                        finalLng = coords.lng;
                    } catch (err) {
                        console.warn("Address geocoding failed", err);
                    }
                }
            }

            if (!finalLat || !finalLng) {
                alert('Could not determine location. Please use "Detect GPS" or enter a valid Pincode/City.');
                setLoading(false);
                return;
            }

            // Submit to Firestore with userId
            await addOpportunity({
                ...formData,
                category: formData.category.toUpperCase(),
                lat: finalLat,
                lng: finalLng,
                userId: currentUser?.uid || 'anonymous' // Save user ID for ownership
            });

            alert('Opportunity posted successfully!');
            navigate('/opportunities');
        } catch (error) {
            console.error(error);
            alert('Failed to post opportunity.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
            </button>

            <div className="glass-card rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
                    <h1 className="text-2xl font-bold">Post an Opportunity</h1>
                    <p className="text-blue-100 mt-1">Help your community by sharing verified jobs and services.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g. Factory Worker Needed"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Jobs', 'Services', 'Training', 'Schemes'].map((cat) => (
                                <label key={cat} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        value={cat}
                                        checked={formData.category === cat}
                                        onChange={handleInputChange}
                                        className="peer sr-only"
                                        required
                                    />
                                    <div className="text-center py-2 rounded-lg border border-gray-200 peer-checked:bg-blue-50 peer-checked:border-primary peer-checked:text-primary hover:bg-gray-50 transition-all">
                                        {cat}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows="4"
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe the role, requirements, and benefits..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    {/* Location & Pincode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 z-10" />
                                <input
                                    ref={addressInputRef}
                                    type="text"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleAddressChange}
                                    onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                                    placeholder="Start typing address..."
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={handleLocationDetect}
                                    disabled={locationLoading}
                                    className="absolute right-2 top-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded transition-colors disabled:opacity-50 z-10"
                                >
                                    {locationLoading ? 'Detecting...' : 'Detect GPS'}
                                </button>

                                {/* Autocomplete Suggestions Dropdown */}
                                {showSuggestions && addressSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                        {addressSuggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-2"
                                            >
                                                <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900 truncate">{suggestion.display_name}</p>
                                                    {suggestion.postcode && (
                                                        <p className="text-xs text-gray-500 mt-1">Pincode: {suggestion.postcode}</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 110001"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            {formData.lat ? (
                                <p className="text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg w-full">
                                    ✓ Location Captured: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500 italic px-1">
                                    * Enter Pincode or use Detect GPS for accurate location.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="tel"
                                name="contact"
                                required
                                value={formData.contact}
                                onChange={handleInputChange}
                                placeholder="+91 98765 43210"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/30 disabled:opacity-70"
                    >
                        {loading ? 'Posting...' : 'Post Opportunity'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostOpportunityPage;
