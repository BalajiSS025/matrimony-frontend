/**
 * Application-wide dropdown constants
 * Reference: Palkar Matrimony field structure
 */

export const COMPLEXION_OPTIONS = ["Lhovvo", "Goro", "Chammal", "Kalo"];

export const RASI_OPTIONS = [
  "Mesham",      // Aries
  "Rishabam",    // Taurus
  "Mithunam",    // Gemini
  "Kadagam",     // Cancer
  "Simmam",      // Leo
  "Kanni",       // Virgo
  "Thulam",      // Libra
  "Viruchigam",  // Scorpio
  "Dhanusu",     // Sagittarius
  "Magaram",     // Capricorn
  "Kumbam",      // Aquarius
  "Meenam",      // Pisces
];

export const NAKSHATRAM_OPTIONS = [
  "Ashwini",
  "Bharani",
  "Karthigai",
  "Rohini",
  "Mirugaseerisham",
  "Thiruvadhirai",
  "Punarpoosam",
  "Poosam",
  "Ayilyam",
  "Magam",
  "Pooram",
  "Uthiram",
  "Hastham",
  "Chithirai",
  "Swathi",
  "Visagam",
  "Anusham",
  "Kettai",
  "Moolam",
  "Pooradam",
  "Uthiradam",
  "Thiruvonam",
  "Avittam",
  "Sadhayam",
  "Poorattadhi",
  "Uthirattadhi",
  "Revathi",
];

export const PAATHAM_OPTIONS = ["1", "2", "3", "4"];

export const RELIGION_OPTIONS = [
  "Hindu",
  "Other",
];

export const MOTHER_TONGUE_OPTIONS = [
  "Sourashtra",
  "Tamil",
  "Other",
];

export const EDUCATION_OPTIONS = [
  "10th / SSLC",
  "12th / HSC",
  "Diploma",
  "ITI",
  "B.A.",
  "B.Sc.",
  "B.Com.",
  "B.E. / B.Tech.",
  "B.Ed.",
  "BCA",
  "BBA",
  "MBBS",
  "B.Pharm.",
  "B.Arch.",
  "LLB",
  "M.A.",
  "M.Sc.",
  "M.Com.",
  "M.E. / M.Tech.",
  "MBA",
  "MCA",
  "MD / MS (Medical)",
  "LLM",
  "Ph.D.",
  "Other",
];

export const PROFESSION_OPTIONS = [
  "Software Engineer / IT",
  "Doctor",
  "Engineer (Non-IT)",
  "Nurse / Healthcare",
  "Teacher / Professor",
  "Lawyer",
  "Chartered Accountant",
  "Government Employee",
  "Bank Employee",
  "Business / Entrepreneur",
  "Defence / Police",
  "Pilot / Aviation",
  "Architect",
  "Journalist / Media",
  "Artist / Creative",
  "Farmer / Agriculture",
  "Driver / Transport",
  "Labour / Worker",
  "Homemaker",
  "Student",
  "Not Working",
  "Other",
];

export const FAMILY_STATUS_OPTIONS = [
  "Lower Class",
  "Middle Class",
  "Upper Middle Class",
  "Rich",
  "Affluent",
];

export const RELATION_OPTIONS = [
  "Self",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Uncle",
  "Aunt",
  "Relative",
  "Friend",
];

export const GENDER_OPTIONS = ["Male", "Female"];

export const MARITAL_STATUS_OPTIONS = [
  "Never Married",
  "Divorced",
  "Widowed",
  "Awaiting Divorce",
];

export const NRI_COUNTRY_OPTIONS = [
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "Singapore",
  "UAE",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "New Zealand",
  "Ireland",
  "Other",
];

export const SALARY_RANGES = [
  { label: "Below ₹20,000", value: "20000" },
  { label: "₹20,000 - ₹40,000", value: "40000" },
  { label: "₹40,000 - ₹60,000", value: "60000" },
  { label: "₹60,000 - ₹1,00,000", value: "100000" },
  { label: "₹1,00,000 - ₹2,00,000", value: "200000" },
  { label: "Above ₹2,00,000", value: "200001" },
];

export const HEIGHT_OPTIONS = (() => {
  const heights = [];
  // 140 cm (4'7") to 210 cm (6'11")
  for (let cm = 140; cm <= 210; cm++) {
    const totalInches = Math.round(cm / 2.54);
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;
    heights.push({ label: `${ft}ft ${inch}in (${cm} cm)`, value: cm });
  }
  return heights;
})();

export const REPORT_REASONS = [
  "Fake profile",
  "Inappropriate content",
  "Harassment",
  "Spam",
  "Misleading information",
  "Offensive behavior",
  "Other",
];

export const VERIFICATION_DOC_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "voter_id", label: "Voter ID Card" },
  { value: "driving_license", label: "Driving License" },
  { value: "pan_card", label: "PAN Card" },
  { value: "employee_id", label: "Employee ID" },
  { value: "college_id", label: "College ID" },
  { value: "other", label: "Other Government ID" },
];

export const CASTE_OPTIONS_BY_RELIGION = {
  Hindu: [
    "Brahmin",
    "Kshatriya",
    "Vaisya",
    "Nadar",
    "Chettiar",
    "Mudaliar",
    "Pillai",
    "Gounder",
    "Thevar / Maravar",
    "Vellalar",
    "Udayar",
    "Yadav",
    "Vanniyar",
    "Dalit / SC",
    "OBC",
    "Other",
    "Caste No Bar",
  ],
  Muslim: [
    "Sunni",
    "Shia",
    "Rowther",
    "Lebbai",
    "Marakkayar",
    "Dekkani",
    "Other",
  ],
  Christian: [
    "Roman Catholic",
    "Protestant",
    "CSI",
    "Pentecostal",
    "Baptist",
    "Other",
  ],
  Other: ["Other", "Caste No Bar"],
};
