// frontend/src/pages/VotersPage.tsx
import Layout from '../components/Layout'

export default function VotersPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Registered Voters</h1>
        <p className="text-gray-700">Admin can manage voter list here.</p>
      </div>
    </Layout>
  )
}