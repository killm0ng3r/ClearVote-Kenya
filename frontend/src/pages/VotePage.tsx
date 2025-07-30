// frontend/src/pages/VotePage.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

interface Candidate {
  id: string
  name: string
  party?: string
  bio?: string
}

interface County {
  id: number
  name: string
}

interface Constituency {
  id: string
  name: string
}

interface Ward {
  id: string
  name: string
}

interface Position {
  id: string
  title: string
  positionType: string
  candidates: Candidate[]
  county?: County
  constituency?: Constituency
  ward?: Ward
}

interface Ballot {
  ballotNumber: number
  title: string
  description: string
  positions: Position[]
}

interface Election {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
}

interface UserLocation {
  county?: County
  constituency?: Constituency
  ward?: Ward
}

interface BallotResponse {
  election: Election
  userLocation: UserLocation
  ballots: Ballot[]
  totalBallots: number
}

interface VoteResult {
  voteId: string
  electionId: string
  candidateId: string
  transactionHash: string | null
  timestamp: string
}

interface VoteResponse {
  message: string
  votes: VoteResult[]
}

export default function VotePage() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const [ballotData, setBallotData] = useState<BallotResponse | null>(null)
  const [votes, setVotes] = useState<{ [positionId: string]: string }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBallotStructure = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (!user.id) {
          toast.error('Please log in to vote.')
          navigate('/login')
          return
        }

        // Get ballot structure for this user and election
        const ballotRes = await fetch(`http://localhost:3002/api/elections/${electionId}/ballot/${user.id}`)
        if (!ballotRes.ok) {
          const errorData = await ballotRes.json()
          throw new Error(errorData.error || 'Failed to load ballot')
        }

        const ballotData: BallotResponse = await ballotRes.json()
        setBallotData(ballotData)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load ballot.'
        toast.error(errorMessage)
        if (errorMessage.includes('location not set')) {
          navigate('/profile')
        } else if (errorMessage.includes('not found')) {
          navigate('/dashboard')
        }
      } finally {
        setLoading(false)
      }
    }

    if (electionId) fetchBallotStructure()
  }, [electionId, navigate])

  const handleSelect = (positionId: string, candidateId: string) => {
    setVotes(prev => ({
      ...prev,
      [positionId]: candidateId
    }))
  }

  const handleVote = async () => {
    if (!ballotData) return
    
    // Count total positions across all ballots
    const totalPositions = ballotData.ballots.reduce((sum, ballot) => sum + ballot.positions.length, 0)
    
    if (Object.keys(votes).length !== totalPositions) {
      toast.error('Please vote for all positions.')
      return
    }

    const payload = Object.entries(votes).map(([, candidateId]) => ({
      electionId: ballotData.election.id,
      candidateId
    }))

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3002/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to submit vote')
      }

      const result = await res.json() as VoteResponse
      
      // Check if votes were recorded on blockchain
      const blockchainVotes = result.votes.filter((v: VoteResult) => v.transactionHash)
      const dbOnlyVotes = result.votes.filter((v: VoteResult) => !v.transactionHash)
      
      if (blockchainVotes.length > 0) {
        toast.success(`Vote submitted successfully! ${blockchainVotes.length} vote(s) recorded on blockchain.`)
      } else if (dbOnlyVotes.length > 0) {
        toast.success('Vote submitted successfully! (Stored in database - blockchain unavailable)')
      }
      
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit vote.'
      toast.error(errorMessage)
    }
  }

  if (loading) {
    return <Layout><div className="text-center py-10 text-gray-500">Loading ballot...</div></Layout>
  }

  if (!ballotData) {
    return <Layout><div className="text-center py-10 text-red-600">Ballot not found.</div></Layout>
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{ballotData.election.title}</h1>
        <p className="text-gray-600 mb-6">{ballotData.election.description}</p>

        {/* User Location Info */}
        {ballotData.userLocation.county && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Your Voting Location</h3>
            <p className="text-blue-700 text-sm">
              County: {ballotData.userLocation.county.name} |
              Constituency: {ballotData.userLocation.constituency?.name} |
              Ward: {ballotData.userLocation.ward?.name}
            </p>
            <p className="text-blue-600 text-xs mt-1">
              You have {ballotData.totalBallots} ballot(s) to complete
            </p>
          </div>
        )}

        {/* Ballot Structure */}
        {ballotData.ballots.map((ballot) => (
          <div key={ballot.ballotNumber} className="mb-8">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-lg">
              <h2 className="text-xl font-bold">Ballot {ballot.ballotNumber}: {ballot.title}</h2>
              <p className="text-green-100 text-sm">{ballot.description}</p>
            </div>
            
            {ballot.positions.map((position) => (
              <div key={position.id} className="bg-white border border-gray-200 border-t-0 last:rounded-b-lg p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{position.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {position.positionType.replace('_', ' ')}
                    </span>
                    {position.county && (
                      <span>County: {position.county.name}</span>
                    )}
                    {position.constituency && (
                      <span>Constituency: {position.constituency.name}</span>
                    )}
                    {position.ward && (
                      <span>Ward: {position.ward.name}</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {position.candidates.map((candidate) => (
                    <label
                      key={candidate.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={position.id}
                        value={candidate.id}
                        checked={votes[position.id] === candidate.id}
                        onChange={() => handleSelect(position.id, candidate.id)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{candidate.name}</div>
                        {candidate.party && (
                          <div className="text-sm text-gray-600">{candidate.party}</div>
                        )}
                        {candidate.bio && (
                          <div className="text-sm text-gray-500 mt-1">{candidate.bio}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Voting Progress</h3>
          <div className="text-sm text-gray-600">
            Selected: {Object.keys(votes).length} of {ballotData.ballots.reduce((sum, ballot) => sum + ballot.positions.length, 0)} positions
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(Object.keys(votes).length / ballotData.ballots.reduce((sum, ballot) => sum + ballot.positions.length, 0)) * 100}%`
              }}
            ></div>
          </div>
        </div>

        <button
          onClick={handleVote}
          disabled={Object.keys(votes).length !== ballotData.ballots.reduce((sum, ballot) => sum + ballot.positions.length, 0)}
          className="mt-6 w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Submit All Votes ({Object.keys(votes).length}/{ballotData.ballots.reduce((sum, ballot) => sum + ballot.positions.length, 0)})
        </button>
      </div>
    </Layout>
  )
}
