/**
 * About page copy. Written for a new business: it describes intent and approach
 * without inventing history, people, manufacturing, or achievements.
 * Fields marked OPTIONAL render only when filled in with verified facts.
 */
export const aboutContent = {
  hero: {
    heading: "A More Considered Listening Experience.",
    body: "We started this company because choosing a speaker should feel as deliberate as the listening that follows.",
  },
  story: {
    heading: "Our story",
    body: [
      "We are a premium audio company, and we're building our range carefully. We specialize in ceiling speakers for seamless home integration, bookshelf speakers for detailed listening, and soundbars for cinematic entertainment.",
      "Each product we add has to earn its place: by how it sounds, how it's made, and how it sits in the spaces where people actually live and work.",
    ],
    /** OPTIONAL: add your verified founding story (who, where, when, why). */
    founderNote: "",
    /** OPTIONAL: e.g. [{ name: "…", role: "…" }] */
    team: [] as { name: string; role: string }[],
  },
  philosophy: {
    heading: "Our philosophy",
    lines: [
      { title: "Precision", body: "Sound that is clear and faithful to the recording." },
      { title: "Presence", body: "Speakers with weight and scale that suit the room." },
      { title: "Emotion", body: "The reason we listen in the first place." },
    ],
  },
  approach: {
    heading: "Our approach to audio",
    body: "We think about a speaker in the context of its room: its size, the surfaces around it, the distance to the listener. That's why we'd rather ask a few questions about your space than recommend the largest speaker we offer.",
  },
  selection: {
    heading: "Design and product selection",
    body: "Materials, proportion, and finish matter because speakers are objects you live with for years. We look for products whose design is as considered as their acoustics, and we describe them honestly, publishing only the specifications we can verify.",
    /** OPTIONAL: verified engineering or manufacturing details. Leave empty until confirmed. */
    manufacturingNote: "",
  },
  commitment: {
    heading: "Our commitment to customers",
    items: [
      "Clear, accurate product information",
      "Straight answers to questions before and after you buy",
      "Help with placement and set-up when you need it",
      "Policies written in plain language",
    ],
  },
  vision: {
    heading: "Our vision",
    body: "To become a trusted name for people who care how things sound, growing our range slowly and keeping the same standards as we do.",
  },
  closing: { heading: "Find Your Sound.", body: "Explore the collection, or tell us about your space and we'll help you choose." },
};
