export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">ClearVote</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Building a transparent future, one vote at a time.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><a className="text-gray-300 hover:text-white transition-colors duration-200" href="/">Home</a></li>
              <li><a className="text-gray-300 hover:text-white transition-colors duration-200" href="/about">About Us</a></li>
              <li><a className="text-gray-300 hover:text-white transition-colors duration-200" href="/vote">Elections</a></li>
              <li><a className="text-gray-300 hover:text-white transition-colors duration-200" href="/tally">Results</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><a className="text-gray-300 hover:text-white transition-colors duration-200" href="#">How it Works</a></li>
              <li><a className="text-gray-300 hover:text-white transition-colors duration-200" href="#">Security</a></li>
              <li><a className="text-gray-300 hover:text-white transition-colors duration-200" href="#">FAQ</a></li>
              <li><a className="text-gray-300 hover:text-white transition-colors duration-200" href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-6">
              <a className="text-gray-300 hover:text-white transition-colors duration-200 transform hover:scale-110" href="https://x.com" aria-label="Twitter/X">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a className="text-gray-300 hover:text-white transition-colors duration-200 transform hover:scale-110" href="https://facebook.com" aria-label="Facebook">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a className="text-gray-300 hover:text-white transition-colors duration-200 transform hover:scale-110" href="https://instagram.com" aria-label="Instagram">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.227-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.332.014 7.052.072 3.775.227 1.778 2.168 1.623 5.445.014 8.724 0 9.133 0 12c0 2.867.014 3.276.072 4.556.155 3.277 2.096 5.274 5.373 5.429 1.28.058 1.689.072 4.928.072s3.647-.014 4.928-.072c3.277-.155 5.274-2.096 5.429-5.373.058-1.28.072-1.689.072-4.556 0-2.867-.014-3.276-.072-4.556-.155-3.277-2.096-5.274-5.373-5.429C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a className="text-gray-300 hover:text-white transition-colors duration-200 transform hover:scale-110" href="https://linkedin.com" aria-label="LinkedIn">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a className="text-gray-300 hover:text-white transition-colors duration-200 transform hover:scale-110" href="https://youtube.com" aria-label="YouTube">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.016 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-300 text-sm">
          <p>© 2025 ClearVote Kenya. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
