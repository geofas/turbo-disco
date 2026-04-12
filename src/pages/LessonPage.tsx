import { useParams } from 'react-router-dom'

export default function LessonPage() {
  const { level } = useParams()
  return (
    <div className="container-sudoku">
      <h1 className="text-center">Lesson Page - Level {level}</h1>
      <p className="text-center text-gray-600">Guided lesson content here</p>
    </div>
  )
}
