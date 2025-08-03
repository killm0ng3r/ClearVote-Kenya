import heroImage from '../../assets/clearvote-hero-bg.png'

export default function HeroSection() {
  return (
    <section className="relative bg-gray-50 py-24 md:py-36 text-center overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight animate-fade-in-up">
          Welcome to ClearVote Kenya
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
          Empowering every citizen with a secure, transparent, and accessible voting platform.
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <a
            href="/vote"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            aria-label="Get started with ClearVote"
          >
            Get Started
          </a>
          <a
            href="/about"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 border border-gray-200 shadow-sm"
            aria-label="Learn more about ClearVote"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  )
}