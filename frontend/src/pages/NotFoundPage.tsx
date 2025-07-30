import Layout from '../components/Layout'

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-2">404</h1>
        <p className="text-lg text-gray-700">Page Not Found</p>
      </div>
    </Layout>
  )
}