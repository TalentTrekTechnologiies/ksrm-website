import type { Department } from "@/types/department";

export const ece: Department = {
  slug: "ece",
  name: "Electronics & Communication Engineering",
  shortName: "ECE",
  tagline: "Building Connections, Advancing Communication",
  about: "The Department of Electronics & Communication Engineering at KSRM College of Engineering is committed to delivering excellence in technical education and research. With state-of-the-art facilities, experienced faculty, and industry partnerships, we prepare students for successful careers in the dynamic field of Electronics & Communication Engineering.",
  vision: "To be a leading center of excellence in Electronics & Communication Engineering education and research, producing competent engineers who contribute to technological advancement and societal development.",
  mission: [
    "To provide quality education with industry-relevant curriculum and innovative teaching methods.",
    "To promote research, innovation and collaboration with industries and academic institutions.",
    "To develop engineers with professional ethics, leadership qualities and commitment to sustainable development."
  ],
  peos: [
    { code: "PEO1", text: "To excel in their career as competent professionals in Electronics & Communication Engineering and related organizations." },
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
    { code: "PSO1", text: "Apply core principles of Electronics & Communication Engineering to design innovative solutions." },
    { code: "PSO2", text: "Use modern tools and techniques for engineering design and analysis." }
  ],
  aiHighlights: [
    { title: "AI-Driven Innovation", description: "Apply AI and machine learning for advanced problem-solving." },
    { title: "Automation & IoT", description: "Design intelligent systems and connected devices." },
    { title: "Predictive Analytics", description: "Use data-driven approaches for optimization." },
    { title: "Sustainable Solutions", description: "Engineer solutions for environmental challenges." }
  ],
  hod: {
    name: "Dr. G. Hemalatha",
    designation: "Professor & Head of Department",
    qualification: "M.Tech., Ph.D.",
    message: [
      "Welcome to the Department of Electronics & Communication Engineering. We are committed to fostering innovation, practical skills and research excellence.",
      "Our faculty and facilities are designed to provide students with world-class education and prepare them for impactful careers."
    ],
    photo: "/faculty/ece/dr.-g.-hemalatha.jpg",
    email: "hod.ece@ksrmce.ac.in"
  },
  faculty: [
    { name: "Dr. G. Hemalatha", designation: "Professor & HOD", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.-g.-hemalatha.jpg", specialization: "Digital Signal Processing" },
    { name: "Dr. P. Giri Prasad", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.-p.-giri-prasad.jpg", specialization: "Signal Processing" },
    { name: "Dr. S. Zahiruddin", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.s.-zahiruddin.jpg", specialization: "Microwave Engineering" },
    { name: "Dr. M. Madhusudhan Reddy", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.-m.-madhusudhan-reddy.jpg", specialization: "Communication Systems" },
    { name: "Dr. D. Arun Kumar", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.-d.-arun-kumar.jpg", specialization: "Microelectronics" },
    { name: "Dr. S. L. Prathapa Reddy", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.s.l.-prathapa-reddy.jpg", specialization: "Embedded Systems" },
    { name: "G. A. Sanjeeva Reddy", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/faculty/ece/g.a.-sanjeeva-reddy.jpg", specialization: "RF & Microwave" },
    { name: "P. Krishna Teja Yadav", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/faculty/ece/p.-krishna-teja-yadav.jpg", specialization: "Communications" },
    { name: "M. Prabhakar", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/faculty/ece/m.-prabhakar.jpg", specialization: "Analog Electronics" },
  ],
  programmes: [
    { name: "B.Tech - Electronics & Communication Engineering", level: "Undergraduate", intake: "60" },
    { name: "M.Tech - Microwave and Antenna Engineering", level: "Postgraduate", intake: "24" }
  ],
  labs: [
    { name: "Simulation Laboratory", description: "Circuit simulation and analysis using SPICE, MATLAB, and related tools", imageUrl: "/Labs/ECE/ece1.webp" },
    { name: "Project Laboratory", description: "Hands-on project design and implementation laboratory", imageUrl: "/Labs/ECE/ece2.webp" },
    { name: "Microwave Laboratory", description: "Microwave components, antennas, and RF device characterization", imageUrl: "/Labs/ECE/ece3.webp" },
    { name: "Microprocessors Laboratory", description: "8085, 8086, and ARM microprocessor programming and interfacing", imageUrl: "/Labs/ECE/ece4.webp" },
    { name: "IoT Laboratory", description: "Internet of Things, embedded systems, and sensor network projects", imageUrl: "/Labs/ECE/ece5.webp" },
    { name: "IC Applications Laboratory", description: "Integrated circuit design, testing, and applications", imageUrl: "/Labs/ECE/ece6.webp" },
    { name: "Devices & Circuits Laboratory", description: "Electronic devices, transistor circuits, and analog electronics", imageUrl: "/Labs/ECE/ece7.webp" },
    { name: "Communications Laboratory", description: "Digital and analog communication systems, signal processing", imageUrl: "/Labs/ECE/ece8.webp" }
  ],
  heroImage: "/banner.png"
};

export default ece;
