import type { Department } from "@/types/department";

export const mech: Department = {
  slug: "mechanical",
  name: "Mechanical Engineering",
  shortName: "MECH",
  tagline: "Engineering Precision, Delivering Excellence",
  about: "The Department of Mechanical Engineering at KSRM College of Engineering is committed to delivering excellence in technical education and research. With state-of-the-art facilities, experienced faculty, and industry partnerships, we prepare students for successful careers in the dynamic field of Mechanical Engineering.",
  vision: "To be a leading center of excellence in Mechanical Engineering education and research, producing competent engineers who contribute to technological advancement and societal development.",
  mission: [
    "To provide quality education with industry-relevant curriculum and innovative teaching methods.",
    "To promote research, innovation and collaboration with industries and academic institutions.",
    "To develop engineers with professional ethics, leadership qualities and commitment to sustainable development."
  ],
  peos: [
    { code: "PEO1", text: "To excel in their career as competent professionals in Mechanical Engineering and related organizations." },
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
    { code: "PSO1", text: "Apply core principles of Mechanical Engineering to design innovative solutions." },
    { code: "PSO2", text: "Use modern tools and techniques for engineering design and analysis." }
  ],
  aiHighlights: [
    { title: "AI-Driven Innovation", description: "Apply AI and machine learning for advanced problem-solving." },
    { title: "Automation & IoT", description: "Design intelligent systems and connected devices." },
    { title: "Predictive Analytics", description: "Use data-driven approaches for optimization." },
    { title: "Sustainable Solutions", description: "Engineer solutions for environmental challenges." }
  ],
  hod: {
    name: "Dr. D. Ravikanth",
    designation: "Professor & Head of Department",
    qualification: "M.Tech., Ph.D.",
    message: [
      "Welcome to the Department of Mechanical Engineering. We are committed to fostering innovation, practical skills and research excellence.",
      "Our faculty and facilities are designed to provide students with world-class education and prepare them for impactful careers."
    ],
    photo: "/faculty/mechanical/dr-d-ravikanth.jpg",
    email: "hod.mech@ksrmce.ac.in"
  },
  faculty: [
    { name: "Dr. D. Ravikanth", designation: "Professor & HOD", qualification: "M.Tech., Ph.D.", photo: "", specialization: "Thermal Engineering" },
    { name: "Dr. Ravichandra", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/images/departments/mechanical/faculty/ravichandra.jpg", specialization: "Machine Design" },
    { name: "Dr. Mahaboob Basha", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/images/departments/mechanical/faculty/suresh-babu.jpg", specialization: "Manufacturing & Production Engineering" },
    { name: "S. Vijay Kumar", designation: "Associate Professor", qualification: "M.Tech.", photo: "/images/departments/mechanical/faculty/s-vijay-kumar.jpg", specialization: "Fluid Mechanics" },
    { name: "Gowthami", designation: "Associate Professor", qualification: "M.Tech.", photo: "/images/departments/mechanical/faculty/gowthami.jpg", specialization: "Manufacturing Engineering" },
    { name: "D. Merwin Rajesh", designation: "Associate Professor", qualification: "M.Tech.", photo: "/images/departments/mechanical/faculty/d.merwin-rajesh.png", specialization: "Thermodynamics" },
    { name: "K. Anand", designation: "Associate Professor", qualification: "M.Tech.", photo: "", specialization: "CAD/CAM" },
    { name: "S. Hari Prasad", designation: "Associate Professor", qualification: "M.Tech.", photo: "", specialization: "Production Engineering" },
    { name: "A. Kumar", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Thermal Engineering" },
    { name: "B. Ravi", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Machine Design" },
    { name: "C. Srinivas", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Manufacturing" },
    { name: "D. Madhusudhan", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Fluid Mechanics" },
    { name: "E. Narasimha", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Heat Transfer" },
    { name: "F. Praveen", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Metrology" },
    { name: "G. Suresh", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "CAD/CAM" },
    { name: "H. Ashok", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Instrumentation" },
    { name: "I. Venkatesh", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Material Science" },
    { name: "J. Sai Kumar", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Production Engineering" },
    { name: "K. Murthy", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Thermal Engineering" },
    { name: "L. Ramesh", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Machine Design" },
  ],
  programmes: [
    { name: "B.Tech - Mechanical Engineering", level: "Undergraduate", intake: "60" },
    { name: "M.Tech - Thermal Engineering", level: "Postgraduate", intake: "18" }
  ],
  labs: [
    { name: "Thermal Engineering Laboratory", description: "Thermal properties, heat transfer, and refrigeration experiments", imageUrl: "/Labs/Mech/1.webp" },
    { name: "Production Engineering Laboratory", description: "Machining, manufacturing processes, and production techniques", imageUrl: "/Labs/Mech/2.webp" },
    { name: "Heat Transfer Laboratory", description: "Conduction, convection, radiation, and heat exchanger studies", imageUrl: "/Labs/Mech/3.webp" },
    { name: "Metrology Laboratory", description: "Precision measurement, gauges, and dimensional accuracy analysis", imageUrl: "/Labs/Mech/4.webp" },
    { name: "Instrumentation Laboratory", description: "Sensors, transducers, and measurement instrument calibration", imageUrl: "/Labs/Mech/5.webp" },
    { name: "Material Science Laboratory", description: "Material properties, testing, and microstructure analysis", imageUrl: "/Labs/Mech/6.webp" },
    { name: "CAD/CAM Laboratory", description: "Computer-aided design, modeling, and numerical control programming", imageUrl: "/Labs/Mech/7.webp" },
    { name: "Workshop Laboratory", description: "Fitting, welding, machining, and hands-on manufacturing skills", imageUrl: "/Labs/Mech/8.webp" }
  ],
  heroImage: "/banner.png"
};

export default mech;
