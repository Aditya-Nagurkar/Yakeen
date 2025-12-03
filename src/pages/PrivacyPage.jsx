import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage = () => {
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
                    <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-blue-100">Last updated: November 20, 2025</p>
                </div>

                <div className="p-8 space-y-6 text-gray-700">
                    <p>
                        Your privacy is important to us. It is YakeeN's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 pt-4">1. Information We Collect</h2>
                    <p>
                        We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 pt-4">2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect in various ways, including to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>Provide, operate, and maintain our website</li>
                        <li>Improve, personalize, and expand our website</li>
                        <li>Understand and analyze how you use our website</li>
                        <li>Develop new products, services, features, and functionality</li>
                        <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                        <li>Send you emails</li>
                        <li>Find and prevent fraud</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-800 pt-4">3. Security</h2>
                    <p>
                        The security of your personal information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 pt-4">4. Links to Other Sites</h2>
                    <p>
                        Our website may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 pt-4">5. Changes to This Privacy Policy</h2>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                    </p>

                    <p className="pt-4 border-t border-gray-200">
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:contact@yakeen.com" className="text-primary hover:underline">contact@yakeen.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
