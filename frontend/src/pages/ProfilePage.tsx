import Layout from '../components/Layout'

export default function ProfilePage() {
  return (
    <Layout>
      <div className="max-w-3xl w-full mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full border p-2 rounded" />
            <input type="email" placeholder="Email" className="w-full border p-2 rounded" />
            <input type="tel" placeholder="Phone Number" className="w-full border p-2 rounded" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Update Information</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <form className="space-y-4">
            <input type="password" placeholder="Current Password" className="w-full border p-2 rounded" />
            <input type="password" placeholder="New Password" className="w-full border p-2 rounded" />
            <input type="password" placeholder="Confirm New Password" className="w-full border p-2 rounded" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Change Password</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Voting History</h2>
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Election Name</th>
                <th className="p-2">Date</th>
                <th className="p-2">Vote Details</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">City Council Election</td>
                <td className="p-2">2023-05-15</td>
                <td className="p-2 text-blue-600 hover:underline cursor-pointer">View</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">School Board Election</td>
                <td className="p-2">2022-11-08</td>
                <td className="p-2 text-blue-600 hover:underline cursor-pointer">View</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">State Referendum</td>
                <td className="p-2">2022-03-22</td>
                <td className="p-2 text-blue-600 hover:underline cursor-pointer">View</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}