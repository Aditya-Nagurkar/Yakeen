import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <button
                onClick={() => navigate(-1)}
                className="fixed top-24 left-4 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors group z-10"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
            </button>

            <div className="glass-card rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden animate-fadeIn">
                <div className="bg-gradient-to-r from-primary to-blue-600 p-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
                    <p className="text-blue-100">Last updated: November 20, 2025</p>
                </div>

                <div className="p-8 space-y-6 text-gray-700">
                    <p>
                        Please read these terms of service carefully before using YakeeN's services.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 pt-4">1. Conditions of Use</h2>
                    <p>
                        We will provide their services to you, which are subject to the conditions stated below in this document. Every time you visit this website, use its services or make a purchase, you accept the following conditions. This is why we urge you to read them carefully.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 pt-4">2. Privacy Policy</h2>
                    <p>
                        Before you continue using our website we advise you to read our <a href="/privacy" className="text-primary hover:underline">privacy policy</a> regarding our user data collection. It will help you better understand our practices.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 pt-4">3. Copyright</h2>
                    <p>
                        Content published on this website (digital downloads, images, texts, graphics, logos) is the property of YakeeN and/or its content creators and protected by international copyright laws.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 pt-4">4. Communications</h2>
                    <p>
                        The entire communication with us is electronic. Every time you send us an email or visit our website, you are going to be communicating with us. You hereby consent to receive communications from us.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 pt-4">5. Applicable Law</h2>
                    <p>
                        By visiting this website, you agree that the laws of India, without regard to principles of conflict laws, will govern these terms of service, or any dispute of any sort that might come between YakeeN and you, or its business partners and associates.
                    </p>

                    <p className="pt-4 border-t border-gray-200">
                        If you have any questions about these Terms, please contact us at <a href="mailto:contact@yakeen.com" className="text-primary hover:underline">contact@yakeen.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
