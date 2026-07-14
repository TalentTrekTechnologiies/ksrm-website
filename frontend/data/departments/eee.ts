import type { Department } from "@/types/department";

export const eee: Department = {
  slug: "eee",
  name: "Electrical & Electronics Engineering",
  shortName: "EEE",
  tagline: "Powering Innovation, Energizing the Future",
  about: "The Department of Electrical & Electronics Engineering at KSRM College of Engineering is committed to delivering excellence in technical education and research. With state-of-the-art facilities, experienced faculty, and industry partnerships, we prepare students for successful careers in the dynamic field of Electrical & Electronics Engineering.",
  aboutVideo: "/videos/block-e.mp4",
  vision: "To be a leading center of excellence in Electrical & Electronics Engineering education and research, producing competent engineers who contribute to technological advancement and societal development.",
  mission: [
    "To provide quality education with industry-relevant curriculum and innovative teaching methods.",
    "To promote research, innovation and collaboration with industries and academic institutions.",
    "To develop engineers with professional ethics, leadership qualities and commitment to sustainable development."
  ],
  peos: [
    { code: "PEO1", text: "To excel in their career as competent professionals in Electrical & Electronics Engineering and related organizations." },
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
    { code: "PSO1", text: "Apply core principles of Electrical & Electronics Engineering to design innovative solutions." },
    { code: "PSO2", text: "Use modern tools and techniques for engineering design and analysis." }
  ],
  aiHighlights: [
    { title: "AI-Driven Innovation", description: "Apply AI and machine learning for advanced problem-solving." },
    { title: "Automation & IoT", description: "Design intelligent systems and connected devices." },
    { title: "Predictive Analytics", description: "Use data-driven approaches for optimization." },
    { title: "Sustainable Solutions", description: "Engineer solutions for environmental challenges." }
  ],
  hod: {
    name: "Dr. M.S. Priyadarshini",
    designation: "Professor & Head of Department",
    qualification: "M.Tech., Ph.D.",
    message: [
      "Welcome to the Department of Electrical & Electronics Engineering. We are committed to fostering innovation, practical skills and research excellence.",
      "Our faculty and facilities are designed to provide students with world-class education and prepare them for impactful careers."
    ],
    photo: "",
    email: "hod.eee@ksrmce.ac.in"
  },
  faculty: [
    { name: "Dr. M.S. Priyadarshini", designation: "Professor & HOD", qualification: "M.Tech., Ph.D.", photo: "", specialization: "Electrical & Electronics Engineering" },
    { name: "M. Bhaskar Reddy", designation: "Associate Professor", qualification: "M.Tech.", photo: "/images/departments/eee/faculty/bhaskar.jpg", specialization: "Power Electronics" },
    { name: "K. Rama Mohan Reddy", designation: "Associate Professor", qualification: "M.Tech.", photo: "/images/departments/eee/faculty/kumar-reddy.jpg", specialization: "Power Systems" },
    { name: "C. Kumar Reddy", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/images/departments/eee/faculty/dr.-c-kumar-reddy.jpg", specialization: "Electrical Machines" },
    { name: "K. Kalyan Kumar", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/images/departments/eee/faculty/k-kalyan-kumar.jpg", specialization: "Control Systems" },
    { name: "T. Kishore Kumar", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/images/departments/eee/faculty/ec.jpg", specialization: "Power Electronics" },
    { name: "N. Siddhik", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Electrical Machines" },
    { name: "S. Khader Vali", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/images/departments/eee/faculty/s-khadarvalli.jpg", specialization: "Power Systems" },
    { name: "A. Jyothirmayi", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Control Systems" },
    { name: "T. Naresh", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/images/departments/eee/faculty/eem.jpg", specialization: "Electrical Machines" },
    { name: "T. Mariprasath", designation: "Assistant Professor (M.Tech)", qualification: "M.Tech.", photo: "/images/departments/eee/faculty/pe.jpg", specialization: "Power Electronics" },
    { name: "C.N. Arpitha", designation: "Assistant Professor (M.Tech)", qualification: "M.Tech.", photo: "", specialization: "Power Systems" },
    { name: "G. Hussain Basha", designation: "Assistant Professor (M.Tech)", qualification: "M.Tech.", photo: "/images/departments/eee/faculty/g-hussain-basha.jpg", specialization: "Control Systems" }
  ],
  programmes: [
    { name: "B.Tech - Electrical & Electronics Engineering", level: "Undergraduate", intake: "60" },
    { name: "M.Tech - Power Electronics and Drives", level: "Postgraduate", intake: "18" }
  ],
  labs: [
    { name: "Circuits & Measurements Laboratory", description: "Fundamental circuits, measurement techniques, and practical electrical measurement experiments", imageUrl: "/images/departments/eee/labs/circuits-lab.jpg" },
    { name: "Electrical Machines Laboratory", description: "DC and AC machines, transformer testing, and motor-generator characteristics", imageUrl: "/images/departments/eee/labs/machines-lab.jpg" },
    { name: "Power Electronics Laboratory", description: "Power electronic converters, inverters, rectifiers, and power device testing", imageUrl: "/images/departments/eee/labs/power-electronics-lab.jpg" },
    { name: "Power Systems Laboratory", description: "Power flow analysis, fault studies, load flow, and power system protection", imageUrl: "/images/departments/eee/labs/power-systems-lab.jpg" },
    { name: "Simulation & CAD Laboratory", description: "MATLAB/Simulink, PSPICE, and CAD tools for circuit and system simulation", imageUrl: "/images/departments/eee/labs/simulation-lab.jpg" }
  ],
  heroImage: "/navbar%20images/Departmentss/EEE.png"
};

export default eee;
