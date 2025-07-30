// frontend/src/pages/TallyPage.tsx
import { useEffect, useState, useCallback } from 'react'
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

interface TallyData {
  electionId: string
  ballots: Ballot[]
  totalVotes: number
  source: 'blockchain' | 'database'
}

interface Election {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  isPublished: boolean
}

interface BlockchainStatus {
  networkId: number | null
  blockNumber: number | null
  accountsCount: number
  contractAddress: string | null
  isConnected: boolean
}

export default function TallyPage() {
  const { electionId } = useParams()
  const [election, setElection] = useState<Election | null>(null)
  const [elections, setElections] = useState<Election[]>([])
  const [tallyData, setTallyData] = useState<TallyData | null>(null)
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchElections = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3002/api/elections')
      if (!res.ok) throw new Error('Failed to fetch elections')
      const data = await res.json()
      setElections(data.filter((election: Election) => election.isPublished))
    } catch (error) {
      console.error('Error fetching elections:', error)
      toast.error('Failed to load elections.')
    }
  }, [])

  const fetchElection = useCallback(async () => {
    if (!electionId) return
    
    try {
      const res = await fetch(`http://localhost:3002/api/elections/${electionId}`)
      if (!res.ok) throw new Error('Failed to fetch election')
      const data = await res.json()
      setElection(data)
    } catch (error) {
      console.error('Error fetching election:', error)
      toast.error('Failed to load election details.')
    }
  }, [electionId])

  const fetchTally = useCallback(async () => {
    if (!electionId) return
    
    try {
      const res = await fetch(`http://localhost:3002/api/votes/election/${electionId}/tally`)
      if (!res.ok) throw new Error('Failed to fetch tally')
      const data = await res.json()
      setTallyData(data)
    } catch (error) {
      console.error('Error fetching tally:', error)
      toast.error('Failed to load vote tally.')
    }
  }, [electionId])

  const fetchBlockchainStatus = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3002/api/votes/blockchain/status')
      if (!res.ok) throw new Error('Failed to fetch blockchain status')
      const data = await res.json()
      setBlockchainStatus(data)
    } catch (error) {
      console.error('Error fetching blockchain status:', error)
    }
  }, [])

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([fetchTally(), fetchBlockchainStatus()])
    setRefreshing(false)
    toast.success('Data refreshed!')
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      if (electionId) {
        // Load specific election data
        await Promise.all([fetchElection(), fetchTally(), fetchBlockchainStatus()])
      } else {
        // Load elections list and blockchain status
        await Promise.all([fetchElections(), fetchBlockchainStatus()])
      }
      setLoading(false)
    }

    loadData()
  }, [electionId, fetchElection, fetchTally, fetchBlockchainStatus, fetchElections])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (electionId && !refreshing) {
        fetchTally()
        fetchBlockchainStatus()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [electionId, refreshing, fetchTally, fetchBlockchainStatus])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10 text-gray-500">Loading election results...</div>
      </Layout>
    )
  }

  // If no electionId is provided, show election selection
  if (!electionId) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-10 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Election Results</h1>
            <p className="text-gray-600 mb-6">Select an election to view its results and tally.</p>
            
            {blockchainStatus && (
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Blockchain:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    blockchainStatus.isConnected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {blockchainStatus.isConnected ? '✅ Connected' : '❌ Disconnected'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {elections.length > 0 ? (
            <div className="space-y-4">
              {elections.map((election) => (
                <div key={election.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{election.title}</h3>
                      <p className="text-gray-600 mb-3">{election.description}</p>
                      <div className="text-sm text-gray-500">
                        <span>Start: {new Date(election.startTime).toLocaleString()}</span>
                        <span className="mx-2">•</span>
                        <span>End: {new Date(election.endTime).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <a
                        href={`/tally/${election.id}`}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        View Results
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-gray-500 text-lg">No published elections found.</div>
              <p className="text-gray-400 mt-2">Elections will appear here once they are published.</p>
            </div>
          )}

          {blockchainStatus && (
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Blockchain Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Network ID:</span>
                  <div className="font-medium">{blockchainStatus.networkId || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Block Number:</span>
                  <div className="font-medium">{blockchainStatus.blockNumber || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Accounts:</span>
                  <div className="font-medium">{blockchainStatus.accountsCount}</div>
                </div>
                <div>
                  <span className="text-gray-600">Contract:</span>
                  <div className="font-medium text-xs">
                    {blockchainStatus.contractAddress
                      ? `${blockchainStatus.contractAddress.slice(0, 8)}...`
                      : 'Not Set'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    )
  }

  if (!election) {
    return (
      <Layout>
        <div className="text-center py-10 text-red-600">Election not found.</div>
      </Layout>
    )
  }

  // Extract all positions from ballots
  const allPositions = tallyData?.ballots.flatMap(ballot => ballot.positions) || []

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.title} - Results</h1>
          <p className="text-gray-600 mb-4">{election.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Data Source:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                tallyData?.source === 'blockchain'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {tallyData?.source === 'blockchain' ? '🔗 Blockchain' : '💾 Database'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Blockchain:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                blockchainStatus?.isConnected
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {blockchainStatus?.isConnected ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              Total Votes: <span className="font-semibold">{tallyData?.totalVotes || 0}</span>
            </div>
            
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {tallyData && allPositions.length > 0 ? (
          <div className="space-y-8">
            {tallyData.ballots.map((ballot) => (
              <div key={ballot.ballotNumber} className="space-y-6">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg">
                  <h2 className="text-xl font-bold">Ballot {ballot.ballotNumber}: {ballot.title}</h2>
                </div>
                
                {ballot.positions.map((position) => (
                  <div key={position.positionId} className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{position.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                        <span className="font-medium">Total Votes: {position.totalVotes}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {position.candidates
                        .sort((a, b) => b.voteCount - a.voteCount)
                        .map((candidate, index) => {
                          const percentage = position.totalVotes > 0
                            ? (candidate.voteCount / position.totalVotes * 100).toFixed(1)
                            : '0.0'
                          
                          return (
                            <div key={candidate.candidateId} className="flex items-center space-x-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                              }`}>
                                {index + 1}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <div>
                                    <span className="font-medium text-gray-900">{candidate.candidateName}</span>
                                    {candidate.party && (
                                      <span className="text-gray-600 ml-2">({candidate.party})</span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-lg">{candidate.voteCount}</span>
                                    <span className="text-gray-600 ml-2">({percentage}%)</span>
                                  </div>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className={`h-3 rounded-full ${
                                      index === 0 ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-gray-500 text-lg">No votes recorded yet.</div>
            <p className="text-gray-400 mt-2">Results will appear here as votes are cast.</p>
          </div>
        )}

        {blockchainStatus && (
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Blockchain Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Network ID:</span>
                <div className="font-medium">{blockchainStatus.networkId || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-600">Block Number:</span>
                <div className="font-medium">{blockchainStatus.blockNumber || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-600">Accounts:</span>
                <div className="font-medium">{blockchainStatus.accountsCount}</div>
              </div>
              <div>
                <span className="text-gray-600">Contract:</span>
                <div className="font-medium text-xs">
                  {blockchainStatus.contractAddress
                    ? `${blockchainStatus.contractAddress.slice(0, 8)}...`
                    : 'Not Set'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}