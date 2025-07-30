export default function MissionSection() {
  return (
    <section className="bg-gray-50 py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center gap-12 lg:gap-16">
        <div className="md:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Team collaborating around a table"
            className="rounded-xl shadow-2xl w-full object-cover h-80 md:h-96 transform hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-200/50 pointer-events-none"></div>
        </div>
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight animate-fade-in-up">
            Empowering Voters Through Technology
          </h2>
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed max-w-prose">
            ClearVote is more than a platform; it’s a commitment to a fair, secure, and democratic process. We leverage cutting-edge technology to build trust and ensure accessibility for every citizen.
          </p>
          <a
            href="/about"
            className="inline-flex items-center text-blue-600 font-semibold text-lg hover:text-blue-700 transition-colors duration-200 group"
            aria-label="Discover ClearVote's mission"
          >
            Discover Our Mission
            <svg
              className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}