import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import LessonPage from './pages/LessonPage'
import PracticePage from './pages/PracticePage'
import CurriculumPage from './pages/CurriculumPage'
import ProfilePage from './pages/ProfilePage'
import './index.css'

function App() {
  return (
    <Router>
      <Header />
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
