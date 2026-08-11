/**
 * Generates the ATS-friendly resumes from `siteContent`, so the PDF can never drift from
 * what the site shows.
 *
 * ATS parsers read the text layer, not the layout. The rules this file follows:
 *  - one single column, strict top-to-bottom reading order
 *  - core PDF fonts (Helvetica), no embedded or subset fonts that break text extraction
 *  - no tables, text boxes, images, headers or footers
 *  - plain "Label: value" lines and hyphen bullets
 *  - straight quotes only, since curly ones are frequently mangled on extraction
 *  - document metadata filled in (title, author, subject, keywords)
 *
 * Run with: npm run generate:cv
 */
import fs from "node:fs"
import path from "node:path"

import PDFDocument from "pdfkit"

import { siteContent } from "../src/lib/content"
import { contact, fullName, spokenLanguages } from "../src/lib/profile"
import type { Language } from "../src/lib/language"

const OUTPUT_DIR = path.join(process.cwd(), "public", "assets", "cv")
const PROJECT_COUNT = 4

const LABELS = {
  fr: {
    profile: "PROFIL",
    skills: "COMPETENCES TECHNIQUES",
    experience: "EXPERIENCE PROFESSIONNELLE",
    projects: "PROJETS",
    education: "FORMATION ET CERTIFICATIONS",
    languages: "LANGUES",
    subject: "CV de RANDRIANARISON Dieu Donne - Developpeur Full-Stack et Support IT",
  },
  en: {
    profile: "PROFILE",
    skills: "TECHNICAL SKILLS",
    experience: "PROFESSIONAL EXPERIENCE",
    projects: "PROJECTS",
    education: "EDUCATION AND CERTIFICATIONS",
    languages: "LANGUAGES",
    subject: "Resume of RANDRIANARISON Dieu Donne - Full-Stack Developer and IT Support",
  },
} as const

/**
 * Curly punctuation and the middle dot survive rendering but are routinely corrupted by
 * text extraction, which is exactly what an ATS relies on.
 */
function toPlainText(value: string) {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, "-")
    .replace(/·/g, "-")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim()
}

function buildResume(language: Language) {
  const content = siteContent[language]
  const labels = LABELS[language]

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 48, bottom: 48, left: 56, right: 56 },
    info: {
      Title: `${fullName} - ${language === "fr" ? "CV" : "Resume"} (ATS)`,
      Author: fullName,
      Subject: labels.subject,
      Keywords: [
        "developpeur full-stack",
        "support IT",
        "React",
        "Next.js",
        "Node.js",
        "Laravel",
        "PHP",
        "MySQL",
        "PostgreSQL",
        "Madagascar",
      ].join(", "),
      Creator: "portfolio",
    },
  })

  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const write = (text: string, options: PDFKit.Mixins.TextOptions = {}) =>
    doc.text(toPlainText(text), { width, ...options })

  const heading = (text: string) => {
    doc.moveDown(0.9)
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000")
    write(text)
    doc.moveDown(0.35)
  }

  const body = (text: string, options: PDFKit.Mixins.TextOptions = {}) => {
    doc.font("Helvetica").fontSize(10).fillColor("#1a1a1a")
    write(text, { lineGap: 1.5, ...options })
  }

  // --- Header: name, title, then contact details on their own plain lines ---
  doc.font("Helvetica-Bold").fontSize(18).fillColor("#000000")
  write(fullName)
  doc.moveDown(0.2)
  doc.font("Helvetica").fontSize(11).fillColor("#333333")
  write(content.role)
  doc.moveDown(0.4)
  doc.fontSize(9.5).fillColor("#333333")
  write(`${content.location} | ${contact.phoneDisplay} | ${contact.email}`)
  write(`LinkedIn: ${contact.linkedin} | GitHub: ${contact.github}`)

  // --- Profile ---
  // The site copy opens with a greeting ("Bonjour ! Je suis ...") that reads as out of
  // place on a resume, so the summary starts at the first factual clause instead.
  heading(labels.profile)
  const intro = content.aboutText
    .split("\n\n")[0]
    .replace(/^(Bonjour\s*!|Hello!)\s*(Je suis|I'm|I am)\s+Dieu Donn[ée],?\s*/i, "")
  body(intro.charAt(0).toUpperCase() + intro.slice(1))

  // --- Skills, one "Label: values" line per family ---
  heading(labels.skills)
  for (const skill of content.skills) {
    body(`${skill.title}: ${skill.values.join(", ")}`)
  }

  // --- Experience ---
  heading(labels.experience)
  content.experiences.forEach((experience, index) => {
    if (index > 0) doc.moveDown(0.45)
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#000000")
    write(experience.role)
    doc.font("Helvetica").fontSize(9.5).fillColor("#444444")
    write(`${experience.company} | ${experience.duration}`)
    doc.moveDown(0.15)
    for (const bullet of experience.bullets) {
      body(`- ${bullet}`, { indent: 8 })
    }
  })

  // --- Projects ---
  heading(labels.projects)
  content.projects.slice(0, PROJECT_COUNT).forEach((project, index) => {
    if (index > 0) doc.moveDown(0.4)
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#000000")
    write(`${project.title} - ${project.label}`)
    body(project.description)
    if (project.url) body(project.url)
  })

  // --- Education ---
  heading(labels.education)
  content.education.forEach((item, index) => {
    if (index > 0) doc.moveDown(0.35)
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#000000")
    write(item.title)
    body(item.details)
  })

  // --- Languages ---
  heading(labels.languages)
  for (const entry of spokenLanguages) {
    body(entry[language].replace("·", "-"))
  }

  return doc
}

async function writeResume(language: Language) {
  const doc = buildResume(language)
  const target = path.join(OUTPUT_DIR, `cv-ats-${language}.pdf`)
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  await new Promise<void>((resolve, reject) => {
    const stream = fs.createWriteStream(target)
    stream.on("finish", () => resolve())
    stream.on("error", reject)
    doc.pipe(stream)
    doc.end()
  })

  const { size } = fs.statSync(target)
  console.log(`${path.relative(process.cwd(), target)}  ${(size / 1024).toFixed(1)} kB`)
}

async function main() {
  for (const language of ["fr", "en"] as const) {
    await writeResume(language)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
