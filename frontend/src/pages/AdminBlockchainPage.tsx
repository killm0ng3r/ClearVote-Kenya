import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

interface BlockchainStatus {
  isConnected: boolean
  networkId: number | null
  blockNumber: number | null
  accountsCount: number
  contractAddress: string | null
  lastChecked: string
}

interface VotingStatistics {
  totalVotes: number
  totalElections: number
  averageVotesPerElection: number
  lastVoteTimestamp: string
}

interface ElectionResult {
  electionId: string
  electionTitle: string
  totalVotes: number
  tally: {
    candidateId: string
    candidateName: string
    candidateParty: string
    position: string
    voteCount: number
  }[]
}

interface AnonymizedVote {
  voteId: string
  electionId: string
  candidateId: string
  electionTitle: string
  candidateName: string
  candidateParty: string
  position: string
  timestamp: string
}

interface Election {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  isPublished: boolean
}

export default function AdminBlockchainPage() {
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null)
  const [votingStats, setVotingStats] = useState<VotingStatistics | null>(null)
  const [elections, setElections] = useState<Election[]>([])
  const [selectedElection, setSelectedElection] = useState<string>('')
  const [electionResult, setElectionResult] = useState<ElectionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const token = localStorage.getItem('token')

  const fetchBlockchainStatus = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/admin/blockchain/status', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch blockchain status')
      const data = await res.json()
      setBlockchainStatus(data.status)
    } catch (error) {
      console.error('Error fetching blockchain status:', error)
      toast.error('Failed to fetch blockchain status')
    }
  }

  const fetchAllVotes = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/admin/blockchain/results', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch votes')
      const data = await res.json()
      
      // Calculate basic statistics
      const uniqueElections = new Set(data.votes?.map((vote: AnonymizedVote) => vote.electionId.split('-')[0]) || [])
      setVotingStats({
        totalVotes: data.totalVotes || 0,
        totalElections: uniqueElections.size,
        averageVotesPerElection: uniqueElections.size > 0 ? Math.round((data.totalVotes || 0) / uniqueElections.size) : 0,
        lastVoteTimestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error fetching votes:', error)
      toast.error('Failed to fetch voting data')
    } finally {
      setLoading(false)
    }
  }

  const fetchElections = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/elections')
      if (!res.ok) throw new Error('Failed to fetch elections')
      const data = await res.json()
      setElections(data)
    } catch (error) {
      console.error('Error fetching elections:', error)
    }
  }

  useEffect(() => {
    fetchBlockchainStatus()
    fetchAllVotes()
    fetchElections()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchElectionResult = async (electionId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`http://localhost:3002/api/admin/blockchain/results/${electionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch election results')
      const data = await res.json()
      setElectionResult({
        electionId: data.election.id,
        electionTitle: data.election.title,
        totalVotes: data.totalVotes,
        tally: data.tally
      })
    } catch (error) {
      console.error('Error fetching election results:', error)
      toast.error('Failed to fetch election results')
    } finally {
      setLoading(false)
    }
  }

  const handleElectionChange = (electionId: string) => {
    setSelectedElection(electionId)
    if (electionId) {
      fetchElectionResult(electionId)
    } else {
      setElectionResult(null)
    }
  }

  const exportData = async (format: 'csv' | 'json') => {
    try {
      setExporting(true)
      const url = selectedElection 
        ? `http://localhost:3002/api/admin/blockchain/export?format=${format}&electionId=${selectedElection}`
        : `http://localhost:3002/api/admin/blockchain/export?format=${format}`
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to export data')
      
      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `blockchain-results-${Date.now()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      toast.success(`Data exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  if (loading && !votingStats) {
    return (
      <Layout>
        <div className="max-w-6xl w-full mx-auto px-4 py-10">
          <div className="text-center py-10 text-gray-500">Loading blockchain data...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl w-full mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Blockchain Voting Results</h1>
        <p className="text-gray-600 mb-8">Query and export anonymized voting data from the blockchain.</p>

        {/* Blockchain Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Blockchain Status</h2>
          {blockchainStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  blockchainStatus.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {blockchainStatus.isConnected ? '✅ Connected' : '❌ Disconnected'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Network ID</div>
                <div className="font-semibold">{blockchainStatus.networkId || 'N/A'}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Block Number</div>
                <div className="font-semibold">{blockchainStatus.blockNumber || 'N/A'}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading status...</div>
          )}
        </div>

        {/* Voting Statistics */}
        {votingStats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Voting Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{votingStats.totalVotes}</div>
                <div className="text-sm text-gray-500">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{votingStats.totalElections}</div>
                <div className="text-sm text-gray-500">Elections</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{votingStats.averageVotesPerElection}</div>
                <div className="text-sm text-gray-500">Avg Votes/Election</div>
              </div>
            </div>
          </div>
        )}

        {/* Election Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Query Specific Election</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Election
              </label>
              <select
                value={selectedElection}
                onChange={(e) => handleElectionChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Elections</option>
                {elections.map(election => (
                  <option key={election.id} value={election.id}>
                    {election.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportData('csv')}
                disabled={exporting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <button
                onClick={() => exportData('json')}
                disabled={exporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export JSON'}
              </button>
            </div>
          </div>
        </div>

        {/* Election Results */}
        {electionResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Results: {electionResult.electionTitle}
            </h2>
            <p className="text-gray-600 mb-4">Total Votes: {electionResult.totalVotes}</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Votes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {electionResult.tally.map((candidate, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {candidate.candidateName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.candidateParty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.voteCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Privacy Protection</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>All exported data is anonymized to protect voter privacy. Individual votes cannot be traced back to specific voters. Only aggregate voting results and statistics are available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}