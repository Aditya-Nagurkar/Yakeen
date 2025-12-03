import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import OpportunityList from './pages/OpportunityListPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import PostOpportunityPage from './pages/PostOpportunityPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import MyPostingsPage from './pages/MyPostingsPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="opportunities" element={<OpportunityList />} />
          <Route path="opportunity/:id" element={<OpportunityDetailPage />} />
          <Route path="post" element={<PostOpportunityPage />} />
          <Route path="my-postings" element={<MyPostingsPage />} />
          <Route path="signin" element={<SignInPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
