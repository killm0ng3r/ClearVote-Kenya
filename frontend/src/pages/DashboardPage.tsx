import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

interface Position {
  title: string
  candidates: Candidate[]
}

interface Candidate {
  id: string
  name: string
  party?: string
  bio?: string
  position: string
}

interface Election {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  isPublished: boolean
  positions: Position[]
}

export default function DashboardPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch('http://localhost:3002/api/elections')
        if (!res.ok) throw new Error('Failed to fetch elections')
        const data = await res.json()
        setElections(data)
      } catch (error) {
        console.error('Error fetching elections:', error)
        toast.error('Failed to load elections.')
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [])

  const getElectionStatus = (election: Election) => {
    const now = new Date()
    const startTime = new Date(election.startTime)
    const endTime = new Date(election.endTime)

    if (now < startTime) {
      return { status: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'Active', color: 'bg-green-100 text-green-800' }
    } else {
      return { status: 'Ended', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleElectionClick = (election: Election) => {
    const { status } = getElectionStatus(election)
    
    if (status === 'Active') {
      navigate(`/vote/${election.id}`)
    } else if (status === 'Ended') {
      navigate(`/tally/${election.id}`)
    } else {
      toast('This election has not started yet.', { icon: 'ℹ️' })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl w-full mx-auto px-4 py-10">
          <div className="text-center py-10 text-gray-500">Loading elections...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl w-full mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Elections Dashboard</h1>
        <p className="text-gray-600 mb-8">View and participate in available elections.</p>

        {elections.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-gray-500 text-lg">No elections available</div>
            <p className="text-gray-400 mt-2">Elections will appear here when they are created.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map(election => {
              const { status, color } = getElectionStatus(election)
              const canVote = status === 'Active'
              const canViewResults = status === 'Ended'
              
              return (
                <div
                  key={election.id}
                  onClick={() => handleElectionClick(election)}
                  className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 border-2 border-transparent ${
                    canVote || canViewResults
                      ? 'cursor-pointer hover:shadow-lg hover:border-blue-200 hover:-translate-y-1'
                      : 'cursor-not-allowed opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {election.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                      {status}
                    </span>
                  </div>
                  
                  {election.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {election.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span>{formatDate(election.startTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End:</span>
                      <span>{formatDate(election.endTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Positions:</span>
                      <span>{election.positions.length}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {canVote && (
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Click to Vote
                      </div>
                    )}
                    {canViewResults && (
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Click to View Results
                      </div>
                    )}
                    {status === 'Upcoming' && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Starts {formatDate(election.startTime)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}