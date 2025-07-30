import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

interface County {
  id: number
  name: string
  code: number
}

interface Constituency {
  id: string
  name: string
  countyId: number
}

interface Ward {
  id: string
  name: string
  constituencyId: string
}

interface Position {
  title: string
  positionType: string
  countyId?: number
  constituencyId?: string
  wardId?: string
  candidates: { name: string; party: string; bio: string }[]
}

const POSITION_TYPES = [
  { value: 'PRESIDENT', label: 'President', scope: 'national' },
  { value: 'GOVERNOR', label: 'Governor', scope: 'county' },
  { value: 'SENATOR', label: 'Senator', scope: 'county' },
  { value: 'WOMEN_REP', label: 'Women Representative', scope: 'county' },
  { value: 'MP', label: 'Member of Parliament', scope: 'constituency' },
  { value: 'MCA', label: 'Member of County Assembly', scope: 'ward' }
]

export default function CreateElectionPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [positions, setPositions] = useState<Position[]>([])
  
  // Position form state
  const [positionForm, setPositionForm] = useState({
    title: '',
    positionType: '',
    countyId: '',
    constituencyId: '',
    wardId: ''
  })
  
  // Candidate form state
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number>(-1)
  const [candidateForm, setCandidateForm] = useState({ name: '', party: '', bio: '' })
  
  // Geography data
  const [counties, setCounties] = useState<County[]>([])
  const [constituencies, setConstituencies] = useState<Constituency[]>([])
  const [wards, setWards] = useState<Ward[]>([])

  // Fetch counties on component mount
  useEffect(() => {
    const fetchCounties = async () => {
      try {
        const res = await fetch('http://localhost:3002/api/geography/counties')
        if (res.ok) {
          const data = await res.json()
          setCounties(data)
        }
      } catch (error) {
        console.error('Error fetching counties:', error)
      }
    }
    fetchCounties()
  }, [])

  // Fetch constituencies when county changes
  useEffect(() => {
    if (positionForm.countyId) {
      const fetchConstituencies = async () => {
        try {
          const res = await fetch(`http://localhost:3002/api/geography/counties/${positionForm.countyId}/constituencies`)
          if (res.ok) {
            const data = await res.json()
            setConstituencies(data)
            setPositionForm(prev => ({ ...prev, constituencyId: '', wardId: '' }))
            setWards([])
          }
        } catch (error) {
          console.error('Error fetching constituencies:', error)
        }
      }
      fetchConstituencies()
    } else {
      setConstituencies([])
      setPositionForm(prev => ({ ...prev, constituencyId: '', wardId: '' }))
      setWards([])
    }
  }, [positionForm.countyId])

  // Fetch wards when constituency changes
  useEffect(() => {
    if (positionForm.constituencyId) {
      const fetchWards = async () => {
        try {
          const res = await fetch(`http://localhost:3002/api/geography/constituencies/${positionForm.constituencyId}/wards`)
          if (res.ok) {
            const data = await res.json()
            setWards(data)
            setPositionForm(prev => ({ ...prev, wardId: '' }))
          }
        } catch (error) {
          console.error('Error fetching wards:', error)
        }
      }
      fetchWards()
    } else {
      setWards([])
      setPositionForm(prev => ({ ...prev, wardId: '' }))
    }
  }, [positionForm.constituencyId])

  const getPositionScope = (positionType: string) => {
    return POSITION_TYPES.find(pt => pt.value === positionType)?.scope || 'national'
  }

  const handlePositionTypeChange = (positionType: string) => {
    const scope = getPositionScope(positionType)
    const positionTypeLabel = POSITION_TYPES.find(pt => pt.value === positionType)?.label || positionType
    
    setPositionForm({
      title: positionTypeLabel,
      positionType,
      countyId: scope === 'national' ? '' : positionForm.countyId,
      constituencyId: scope === 'constituency' || scope === 'ward' ? positionForm.constituencyId : '',
      wardId: scope === 'ward' ? positionForm.wardId : ''
    })
  }

  const handleAddPosition = () => {
    if (!positionForm.title.trim() || !positionForm.positionType) {
      toast.error('Please fill in position title and type')
      return
    }

    const scope = getPositionScope(positionForm.positionType)
    
    // Validate geographical requirements
    if (scope === 'county' && !positionForm.countyId) {
      toast.error('Please select a county for this position type')
      return
    }
    if (scope === 'constituency' && !positionForm.constituencyId) {
      toast.error('Please select a constituency for this position type')
      return
    }
    if (scope === 'ward' && !positionForm.wardId) {
      toast.error('Please select a ward for this position type')
      return
    }

    const newPosition: Position = {
      title: positionForm.title,
      positionType: positionForm.positionType,
      candidates: []
    }

    // Add geographical scope based on position type
    if (scope !== 'national') {
      if (positionForm.countyId) newPosition.countyId = parseInt(positionForm.countyId)
      if (positionForm.constituencyId) newPosition.constituencyId = positionForm.constituencyId
      if (positionForm.wardId) newPosition.wardId = positionForm.wardId
    }

    setPositions([...positions, newPosition])
    setPositionForm({
      title: '',
      positionType: '',
      countyId: '',
      constituencyId: '',
      wardId: ''
    })
    toast.success('Position added successfully!')
  }

  const handleAddCandidate = () => {
    if (selectedPositionIndex === -1 || !candidateForm.name.trim()) {
      toast.error('Please select a position and enter candidate name')
      return
    }

    const updatedPositions = [...positions]
    updatedPositions[selectedPositionIndex].candidates.push({ ...candidateForm })
    setPositions(updatedPositions)
    setCandidateForm({ name: '', party: '', bio: '' })
    toast.success('Candidate added successfully!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (positions.length === 0) {
      toast.error('Please add at least one position')
      return
    }

    // Validate that all positions have candidates
    const positionsWithoutCandidates = positions.filter(pos => pos.candidates.length === 0)
    if (positionsWithoutCandidates.length > 0) {
      toast.error('All positions must have at least one candidate')
      return
    }

    const payload = {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      positions
    }

    try {
      const res = await fetch('http://localhost:3002/api/elections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create election')
      }

      toast.success('Election created successfully!')
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating election.'
      toast.error(errorMessage)
    }
  }

  const getLocationDisplay = (position: Position) => {
    const county = counties.find(c => c.id === position.countyId)
    const constituency = constituencies.find(c => c.id === position.constituencyId)
    const ward = wards.find(w => w.id === position.wardId)
    
    const parts = []
    if (county) parts.push(`County: ${county.name}`)
    if (constituency) parts.push(`Constituency: ${constituency.name}`)
    if (ward) parts.push(`Ward: ${ward.name}`)
    
    return parts.length > 0 ? parts.join(' | ') : 'National'
  }

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
            Create Kenyan Election
          </h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Election Info */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Election Title</label>
                <input
                  id="title"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                  placeholder="e.g. 2027 General Election"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  id="description"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                  placeholder="Describe the election"
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Add Position */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Position</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position Type</label>
                    <select
                      value={positionForm.positionType}
                      onChange={(e) => handlePositionTypeChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
                    >
                      <option value="">Select Position Type</option>
                      {POSITION_TYPES.map(pt => (
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position Title</label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
                      placeholder="Position title"
                      value={positionForm.title}
                      onChange={e => setPositionForm({ ...positionForm, title: e.target.value })}
                    />
                  </div>
                </div>

                {/* Geographical Scope Selection */}
                {positionForm.positionType && getPositionScope(positionForm.positionType) !== 'national' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-medium text-gray-900">Geographical Scope</h3>
                    
                    {(getPositionScope(positionForm.positionType) === 'county' || 
                      getPositionScope(positionForm.positionType) === 'constituency' || 
                      getPositionScope(positionForm.positionType) === 'ward') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                        <select
                          value={positionForm.countyId}
                          onChange={(e) => setPositionForm({ ...positionForm, countyId: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="">Select County</option>
                          {counties.map(county => (
                            <option key={county.id} value={county.id}>{county.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(getPositionScope(positionForm.positionType) === 'constituency' || 
                      getPositionScope(positionForm.positionType) === 'ward') && positionForm.countyId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Constituency</label>
                        <select
                          value={positionForm.constituencyId}
                          onChange={(e) => setPositionForm({ ...positionForm, constituencyId: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="">Select Constituency</option>
                          {constituencies.map(constituency => (
                            <option key={constituency.id} value={constituency.id}>{constituency.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {getPositionScope(positionForm.positionType) === 'ward' && positionForm.constituencyId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
                        <select
                          value={positionForm.wardId}
                          onChange={(e) => setPositionForm({ ...positionForm, wardId: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="">Select Ward</option>
                          {wards.map(ward => (
                            <option key={ward.id} value={ward.id}>{ward.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddPosition}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Add Position
                </button>
              </div>
            </div>

            {/* Display Added Positions */}
            {positions.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Added Positions</h3>
                <div className="space-y-3">
                  {positions.map((position, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{position.title}</h4>
                          <p className="text-sm text-gray-600">{position.positionType.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500">{getLocationDisplay(position)}</p>
                          <p className="text-sm text-blue-600">{position.candidates.length} candidate(s)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Candidate */}
            {positions.length > 0 && (
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Candidate</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Position</label>
                    <select
                      value={selectedPositionIndex}
                      onChange={(e) => setSelectedPositionIndex(parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
                    >
                      <option value={-1}>Select a position</option>
                      {positions.map((pos, index) => (
                        <option key={index} value={index}>{pos.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300"
                      placeholder="Candidate Name"
                      value={candidateForm.name}
                      onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })}
                    />
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300"
                      placeholder="Party"
                      value={candidateForm.party}
                      onChange={e => setCandidateForm({ ...candidateForm, party: e.target.value })}
                    />
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300"
                      placeholder="Bio"
                      value={candidateForm.bio}
                      onChange={e => setCandidateForm({ ...candidateForm, bio: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCandidate}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                  >
                    Add Candidate
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
            >
              Create Election
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
