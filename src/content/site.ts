/**
 * Single Source of Truth for Shri Vinayaka Temple Facts & Metadata
 *
 * All public information, contact details, timings, and content placeholders
 * are maintained here.
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

export const SITE_CONFIG = {
  name: "Shri Vinayaka Temple",
  nameHindi: "श्री विनायक मंदिर",
  tagline: "A Sacred Haven of Peace, Devotion, and Solitude",
  taglineHindi: "शांति, भक्ति और ध्यान का पावन धाम",
  description:
    "Shri Vinayaka Temple is a serene sanctuary situated inside the JSS Academy of Technical Education campus in Sector 62, Noida. Built with traditional South Indian Chola architectural dignity, it features a majestic black stone Ganesha idol, providing a clean, uncrowded space for quiet prayer and meditation.",
  
  location: {
    campus: "JSS Academy of Technical Education",
    block: "C Block, Phase 2, Industrial Area",
    sector: "Sector 62",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201309",
    fullAddress:
      "Inside the campus of JSS Academy of Technical Education, C Block, Phase 2, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309",
    landmark: "Behind C-Block academic complex, lush green corner",
    // Open question / placeholder for client:
    campusEntryInstructions:
      "[PLACEHOLDER] Devotees are welcome to enter through Main Gate 1. Inform campus security at the entrance that you are visiting the Shri Vinayaka Temple for Darshan. Visitor ID may be requested.",
  },

  contact: {
    displayPhone: "079820 48559",
    telHref: "tel:+917982048559",
    whatsappNumber: "917982048559",
    whatsappLink: "https://wa.me/917982048559?text=Namaste%2C%20I%20would%20like%20to%20inquire%20about%20Pooja%20services.",
    email: "priest@vinayaka.example.com", // [PLACEHOLDER] Client to provide verified priest email
  },

  timings: [
    {
      session: "Morning Darshan",
      sessionHindi: "प्रातःकालीन दर्शन",
      time: "6:00 AM – 11:30 AM",
      description: "Suprabhatam, Nitya Abhishekam, and Morning Maha Aarti at 7:30 AM",
    },
    {
      session: "Evening Darshan",
      sessionHindi: "सायंकालीन दर्शन",
      time: "4:30 PM – 8:30 PM",
      description: "Evening Archana, Dhoop Aarti at 6:30 PM, and Shayan Aarti at 8:15 PM",
    },
  ] as TempleTiming[],

  transit: {
    nearestMetro: "Noida Sector 62 Metro Station (Blue Line)",
    distanceFromMetro: "Approx. 1.2 km (5 minutes by e-rickshaw or auto)",
    busRoute: "Fortis Hospital / Sector 62 intersection stop",
  },

  amenities: [
    {
      title: "Free On-Site Parking",
      titleHindi: "निःशुल्क वाहन पार्किंग",
      description: "Designated, secure parking space available inside the campus for two-wheelers and four-wheelers.",
    },
    {
      title: "Clean Restrooms",
      titleHindi: "स्वच्छ प्रसाधन",
      description: "Well-maintained, hygienic washrooms and foot-washing taps accessible before entering the sanctum.",
    },
    {
      title: "Quiet Meditation Area",
      titleHindi: "शांत ध्यान स्थल",
      description: "Uncrowded, shaded courtyard designed for undisturbed introspection and peaceful prayer.",
    },
    {
      title: "Drinking Water",
      titleHindi: "शुद्ध पेयजल",
      description: "Purified cold water facility available for devotees.",
    },
  ],

  architecture: {
    style: "South Indian Dravidian & Chola architectural heritage",
    idol: "Carved Black Granite Stone (Kala Shilpa) Shri Maha Ganapati in blessing posture",
    atmosphere: "Clean, pristine, stone-scented, peaceful and uncrowded",
  },

  poojaTypes: [
    {
      id: "sankashti_ganapathi_homam",
      name: "Sankashti Ganapathi Homam / Pooja",
      nameHindi: "संकष्टी गणपति होम / पूजा",
      description: "Special prayer offered for removing obstacles, career growth, and academic success.",
      durationApprox: "45 mins",
      suggestedOffering: "Modak, Durva grass, and red hibiscus garland",
    },
    {
      id: "nitya_archana",
      name: "Nitya Sahasranama Archana",
      nameHindi: "नित्य सहस्रनाम अर्चना",
      description: "Chanting of sacred 1008 or 108 names of Lord Ganesha with kumkum and akshata.",
      durationApprox: "20 mins",
    },
    {
      id: "panchamrutha_abhishekam",
      name: "Panchamrutha Abhishekam",
      nameHindi: "पंचामृत अभिषेक",
      description: "Sacred bath of the deity with milk, curd, honey, ghee, and jaggery/fruit.",
      durationApprox: "35 mins",
    },
    {
      id: "vehicle_pooja",
      name: "Vahana Pooja (Vehicle Blessing)",
      nameHindi: "वाहन पूजा",
      description: "Consecration and safety blessing for new two-wheelers and four-wheelers on campus.",
      durationApprox: "15 mins",
    },
    {
      id: "special_darshan_family",
      name: "Special Family Darshan & Sankalpa",
      nameHindi: "विशेष पारिवारिक दर्शन व संकल्प",
      description: "Family sankalpa for health, longevity, and child education.",
      durationApprox: "30 mins",
    },
  ] as PoojaTypeOption[],

  // Map Embed URLs (env fallback if not set)
  maps: {
    defaultEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.584347209707!2d77.36979517596048!3d28.61224858501878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce55b38e072b9%3A0xb35a396a40c9497e!2sJSS%20Academy%20of%20Technical%20Education!5e0!3m2!1sen!2sin!4v1700000000000",
    defaultMapsLink: "https://maps.google.com/?q=JSS+Academy+of+Technical+Education+Noida+Sector+62",
  },
} as const;
