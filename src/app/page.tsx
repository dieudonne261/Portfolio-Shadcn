import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { Projects } from "@/components/sections/projects"
import { About } from "@/components/sections/about"
import { Experience } from "@/components/sections/experience"
import { Education } from "@/components/sections/education"
import { Contact } from "@/components/sections/contact"
import { AiChat } from "@/components/ai-chat"
import { HeroIntro } from "@/components/hero-intro"
import { LanguageTransition } from "@/components/language-transition"

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden flex flex-col">
      <Navbar />
      <LanguageTransition>
        <main className="flex-1 pt-16">
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Education />
          <Contact />
        </main>
        <Footer />
      </LanguageTransition>
      <AiChat />
      <HeroIntro />
    </div>
  )
}
