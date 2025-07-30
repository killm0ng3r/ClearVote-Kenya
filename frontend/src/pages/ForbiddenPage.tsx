// frontend/src/pages/ForbiddenPage.tsx
import Layout from '../components/Layout'

export default function ForbiddenPage() {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-yellow-600 mb-2">403</h1>
        <p className="text-lg text-gray-700">You do not have permission to access this page.</p>
      </div>
    </Layout>
  )
}