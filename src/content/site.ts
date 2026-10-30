/**
 * Single Source of Truth for Shri Vinayaka Temple Facts & Metadata
 *
 * All public information, contact details, timings, and content
 * are maintained here. Public pages strictly render confirmed facts provided by the client.
 */

export interface TempleTiming {
  session: string;
  sessionHindi: string;
  time: string;
  description: string;
}

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
    id: "other_or_call",
    name: "Other / not sure, I will call",
    nameHindi: "अन्य / परामर्श हेतु संपर्क करेंगे",
    description: "The temple will contact you to confirm the pooja and date.",
    durationApprox: "To be confirmed",
  },
];

export const SITE_CONFIG = {
  name: "Shri Vinayaka Temple",
  nameHindi: "श्री विनायक मंदिर",
  tagline: "A Sacred Haven of Peace, Devotion, and Soul",
  taglineHindi: "शांति, भक्ति और ध्यान का पावन धाम",
  description:
    "Shri Vinayaka Temple is situated inside the campus of JSS Academy of Technical Education, C-20/1, C Block, Phase 2, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309. Built with South Indian Chola architecture, it features a black stone Ganesha idol and offers a calm, clean, and uncrowded atmosphere for prayer and meditation.",

  location: {
    campus: "JSS Academy of Technical Education",
    plot: "C-20/1",
    block: "C Block, Phase 2, Industrial Area",
    sector: "Sector 62",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201309",
    streetAddress:
      "Inside the campus of JSS Academy of Technical Education, C-20/1, C Block, Phase 2, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309",
    fullAddress:
      "Inside the campus of JSS Academy of Technical Education, C-20/1, C Block, Phase 2, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309",
    campusEntryInstructions: "Please call the temple for campus entry instructions",
  },

  contact: {
    displayPhone: "079820 48559",
    telHref: "tel:+917982048559",
    whatsappNumber: "917982048559",
    whatsappLink:
      "https://wa.me/917982048559?text=Namaste%2C%20I%20would%20like%20to%20enquire%20about%20a%20pooja.",
    email: "priest@vinayaka.example.com",
  },

  timings: [
    {
      session: "Morning Darshan",
      sessionHindi: "प्रातःकालीन दर्शन",
      time: "6:00 AM – 11:30 AM",
      description: "Daily morning darshan and prayer",
    },
    {
      session: "Evening Darshan",
      sessionHindi: "सायंकालीन दर्शन",
      time: "4:30 PM – 8:30 PM",
      description: "Daily evening darshan and prayer",
    },
  ] as TempleTiming[],

  transit: {
    nearestMetro: "Noida Sector 62 Metro Station",
  },

  amenities: [
    {
      title: "Free On-Site Parking",
      titleHindi: "निःशुल्क वाहन पार्किंग",
      description: "Designated, safe parking spaces inside JSS campus for two-wheelers and cars.",
    },
    {
      title: "Clean Restrooms",
      titleHindi: "स्वच्छ प्रसाधन",
      description: "Hygienic foot-washing facility and clean restrooms for devotees.",
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
    defaultEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.584347209707!2d77.36979517596048!3d28.61224858501878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce55b38e072b9%3A0xb35a396a40c9497e!2sJSS%20Academy%20of%20Technical%20Education!5e0!3m2!1sen!2sin!4v1700000000000",
    defaultMapsLink: "https://maps.google.com/?q=JSS+Academy+of+Technical+Education+Noida+Sector+62",
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
