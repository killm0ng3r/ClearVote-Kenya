// frontend/src/pages/ResultsPage.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

interface Candidate {
  candidateId: string
  candidateName: string
  party: string
  voteCount: number
}

interface Position {
  positionId: string
  title: string
  positionType: string
  location: {
    county?: string
    constituency?: string
    ward?: string
  }
  candidates: Candidate[]
  totalVotes: number
}

interface Ballot {
  ballotNumber: number
  title: string
  positions: Position[]
}

interface TallyResponse {
  electionId: string
  ballots: Ballot[]
  totalVotes: number
  source: string
}

export default function ResultsPage() {
  const { electionId } = useParams()
  const [tallyData, setTallyData] = useState<TallyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const isAdmin = localStorage.getItem('role') === 'ADMIN'

  useEffect(() => {
    const fetchTally = async () => {
      if (!electionId) {
        toast.error('No election selected')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`http://localhost:3002/api/votes/election/${electionId}/tally`)
        if (!res.ok) {
          throw new Error('Failed to fetch tally')
        }

        const data: TallyResponse = await res.json()
        setTallyData(data)
      } catch (error) {
        console.error('Error fetching tally:', error)
        toast.error('Failed to load election results')
      } finally {
        setLoading(false)
      }
    }

    fetchTally()
    
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(fetchTally, 30000)
    return () => clearInterval(interval)
  }, [electionId])

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-10 text-gray-500">Loading results...</div>
        </div>
      </Layout>
    )
  }

  if (!tallyData) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-10 text-red-600">No results available</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {isAdmin ? 'Live Election Tally' : 'Election Results'}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total Votes Cast: {tallyData.totalVotes.toLocaleString()}</span>
            <span className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${tallyData.source === 'blockchain' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              Source: {tallyData.source === 'blockchain' ? 'Blockchain' : 'Database'}
            </span>
            {isAdmin && (
              <span className="text-blue-600">Auto-refreshing every 30s</span>
            )}
          </div>
        </div>

        {tallyData.ballots.map((ballot) => (
          <div key={ballot.ballotNumber} className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-t-lg">
              <h2 className="text-xl font-bold">Ballot {ballot.ballotNumber}: {ballot.title}</h2>
            </div>
            
            {ballot.positions.map((position) => (
              <div key={position.positionId} className="bg-white border border-gray-200 border-t-0 last:rounded-b-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{position.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {position.positionType.replace('_', ' ')}
                    </span>
                    {position.location.county && (
                      <span>County: {position.location.county}</span>
                    )}
                    {position.location.constituency && (
                      <span>Constituency: {position.location.constituency}</span>
                    )}
                    {position.location.ward && (
                      <span>Ward: {position.location.ward}</span>
                    )}
                    <span className="font-medium">Total Votes: {position.totalVotes.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {position.candidates.map((candidate, index) => {
                    const percentage = position.totalVotes > 0 ? (candidate.voteCount / position.totalVotes) * 100 : 0
                    const isWinner = index === 0 && candidate.voteCount > 0
                    
                    return (
                      <div
                        key={candidate.candidateId}
                        className={`p-4 border rounded-lg ${isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {isWinner && (
                              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                1
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{candidate.candidateName}</div>
                              {candidate.party && (
                                <div className="text-sm text-gray-600">{candidate.party}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{candidate.voteCount.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        
                        {/* Vote percentage bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${isWinner ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        {tallyData.ballots.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No votes have been cast yet.
          </div>
        )}
      </div>
    </Layout>
  )
}