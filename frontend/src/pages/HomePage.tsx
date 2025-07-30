// frontend/src/pages/HomePage.tsx
import HeroSection from '../components/Home/HeroSection'
import FeaturesSection from '../components/Home/FeaturesSection'
import MissionSection from '../components/Home/MissionSection'
import Layout from '../components/Layout'

export default function HomePage() {
  return (
    <Layout>
      <div className="flex flex-col space-y-16 w-full">
        <HeroSection />
        <FeaturesSection />
        <MissionSection />
      </div>
    </Layout>
  )
}
