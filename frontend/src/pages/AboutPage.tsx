import Layout from '../components/Layout'

export default function AboutPage() {
  return (
    <Layout>
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight animate-fade-in-up">
            About ClearVote
          </h1>
          <div className="space-y-6 text-gray-700 text-lg md:text-xl leading-relaxed max-w-prose animate-fade-in-up animation-delay-200">
            <p>
              ClearVote is a secure, transparent, and user-friendly voting platform designed to revolutionize modern digital elections. Our mission is to empower voters and administrators by simplifying the election process while ensuring unparalleled security and accessibility.
            </p>
            <p>
              Built on cutting-edge blockchain technology, ClearVote guarantees that every vote is encrypted, anonymous, and tamper-proof. Our publicly auditable ledger provides complete transparency without compromising voter privacy, fostering trust in the democratic process.
            </p>
            <p>
              We are committed to inclusivity, offering a platform that allows every citizen to vote seamlessly from anywhere, with an interface designed for simplicity and ease of use. ClearVote Kenya is paving the way for a fairer, more accessible future for elections.
            </p>
            <a
              href="/mission"
              className="inline-flex items-center text-blue-600 font-semibold text-lg hover:text-blue-700 transition-colors duration-200 group"
              aria-label="Learn more about ClearVote's mission"
            >
              Explore Our Mission
              <svg>
                className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              </svg>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}