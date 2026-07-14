import type { Department } from "@/types/department";

export const civil: Department = {
  slug: "civil",
  name: "Civil Engineering",
  shortName: "CIVIL",
  tagline: "Empowering Resilient Futures with Intelligent Infrastructure",
  about:
    "Civil Engineering is one of the five founding departments, established with the college in 1980. The motto of the department is EXCEED (Excellence in Civil Engineering Education). It offers a B.Tech programme with an intake of 180 and an M.Tech in Geotechnical Engineering with an intake of 18. The department has well-equipped laboratories for undergraduate and postgraduate study, has produced many skilled engineers serving in India and abroad, and provides valuable consultancy services to government and non-government organizations.",
  aboutVideo: "/videos/civil-block.mp4",
  vision:
    "To be a center of excellence in Civil Engineering education and research, producing competent engineers committed to sustainable development and societal welfare.",
  mission: [
    "M1: Providing quality Civil Engineering education with a modern, outcome-based curriculum and effective teaching-learning methods following professional ethics.",
    "M2: Using modern tools and techniques for research, consultancy and upskilling through collaboration with industries.",
    "M3: Developing engineers with leadership, ethical values and a commitment to sustainable infrastructure development.",
  ],
  peos: [
    { code: "PEO1", text: "To excel in their career as competent civil engineers in construction, infrastructure and related organizations." },
    { code: "PEO2", text: "To pursue higher education and engage in research for providing solutions to infrastructure challenges." },
    { code: "PEO3", text: "To contribute to sustainable development through ethical engineering practice and societal responsibility." },
  ],
  pos: [
    { code: "PO1", title: "Engineering Knowledge", text: "Apply the knowledge of mathematics, science, engineering fundamentals and an engineering specialization to solve complex engineering problems." },
    { code: "PO2", title: "Problem Analysis", text: "Identify, formulate, review research literature and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics and sciences." },
    { code: "PO3", title: "Design/Development of Solutions", text: "Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for public health and safety and cultural, societal and environmental considerations." },
    { code: "PO4", title: "Conduct Investigations", text: "Conduct investigations of complex problems using research-based knowledge and research methods including design of experiments, analysis and interpretation of data and synthesis of the information to provide valid conclusions." },
    { code: "PO5", title: "Modern Tool Usage", text: "Create, select and apply appropriate techniques, resources and modern engineering and IT tools including prediction and modelling to complex engineering activities with an understanding of the limitations." },
    { code: "PO6", title: "The Engineer and Society", text: "Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional engineering practice." },
    { code: "PO7", title: "Environment and Sustainability", text: "Understand and assess the impact of professional engineering solutions in societal and environmental contexts and demonstrate knowledge of and need for sustainable development." },
    { code: "PO8", title: "Ethics", text: "Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice." },
    { code: "PO9", title: "Individual and Team Work", text: "Function effectively as an individual, and as a member or leader in diverse teams and in multidisciplinary settings." },
    { code: "PO10", title: "Communication", text: "Communicate effectively on complex engineering activities with the engineering community and with society at large, such as being able to comprehend and write effective reports, make effective presentations and give and receive clear instructions." },
    { code: "PO11", title: "Project Management and Finance", text: "Demonstrate knowledge and understanding of the engineering and management principles and apply these to one's own work as a member and leader in a team, to manage projects and in multidisciplinary environments." },
  ],
  psos: [
    { code: "PSO1", text: "Apply principles of structural, geotechnical, transportation, environmental and water resources engineering to design sustainable civil infrastructure." },
    { code: "PSO2", text: "Use modern surveying, design and analysis tools for planning and execution of civil engineering projects." },
  ],
  aiHighlights: [
    { title: "AI-Driven Generative Design & Optimization", description: "Use AI algorithms to optimize structural designs and material efficiency for sustainable infrastructure." },
    { title: "Digital Twins & Smart Cities", description: "Create virtual replicas of infrastructure for real-time monitoring, analysis and predictive management." },
    { title: "Predictive Analytics for Construction", description: "Apply machine learning to forecast project timelines, costs and resource requirements with precision." },
    { title: "Sustainable & Resilient Solutions", description: "Leverage AI for climate-resilient design and environmental impact assessment of civil projects." },
  ],
  hod: {
    name: "Dr. G. Chennakesava Reddy",
    designation: "Head of Department, CIVIL",
    qualification: "M.Tech., Ph.D.",
    message: [
      "Welcome to the Department of Civil Engineering. Our department is committed to producing engineers who can design and build infrastructure that is safe, sustainable and serves society.",
      "With a focus on practical skills and research, we prepare our students to excel in all domains of civil engineering from structural design to environmental solutions.",
    ],
    photo: "/faculty/civil/civil-hod.webp",
    email: "hod.civil@ksrmce.ac.in",
  },
  faculty: [
    { name: "Dr. G. Chennakesava Reddy", designation: "Professor & Head", qualification: "M.Tech., Ph.D.", photo: "", specialization: "Structural Engineering" },
    { name: "Dr. N. Amaranatha Reddy", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "", specialization: "Geotechnical Engineering" },
    { name: "Dr. V. Giridhar", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", photo: "", specialization: "Transportation Engineering" },
    { name: "Dr. M.V. Ravi Kishore Reddy", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/civil/m-v-ravi-k-reddy.jpg", specialization: "Structural Design" },
    { name: "Dr. I. Srinivasula Reddy", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/civil/isr.jpg", specialization: "Environmental Engineering" },
    { name: "Sri. P. Suresh Praveen Kumar", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Water Resources" },
    { name: "Smt. K. Niveditha", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/faculty/civil/niveditha.jpg", specialization: "Concrete Technology" },
    { name: "Sri. P. Rajendra Kumar", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Surveying" },
    { name: "Sri. Y. Dastagiri", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Construction Management" },
    { name: "Smt. V. Venkata Subbamma", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Geotechnical Engineering" },
    { name: "Sri. K. Hemanth Kumar Reddy", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Transportation Engineering" },
    { name: "Sri. D. Viswanath", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Hydraulic Engineering" },
    { name: "Sri. M. Vijaya Kumar", designation: "Assistant Professor", qualification: "M.Tech.", photo: "", specialization: "Structural Analysis" },
  ],
  programmes: [
    { name: "B.Tech - Civil Engineering", level: "Undergraduate", intake: "180" },
    { name: "M.Tech - Geotechnical Engineering", level: "Postgraduate", intake: "18" },
  ],
  labs: [
    { name: "Surveying Lab", description: "Land measurement and mapping", imageUrl: "/Labs/Civil/1.webp" },
    { name: "Geotechnical Engineering Lab", description: "Soil testing and analysis", imageUrl: "/Labs/Civil/2.webp" },
    { name: "Concrete Testing Lab", description: "Concrete and material testing", imageUrl: "/Labs/Civil/3.webp" },
    { name: "CAD Laboratory", description: "Civil design and drafting", imageUrl: "/Labs/Civil/4.webp" },
    { name: "Hydraulics Lab", description: "Hydraulics and flow analysis", imageUrl: "/Labs/Civil/5.webp" },
    { name: "Transportation Engineering Lab", description: "Highway and traffic analysis", imageUrl: "/Labs/Civil/6.webp" },
    { name: "Environmental Engineering Lab", description: "Water and waste treatment", imageUrl: "/Labs/Civil/7.webp" },
  ],
  heroImage: "/departments/civil.jpg"
};

export default civil;
