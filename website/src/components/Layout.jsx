"use client"

import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import Header from './Header';

const Layout = ({ children }) => {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Create animated particles
    const createParticles = () => {
      const particleCount = 15
      const container = document.getElementById("particle-container")

      if (!container) return

      // Clear existing particles
      container.innerHTML = ""

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div")
        particle.classList.add("particle")

        // Random size between 5px and 20px
        const size = Math.random() * 15 + 5
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`

        // Random position
        const posX = Math.random() * window.innerWidth
        const posY = Math.random() * window.innerHeight
        particle.style.left = `${posX}px`
        particle.style.top = `${posY}px`

        // Random opacity
        particle.style.opacity = Math.random() * 0.5

        // Random animation duration between 10s and 30s
        const duration = Math.random() * 20 + 10
        particle.style.animation = `float ${duration}s ease-in-out infinite`

        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 5}s`

        container.appendChild(particle)
      }
    }

    // Handle scroll for header effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }

    createParticles()
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", createParticles)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", createParticles)
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Particle container */}
      <div id="particle-container" className="fixed inset-0 -z-10 pointer-events-none"></div>

      {/* Gradient orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-accent-secondary/30 rounded-full blur-3xl"></div>
      </div>

      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-bg-primary/80 backdrop-blur-lg shadow-lg' : ''}`}>
        <Header />
      </div>

      <main className="container mx-auto px-4 py-8 animate-[fadeIn_0.5s_ease-out] pt-24">{children}</main>

      {/* Additional decorative elements */}
      <div className="fixed bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent"></div>

      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">SignBridge</h3>
              <p className="text-gray-400">
                Building bridges through sign language learning and conversion.
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-400">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2024 SignBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout

