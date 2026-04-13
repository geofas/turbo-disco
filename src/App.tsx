import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import LessonPage from './pages/LessonPage'
import PracticePage from './pages/PracticePage'
import CurriculumPage from './pages/CurriculumPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import NotFoundPage from './pages/NotFoundPage'
import { ProgressProvider } from './contexts/ProgressContext'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/lesson/:level" element={<LessonPage />} />
            <Route path="/practice/:level" element={<PracticePage />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ProgressProvider>
    </AuthProvider>
  )
}

export default App
