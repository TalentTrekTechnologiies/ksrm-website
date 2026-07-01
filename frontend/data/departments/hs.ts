import type { Department } from "@/types/department";

export const hs: Department = {
  slug: "hs",
  name: "Humanities & Sciences",
  shortName: "H&S",
  tagline: "Building Foundations for Engineering Excellence",
  about: "The Department of Humanities & Sciences at KSRM College of Engineering provides foundational knowledge in mathematics, physics, chemistry and humanities that form the backbone of engineering education. Our dedicated faculty ensures students develop strong analytical and communication skills essential for their engineering careers.",
  vision: "To be a center of excellence in providing foundational science and humanities education that supports engineering excellence and develops well-rounded professionals.",
  mission: [
    "To deliver high-quality education in mathematics, sciences and humanities with emphasis on practical application and critical thinking.",
    "To foster research and innovation in basic sciences and promote interdisciplinary collaboration.",
    "To develop communication and soft skills that enable students to excel as professional engineers and responsible citizens."
  ],
  peos: [
    { code: "PEO1", text: "To excel in their career as competent professionals with strong scientific and analytical foundation." },
    { code: "PEO2", text: "To pursue higher education and engage in research in science, technology and allied fields." },
    { code: "PEO3", text: "To contribute to society through ethical practice and effective communication." }
  ],
  pos: [
    { code: "PO1", title: "Engineering Knowledge", text: "Apply the knowledge of mathematics, science and engineering fundamentals to solve complex engineering problems." },
    { code: "PO2", title: "Problem Analysis", text: "Identify, formulate and analyze complex engineering problems reaching substantiated conclusions." },
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
    { code: "PSO1", text: "Apply scientific principles and mathematical techniques to analyze and solve engineering problems." },
    { code: "PSO2", text: "Communicate technical concepts effectively to diverse audiences." }
  ],
  aiHighlights: [
    { title: "Data Analysis & Statistics", description: "Apply statistical methods and data analysis for informed decision-making." },
    { title: "Scientific Computing", description: "Use computational tools for mathematical modeling and simulation." },
    { title: "Research Methods", description: "Conduct rigorous research using scientific methodologies." },
    { title: "Communication Excellence", description: "Master technical writing and presentation skills." }
  ],
  hod: {
    name: "Department Head",
    designation: "Head of Department, H&S",
    qualification: "M.Tech., Ph.D.",
    message: [
      "Welcome to the Department of Humanities & Sciences. We believe that strong foundations in mathematics and sciences are essential for engineering excellence.",
      "Our faculty is dedicated to making these foundational subjects engaging and relevant to your engineering careers."
    ],
    photo: "",
    email: "hod.hs@ksrmce.ac.in"
  },
  faculty: [
    { name: "Department Head", designation: "Professor & Head", qualification: "M.Tech., Ph.D.", photo: "", specialization: "Mathematics" }
  ],
  programmes: [
    { name: "B.Tech Support Courses", level: "Undergraduate", intake: "All" }
  ],
  labs: [],
  heroImage: "/banner.png"
};

export default hs;
