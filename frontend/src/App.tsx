// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import VotePage from './pages/VotePage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'
import TallyPage from './pages/TallyPage'
import CreateElectionPage from './pages/CreateElectionPage'
import VotersPage from './pages/VotersPage'
import AdminBlockchainPage from './pages/AdminBlockchainPage'
import NotFoundPage from './pages/NotFoundPage'
import ForbiddenPage from './pages/ForbiddenPage'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import VoterRoute from './routes/VoterRoute'
import ElectionsPage from './pages/ElectionsPage'

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* <Toaster position="top-right" /> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/tally" element={<ProtectedRoute><TallyPage /></ProtectedRoute>} />
        <Route path="/tally/:electionId" element={<ProtectedRoute><TallyPage /></ProtectedRoute>} />
        <Route path="/elections" element={<ElectionsPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/vote/:electionId" element={<VoterRoute><VotePage /></VoterRoute>} />
        <Route path="/elections/:electionId" element={<VoterRoute><VotePage /></VoterRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="/create-election" element={<AdminRoute><CreateElectionPage /></AdminRoute>} />
        <Route path="/voters" element={<AdminRoute><VotersPage /></AdminRoute>} />
        <Route path="/admin/blockchain" element={<AdminRoute><AdminBlockchainPage /></AdminRoute>} />
        

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}