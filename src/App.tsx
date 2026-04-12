import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LessonPage from './pages/LessonPage'
import PracticePage from './pages/PracticePage'
import CurriculumPage from './pages/CurriculumPage'
import ProfilePage from './pages/ProfilePage'
import './index.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lesson/:level" element={<LessonPage />} />
        <Route path="/practice/:level" element={<PracticePage />} />
        <Route path="/curriculum" element={<CurriculumPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  )
}

export default App
