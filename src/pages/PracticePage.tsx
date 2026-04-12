import { useParams } from 'react-router-dom'

export default function PracticePage() {
  const { level } = useParams()
  return (
    <div className="container-sudoku">
      <h1 className="text-center">Practice Page - Level {level}</h1>
      <p className="text-center text-gray-600">Practice puzzles here</p>
    </div>
  )
}
