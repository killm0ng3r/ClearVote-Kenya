import { useEffect, useState } from 'react'

interface BlockchainStatus {
  networkId: number | null
  blockNumber: number | null
  accountsCount: number
  contractAddress: string | null
  isConnected: boolean
}

interface BlockchainStatusProps {
  className?: string
}

export default function BlockchainStatus({ className = '' }: BlockchainStatusProps) {
  const [status, setStatus] = useState<BlockchainStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/votes/blockchain/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch blockchain status:', error)
      setStatus({
        networkId: null,
        blockNumber: null,
        accountsCount: 0,
        contractAddress: null,
        isConnected: false
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 animate-fade-in ${className}`}>
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">Checking blockchain...</span>
      </div>
    )
  }

  if (!status) {
    return (
      <div className={`flex items-center space-x-2 animate-fade-in ${className}`}>
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-sm font-medium text-red-600">Blockchain unavailable</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 animate-fade-in ${className}`}>
      <div className={`w-3 h-3 rounded-full ${
        status.isConnected ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <span className={`text-sm font-medium ${
        status.isConnected ? 'text-green-600' : 'text-red-600'
      }`}>
        {status.isConnected ? 'Blockchain Connected' : 'Blockchain Disconnected'}
      </span>
      {status.isConnected && (
        <span className="text-xs font-medium text-gray-500">
          Block #{status.blockNumber}
        </span>
      )}
    </div>
  )
}