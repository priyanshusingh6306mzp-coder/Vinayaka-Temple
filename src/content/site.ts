/**
 * Single Source of Truth for Shri Vinayaka Temple Facts & Metadata
 *
 * All public information, contact details, timings, and content
 * are maintained here. Public pages strictly render confirmed facts provided by the client.
 */

export interface TempleTiming {
  session: string;
  sessionHindi: string;
  opens: string;
  closes: string;
  openDisplay: string;
  closeDisplay: string;
  time: string;
  description: string;
}

export const DARSHAN_SESSIONS = {
  morning: {
    session: "Morning Darshan",
    sessionHindi: "प्रातःकालीन दर्शन",
    opens: "06:00",
    closes: "10:30",
    openDisplay: "6:00 AM",
    closeDisplay: "10:30 AM",
    time: "6:00 AM – 10:30 AM",
    description: "Daily morning darshan and prayer",
  },
  evening: {
    session: "Evening Darshan",
    sessionHindi: "सायंकालीन दर्शन",
    opens: "17:30",
    closes: "20:30",
    openDisplay: "5:30 PM",
    closeDisplay: "8:30 PM",
    time: "5:30 PM – 8:30 PM",
    description: "Daily evening darshan and prayer",
  },
} as const;

export interface PoojaTypeOption {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  durationApprox: string;
  suggestedOffering?: string;
}

// Customary pooja offerings awaiting priest confirmation
const poojaOfferingsPendingPriestConfirmation: PoojaTypeOption[] = [
  {
    id: "ganapathi_homam",
    name: "Ganapathi Homam / Sankalpa",
    nameHindi: "गणपति होम / संकल्प",
    description: "Devotional prayer offering for auspicious beginnings and well-being.",
    durationApprox: "30-45 mins",
  },
  {
    id: "archana",
    name: "Ganesha Archana / Ashtothram",
    nameHindi: "गणेश अर्चना / अष्टोत्तरम्",
    description: "Chanting of sacred names with floral and traditional offerings.",
    durationApprox: "15-20 mins",
  },
  {
    id: "abhishekam",
    name: "Nitya Abhishekam",
    nameHindi: "नित्य अभिषेक",
    description: "Ceremonial ablution of the deity.",
    durationApprox: "30 mins",
  },
  {
    id: "other_general_enquiry",
    name: "Other / general enquiry",
    nameHindi: "अन्य / सामान्य पूछताछ",
    description: "The temple will contact you to confirm the pooja and date.",
    durationApprox: "To be confirmed",
  },
];

export const HERO_IMAGE_ALT =
  "Black stone idol of Lord Ganesha at Shri Vinayaka Temple";

export const SITE_CONFIG = {
  name: "Shri Vinayaka Temple",
  nameHindi: "श्री विनायक मंदिर",
  tagline: "A Sacred Haven of Peace, Devotion, and Soul",
  taglineHindi: "शांति, भक्ति और ध्यान का पावन धाम",
  heroImageAlt: HERO_IMAGE_ALT,
  description:
    "Shri Vinayaka Temple is situated inside the campus of JSS University, C-20/1, C Block, Phase 2, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309. Built with South Indian Chola architecture, it features a black stone Ganesha idol and offers a calm, clean, and uncrowded atmosphere for prayer and meditation.",

  location: {
    campus: "JSS University",
    plot: "C-20/1",
    block: "C Block, Phase 2, Industrial Area",
    sector: "Sector 62",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201309",
    streetAddress:
      "Inside the campus of JSS University, C-20/1, C Block, Phase 2, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309",
    fullAddress:
      "Inside the campus of JSS University, C-20/1, C Block, Phase 2, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309",
    campusEntryInstructions:
      "Please send a request through the form and the temple will contact you with campus entry instructions.",
  },

  contact: {
    // The temple has chosen NOT to publish a phone number. All visitor contact happens through the pooja request form. To show a number later, set it here (10 digits): call buttons, WhatsApp buttons and the JSON-LD telephone then appear automatically.
    phone: null as string | null,
    email: "priest@vinayaka.example.com",
  },

  darshanSessions: DARSHAN_SESSIONS,

  timings: [
    DARSHAN_SESSIONS.morning,
    DARSHAN_SESSIONS.evening,
  ] as TempleTiming[],

  transit: {
    nearestMetro: "Noida Sector 62 Metro Station",
  },

  amenities: [
    {
      title: "Free On-Site Parking",
      titleHindi: "निःशुल्क वाहन पार्किंग",
      description: "Designated, safe parking spaces  for two-wheelers and cars.",
    },
    {
      title: "Clean Restrooms",
      titleHindi: "स्वच्छ प्रसाधन",
      description: "Hygienic foot-washing facility  for devotees.",
    },
    {
      title: "Calm and Uncrowded Atmosphere",
      titleHindi: "शांत एवं पावन वातावरण",
      description: "A calm, clean, and uncrowded atmosphere for quiet prayer and meditation.",
    },
  ],

  architecture: {
    style: "South Indian Chola architecture",
    idol: "Black stone Ganesha idol",
    atmosphere: "Calm, clean, and uncrowded atmosphere",
  },

  /**
   * Config block marked for priest confirmation:
   * Standard customary pooja options pending final priest review.
   */
  poojaOfferingsPendingPriestConfirmation,
  poojaTypes: poojaOfferingsPendingPriestConfirmation,

  maps: {
    link: "https://maps.app.goo.gl/8bQKpnSUecnjsTRQ6",
  },

  /**
   * UNCONFIRMED / PLACEHOLDER BLOCK:
   * Contains unverified details or administrative notes awaiting client / priest confirmation.
   * This block is STRICTLY ISOLATED and NEVER rendered on public pages.
   */
  unconfirmed: {
    poojaListPendingConfirmation: true,
    campusGateNotes:
      "Devotees enter through Main Gate 1. Inform campus security at the entrance that you are visiting the Shri Vinayaka Temple for Darshan. Visitor ID may be requested.",
    busRoute: "Fortis Hospital / Sector 62 intersection stop",
    distanceFromMetro: "Approx. 1.2 km (5 minutes by e-rickshaw or auto)",
    metroLine: "Blue Line",
    priestEmailVerified: false,
  },
} as const;
