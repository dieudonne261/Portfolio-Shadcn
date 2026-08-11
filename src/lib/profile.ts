import { siteContent } from "@/lib/content"
import type { Language } from "@/lib/language"

export type { Language }

/** Single source for the public contact details used across the UI and the assistant. */
export const contact = {
  email: "ddieu0970@gmail.com",
  phoneDisplay: "+261 34 12 722 76",
  phoneHref: "tel:+261341272276",
  linkedin: "https://linkedin.com/in/dede-randria",
  github: "https://github.com/dieudonne261",
} as const

export const fullName = "RANDRIANARISON Dieu Donné"

/** Spoken languages, shared by the About badges and the generated resume. */
export const spokenLanguages = [
  { fr: "Français · Avancé", en: "French · Advanced" },
  { fr: "Anglais · Intermédiaire", en: "English · Intermediate" },
] as const

/**
 * The assistant's knowledge is derived from `siteContent` rather than restated, so a
 * change to a project or a job cannot leave the chatbot quoting stale facts.
 */
export function buildProfileContext(language: Language) {
  const content = siteContent[language]

  const projects = content.projects
    .map((project) => `${project.title} (${project.label}): ${project.description}${project.url ? ` Lien: ${project.url}` : ""}`)
    .join(" ")

  const experiences = content.experiences
    .map((experience) => `${experience.role} - ${experience.company} (${experience.duration}): ${experience.bullets.join("; ")}`)
    .join(" ")

  const skills = content.skills
    .map((skill) => `${skill.title}: ${skill.values.join(", ")}`)
    .join(" | ")

  const education = content.education
    .map((item) => `${item.title} - ${item.details}`)
    .join(" ")

  return [
    `You are the portfolio assistant for ${fullName}, ${content.role}, based in ${content.location}.`,
    "Use only the facts below. Never invent employers, achievements, technologies, links, availability or personal data.",
    `About: ${content.aboutText.replace(/\n+/g, " ")}`,
    `Projects: ${projects}`,
    `Experience: ${experiences}`,
    `Skills: ${skills}`,
    `Education: ${education}`,
    `Contact (public, safe to share): ${contact.email}, ${contact.phoneDisplay}, LinkedIn ${contact.linkedin}, GitHub ${contact.github}.`,
    "Keep answers professional, concise and helpful. If a fact is absent, say you do not have that information.",
  ].join("\n")
}

/**
 * Offline answers when the AI service is unavailable. They are assembled from the same
 * content, so no fact is written twice — and `null` means "no confident match", which
 * the UI surfaces honestly instead of guessing.
 */
export function localAnswer(message: string, language: Language): string | null {
  const query = message.toLowerCase()
  const content = siteContent[language]
  const french = language === "fr"

  if (/(project|projet|edusmart|careerflow|baiboly|réalisation|realisation)/.test(query)) {
    const list = content.projects.slice(0, 3).map((project) => project.title).join(", ")
    return french ? `Ses projets principaux sont : ${list}.` : `His main projects are: ${list}.`
  }

  if (/(skill|compétenc|competenc|stack|technolog|technique|langage)/.test(query)) {
    const list = content.skills.map((skill) => `${skill.title} (${skill.values.join(", ")})`).join(" ; ")
    return french ? `Ses compétences : ${list}.` : `His skills: ${list}.`
  }

  if (/(experience|expérien|parcours|poste|emploi|strelitzia|nexus|netpro|changes)/.test(query)) {
    const list = content.experiences.map((experience) => `${experience.role} chez ${experience.company} (${experience.duration})`).join(" ; ")
    return french ? `Son parcours : ${list}.` : `His background: ${list}.`
  }

  if (/(formation|diplôme|diplome|étude|etude|education|master|licence|certification)/.test(query)) {
    const list = content.education.map((item) => item.title).join(", ")
    return french ? `Sa formation : ${list}.` : `His education: ${list}.`
  }

  if (/(contact|email|e-mail|mail|phone|téléphone|telephone|linkedin|github|joindre|reach)/.test(query)) {
    return french
      ? `Vous pouvez le joindre à ${contact.email} ou au ${contact.phoneDisplay}. LinkedIn et GitHub sont dans la section Contact.`
      : `You can reach him at ${contact.email} or ${contact.phoneDisplay}. LinkedIn and GitHub are in the Contact section.`
  }

  return null
}
