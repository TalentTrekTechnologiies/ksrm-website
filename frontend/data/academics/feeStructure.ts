export interface FeeRow {
  branch: string
  annualFee: string
  admissionFee: string
  note?: string
}

export interface FeeCategory {
  programme: string
  rows: FeeRow[]
}

export interface Scholarship {
  name: string
  description: string
}

export interface FeeStructureData {
  pageTitle: string
  subtitle: string
  intro: string
  notice: string
  categories: FeeCategory[]
  scholarships: {
    title: string
    items: Scholarship[]
  }
  contactInfo: {
    office: string
    phone: string
    email: string
    note: string
  }
}

export const feeStructure: FeeStructureData = {
  pageTitle: "Fee Structure",
  subtitle: "Transparent and Affordable Education",
  intro:
    "K.S.R.M. College of Engineering is committed to providing quality education at competitive and affordable fee rates. Our transparent fee structure ensures that deserving students are not held back by financial constraints. Various scholarships and fee waivers are available to meritorious and economically disadvantaged students.",
  notice:
    "Fees are subject to revision by APSCHE (Andhra Pradesh State Council for Higher Education) and the University. All fees mentioned are annual fees unless stated otherwise. The college reserves the right to modify the fee structure as per directives from the government and regulatory bodies.",
  categories: [
    {
      programme: "B.Tech (First Year)",
      rows: [
        {
          branch: "Computer Science & Engineering",
          annualFee: "₹1,15,000",
          admissionFee: "₹5,000",
          note: "Per annum for 4 years",
        },
        {
          branch: "Electronics & Communication Engineering",
          annualFee: "₹1,15,000",
          admissionFee: "₹5,000",
        },
        {
          branch: "Electrical & Electronics Engineering",
          annualFee: "₹1,10,000",
          admissionFee: "₹5,000",
        },
        {
          branch: "Civil Engineering",
          annualFee: "₹1,10,000",
          admissionFee: "₹5,000",
        },
        {
          branch: "Mechanical Engineering",
          annualFee: "₹1,10,000",
          admissionFee: "₹5,000",
        },
      ],
    },
    {
      programme: "B.Tech (Specializations)",
      rows: [
        {
          branch: "CSE - Data Science",
          annualFee: "₹1,25,000",
          admissionFee: "₹5,000",
          note: "Specialization available from 2nd year",
        },
        {
          branch: "CSE - Artificial Intelligence & Machine Learning",
          annualFee: "₹1,25,000",
          admissionFee: "₹5,000",
        },
      ],
    },
    {
      programme: "M.Tech (2-Year)",
      rows: [
        {
          branch: "Computer Science & Engineering",
          annualFee: "₹80,000",
          admissionFee: "₹5,000",
          note: "Per annum for 2 years",
        },
        {
          branch: "Embedded Systems & VLSI",
          annualFee: "₹80,000",
          admissionFee: "₹5,000",
        },
        {
          branch: "Power Systems",
          annualFee: "₹75,000",
          admissionFee: "₹5,000",
        },
        {
          branch: "Geotechnical Engineering",
          annualFee: "₹75,000",
          admissionFee: "₹5,000",
        },
        {
          branch: "CAD/CAM",
          annualFee: "₹75,000",
          admissionFee: "₹5,000",
        },
      ],
    },
    {
      programme: "MBA (2-Year)",
      rows: [
        {
          branch: "Master of Business Administration",
          annualFee: "₹2,50,000",
          admissionFee: "₹10,000",
          note: "Per annum for 2 years. Includes placement assistance.",
        },
      ],
    },
  ],
  scholarships: {
    title: "Scholarships & Financial Assistance",
    items: [
      {
        name: "Merit-based Scholarships",
        description:
          "Scholarships up to 50% of annual fee for students with exceptional academic performance in entrance exams and board examinations.",
      },
      {
        name: "Management Quota Scholarships",
        description:
          "Reduced fee structure and partial scholarships available for management quota students as per college policies.",
      },
      {
        name: "SC/ST/OBC Scholarships",
        description:
          "As per government directives, eligible students from SC/ST/OBC categories receive fee concessions and scholarships.",
      },
      {
        name: "Sports Scholarships",
        description:
          "Merit-based fee concessions for students selected to college sports teams and tournaments.",
      },
      {
        name: "NRI/Foreign Student Scholarships",
        description:
          "Special fee structure and scholarship opportunities available for foreign students and NRI applicants.",
      },
      {
        name: "Economically Weaker Section (EWS)",
        description:
          "Fee concessions up to 100% for students from economically weaker sections as per government norms.",
      },
      {
        name: "Government Scholarships",
        description:
          "Students are encouraged to apply for state and central government scholarships for which they are eligible.",
      },
      {
        name: "Parent-Teacher Association Assistance",
        description:
          "The college PTA provides additional financial assistance to deserving students on need basis.",
      },
    ],
  },
  contactInfo: {
    office: "Accounts & Fee Management Office",
    phone: "+91-8554-233333",
    email: "fee@ksrmce.ac.in",
    note: "For fee payment options, scholarships inquiries and fee-related queries, contact the Accounts Office during office hours (9:00 AM - 5:00 PM, Monday to Friday).",
  },
}
