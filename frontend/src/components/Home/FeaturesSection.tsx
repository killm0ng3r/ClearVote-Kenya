import type { ReactElement } from 'react'
import { CheckCircleIcon, EyeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid'

export default function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-16 tracking-tight animate-fade-in-up">
          Why Choose ClearVote?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <FeatureCard
            icon={<CheckCircleIcon className="h-10 w-10 text-blue-600" />}
            title="Unmatched Security"
            description="Our blockchain technology ensures every vote is encrypted, anonymous, and tamper-proof, safeguarding the integrity of the electoral process."
          />
          <FeatureCard
            icon={<EyeIcon className="h-10 w-10 text-green-600" />}
            title="Complete Transparency"
            description="A publicly auditable ledger provides full visibility into elections while preserving voter privacy and trust."
          />
          <FeatureCard
            icon={<DevicePhoneMobileIcon className="h-10 w-10 text-purple-600" />}
            title="Accessible to All"
            description="Vote seamlessly from anywhere with a user-friendly platform designed for simplicity and inclusivity."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: ReactElement; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
      <div className="flex justify-center mb-6 text-blue-600">{icon}</div>
      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-xs">{description}</p>
    </div>
  )
}