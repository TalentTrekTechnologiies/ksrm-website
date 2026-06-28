// REAL RDC (Research & Development Cell) data from KSRMCE documents

export interface RDCAdvisoryMember {
  name: string
  designation: string
  department?: string
}

export interface RDCPolicy {
  name: string
  fileName: string
  description: string
  icon: string
}

export interface ResearchData {
  title: string
  tagline: string
  banner: string
  intro: string
  vision: string
  missions: string[]

  // About Section
  aboutRDC: string

  // Advisory Committee (REAL - 9 members)
  advisoryCommittee: RDCAdvisoryMember[]

  // Policies & Guidelines (with document references)
  policies: RDCPolicy[]

  // RDC Dean Contact
  dean: {
    name: string
    designation: string
    department: string
    email: string
    phone: string
  }
}

export const research: ResearchData = {
  title: "Research & Development Cell (RDC)",
  tagline: "Advancing Knowledge Through Research & Innovation",
  banner: "/banners/research.jpg",

  intro:
    "The Research and Development Cell (RDC) of KSRMCE is committed to building a robust research ecosystem that fosters innovation, industry-academia collaboration, and ethical research practices among faculty and students.",

  vision:
    "To establish a robust mechanism for developing and strengthening the research ecosystem of the institution.",

  missions: [
    "Create a conducive environment for quality research and innovation",
    "Promote industry-academia collaboration and knowledge transfer",
    "Facilitate resource mobilization for research and development",
    "Ensure ethical research practices and compliance with integrity standards",
    "Support research scholars and supervisors in achieving excellence",
  ],

  aboutRDC:
    "The Research and Development Cell (RDC) of KSRMCE facilitates and encourages the research culture among faculty and students. The establishment of the R&D Cell is to develop and strengthen the research environment in the departments and to align it with the educational policies of India. The RDC provides a favorable environment for productive research, industrial and institutional collaborations, and mobilizes resources and grants. The college follows the research mandate by various National Missions, SDGs, and the Start-up India initiative leading to a Self-Reliant India (Atma-Nirbhar Bharat).\n\nRDC encourages faculty to conceive ideas through enhanced industry-academia interactions and prepare research proposals for funding from various agencies. It organizes events like capacity-building programs and research theme-based workshops and internships that motivate students, scholars, and faculty to participate actively in ideation and innovative research in emerging areas.\n\nRDC ensures that researchers understand the importance of integrity and ethics, comply with ethical codes of research, and follow publishing practices at institutional, national, and global levels. All papers undergo standard plagiarism checks, and necessary software is made available for all researchers.",

  // REAL Advisory Committee (9 members)
  advisoryCommittee: [
    {
      name: "Sri K. Madan Mohan Reddy",
      designation: "Vice Chairman",
      department: "Administration",
    },
    {
      name: "Dr. K. Chandra Obul Reddy",
      designation: "Managing Director",
      department: "Administration",
    },
    {
      name: "Dr. T. Nageswara Prasad",
      designation: "Principal",
      department: "Academic Administration",
    },
    {
      name: "Dr. M. Venkatanarayana",
      designation: "Professor, ECE & Dean, R&D Cell",
      department: "Electronics & Communication Engineering",
    },
    {
      name: "Sri A. Ramprakash Reddy",
      designation: "Head of Department",
      department: "Computer Science & Engineering",
    },
    {
      name: "Dr. B. Bhaskar Reddy",
      designation: "Head of Department",
      department: "Electronics & Communication Engineering",
    },
    {
      name: "Dr. G. Chennakesava Reddy",
      designation: "Head of Department",
      department: "Civil Engineering",
    },
    {
      name: "Dr. M. S. Priyadarshini",
      designation: "Head of Department",
      department: "Electrical & Electronics Engineering",
    },
    {
      name: "Dr. D. Ravikanth",
      designation: "Head of Department",
      department: "Mechanical Engineering",
    },
  ],

  // Policies & Guidelines (with document references)
  policies: [
    {
      name: "RDC Policy",
      fileName: "RDC-Policy.pdf",
      description: "Overall research and development cell policies and procedures",
      icon: "📋",
    },
    {
      name: "Research Promotion Policy",
      fileName: "Research-Promotion-Policy.pdf",
      description: "Policy for promoting research activities among faculty and students",
      icon: "🔬",
    },
    {
      name: "Seed Fund Policy",
      fileName: "Seed-Funding-Scheme-Policy.pdf",
      description: "Guidelines for seed funding schemes to support research initiation",
      icon: "💰",
    },
    {
      name: "Code of Ethics for Research",
      fileName: "Code-of-Ethics-Research-Innovation.pdf",
      description: "Ethical guidelines for research conduct, plagiarism prevention, and integrity",
      icon: "⚖️",
    },
    {
      name: "Startup & Innovation Policy",
      fileName: "Startup-Policy-KSRM-BICF.doc",
      description: "Policy framework for startup development and innovation initiatives",
      icon: "🚀",
    },
    {
      name: "Intellectual Property Rights (IPR) Policy",
      fileName: "IPR-Policy.pdf",
      description: "Guidelines for intellectual property protection and management",
      icon: "🔐",
    },
    {
      name: "Consultancy Policy",
      fileName: "Consultancy-Policy.pdf",
      description: "Framework for faculty and institutional consultancy projects",
      icon: "🤝",
    },
  ],

  // RDC Dean Contact
  dean: {
    name: "Dr. M. Venkatanarayana",
    designation: "Dean, Research & Development Cell",
    department: "Professor, Electronics & Communication Engineering",
    email: "rdc@ksrmce.ac.in",
    phone: "+91-8554-233333 (Ext: 380)",
  },
}
