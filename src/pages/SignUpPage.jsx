import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Briefcase, Search, ArrowLeft } from 'lucide-react';
import { signUp } from '../services/auth';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'seeker'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signUp(formData.email, formData.password, {
                name: formData.name,
                phone: formData.phone,
                role: formData.role
            });
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-24 left-4 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors group z-10"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
            </button>

            <div className="glass-card rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-fadeIn">
                <div className="bg-gradient-to-r from-secondary to-orange-600 p-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">Join YakeeN</h1>
                    <p className="text-orange-100">Create your account to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="seeker"
                                    checked={formData.role === 'seeker'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="peer sr-only"
                                />
                                <div className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-gray-200 peer-checked:bg-blue-50 peer-checked:border-primary peer-checked:text-primary hover:bg-gray-50 transition-all">
                                    <Search className="w-4 h-4" />
                                    <span className="font-medium">Seeker</span>
                                </div>
                            </label>
                            <label className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="poster"
                                    checked={formData.role === 'poster'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="peer sr-only"
                                />
                                <div className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-gray-200 peer-checked:bg-orange-50 peer-checked:border-secondary peer-checked:text-secondary hover:bg-gray-50 transition-all">
                                    <Briefcase className="w-4 h-4" />
                                    <span className="font-medium">Poster</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-secondary hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-orange-500/30 disabled:opacity-70"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/signin" className="text-primary font-semibold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
