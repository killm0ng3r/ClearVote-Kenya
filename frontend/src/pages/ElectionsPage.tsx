// frontend/src/pages/ElectionsPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

interface Election {
  id: string
  title: string
  description?: string
}

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch('http://localhost:3002/api/elections')
        const data = await res.json()
        setElections(data)
      } catch {
        toast.error('Failed to load elections.')
      }
    }

    fetchElections()
  }, [])

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Elections</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map(election => (
            <div
              key={election.id}
              onClick={() => navigate(`/elections/${election.id}`)}
              className="cursor-pointer bg-white border rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{election.title}</h2>
              <p className="text-sm text-gray-600">{election.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
