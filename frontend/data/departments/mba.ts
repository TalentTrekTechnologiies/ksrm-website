import type { Department } from "@/types/department";

export const mba: Department = {
  slug: "mba",
  name: "Management Studies",
  shortName: "MBA",
  tagline: "Developing Leaders, Creating Opportunities",
  about: "The Department of Management Studies at KSRM College of Engineering is committed to delivering excellence in technical education and research. With state-of-the-art facilities, experienced faculty, and industry partnerships, we prepare students for successful careers in the dynamic field of Management Studies.",
  vision: "To be a leading center of excellence in Management Studies education and research, producing competent engineers who contribute to technological advancement and societal development.",
  mission: [
    "To provide quality education with industry-relevant curriculum and innovative teaching methods.",
    "To promote research, innovation and collaboration with industries and academic institutions.",
    "To develop engineers with professional ethics, leadership qualities and commitment to sustainable development."
  ],
  peos: [
    { code: "PEO1", text: "To excel in their career as competent professionals in Management Studies and related organizations." },
    { code: "PEO2", text: "To pursue higher education and conduct research for solving complex engineering challenges." },
    { code: "PEO3", text: "To contribute to societal development through ethical practice and professional responsibility." }
  ],
  pos: [
    { code: "PO1", title: "Engineering Knowledge", text: "Apply knowledge of mathematics, science and engineering fundamentals to solve complex engineering problems." },
    { code: "PO2", title: "Problem Analysis", text: "Identify, formulate and analyze complex engineering problems to reach substantiated conclusions." },
    { code: "PO3", title: "Design/Development", text: "Design solutions for complex problems considering public health, safety and environmental factors." },
    { code: "PO4", title: "Investigations", text: "Conduct investigations using research-based knowledge and analysis of experimental data." },
    { code: "PO5", title: "Tool Usage", text: "Create and apply appropriate engineering and IT tools with understanding of their limitations." },
    { code: "PO6", title: "The Engineer and Society", text: "Assess societal, health, safety and legal issues relevant to professional engineering practice." },
    { code: "PO7", title: "Sustainability", text: "Understand the impact of engineering solutions in environmental contexts and sustainable development." },
    { code: "PO8", title: "Ethics", text: "Apply ethical principles and commit to professional ethics and responsibilities." },
    { code: "PO9", title: "Team Work", text: "Function effectively as an individual and member or leader in diverse teams." },
    { code: "PO10", title: "Communication", text: "Communicate effectively on complex engineering activities with community and society." },
    { code: "PO11", title: "Project Management", text: "Demonstrate knowledge of engineering and management principles in team environments." }
  ],
  psos: [
    { code: "PSO1", text: "Apply core principles of Management Studies to design innovative solutions." },
    { code: "PSO2", text: "Use modern tools and techniques for engineering design and analysis." }
  ],
  aiHighlights: [
    { title: "AI-Driven Innovation", description: "Apply AI and machine learning for advanced problem-solving." },
    { title: "Automation & IoT", description: "Design intelligent systems and connected devices." },
    { title: "Predictive Analytics", description: "Use data-driven approaches for optimization." },
    { title: "Sustainable Solutions", description: "Engineer solutions for environmental challenges." }
  ],
  hod: {
    name: "Dr. MBA Department Head",
    designation: "Head of Department, MBA",
    qualification: "M.Tech., Ph.D.",
    message: [
      "Welcome to the Department of Management Studies. We are committed to fostering innovation, practical skills and research excellence.",
      "Our faculty and facilities are designed to provide students with world-class education and prepare them for impactful careers."
    ],
    photo: "",
    email: "hod.mba@ksrmce.ac.in"
  },
  faculty: [
    { name: "Dr. MBA Department Head", designation: "Professor & Head", qualification: "M.Tech., Ph.D.", photo: "", specialization: "Management Studies" },
    { name: "Dr. Finance & Accounting", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", photo: "", specialization: "Finance" },
    { name: "Dr. Operations Management", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", photo: "", specialization: "Operations" },
    { name: "Dr. Human Resources", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "HR Management" },
  ],
  programmes: [
    { name: "B.Tech - Management Studies", level: "Undergraduate", intake: "60" }
  ],
  labs: [],
  heroImage: "/banner.png"
};

export default mba;
