"use client"

export default function CSEDepartment() {
  const facultyData = [
    { name: "Dr. V. Lokeswara Reddy", title: "Professor & Head", photo: "/faculty/cse/cse-hod.jpg" },
    { name: "Dr. N. Amaranatha Reddy", title: "Professor", photo: null },
    { name: "Dr. G. Sreenivasa Reddy", title: "Professor", photo: null },
    { name: "Dr. V. Giridhar", title: "Associate Professor", photo: null },
    { name: "Dr. T. Kiran Kumar", title: "Associate Professor", photo: null },
    { name: "Dr. V. Ramesh Babu", title: "Associate Professor", photo: null },
    { name: "Dr. P. Kishore Kumar Reddy", title: "Associate Professor", photo: null },
    { name: "Dr. I. Srinivasula Reddy", title: "Professor", photo: null },
    { name: "Sri. V.V. Prasad", title: "Assistant Professor", photo: null },
    { name: "Sri. N. Prathap Kumar", title: "Assistant Professor", photo: null },
    { name: "Smt. K. Niveditha", title: "Assistant Professor", photo: null },
    { name: "Sri. P. Pavan Kumar", title: "Assistant Professor", photo: null },
    { name: "Miss. V. SaiNeereja", title: "Assistant Professor", photo: null },
    { name: "Sri. CH. Santosh Kumar", title: "Assistant Professor", photo: null },
    { name: "Sri. M.C. Venkata Subbaiah", title: "Assistant Professor", photo: null },
    { name: "Sri. K. Hemanth Kumar Reddy", title: "Assistant Professor", photo: null },
    { name: "Sri. K. Pramod", title: "Assistant Professor", photo: null },
    { name: "Sri. Reddi Satish Kumar", title: "Assistant Professor", photo: null },
    { name: "Sri. D. Dharma Simha Reddy", title: "Assistant Professor", photo: null },
    { name: "Sri. Y. Dastagiri", title: "Assistant Professor", photo: null },
    { name: "M. Anusha", title: "Assistant Professor", photo: null },
    { name: "S. Nazeer Ahmed", title: "Assistant Professor", photo: null },
    { name: "R. Naga Raju", title: "Assistant Professor", photo: null },
    { name: "Ramprakash Reddy Arava", title: "Assistant Professor", photo: "/faculty/cse/ramprakash-reddy-arava.jpg" },
    { name: "K. Karthik Yadav", title: "Assistant Professor", photo: null },
    { name: "S. Khaja Khizar", title: "Assistant Professor", photo: "/faculty/cse/s.-khaja-khizar.jpg" },
    { name: "P. Naga Lakshmi", title: "Assistant Professor", photo: "/faculty/cse/nagalakshmi.jpeg" },
    { name: "N. Narayana Reddy", title: "Assistant Professor", photo: null },
    { name: "K. Shabana", title: "Assistant Professor", photo: "/faculty/cse/shabana.jpeg" },
    { name: "V. Sudha", title: "Assistant Professor", photo: "/faculty/cse/v.-sudha.jpg" },
  ]

  const highlightsData = [
    { title: "Full-Stack AI Integration", desc: "Master AI across frontend, backend, and cloud infrastructure for end-to-end intelligent systems." },
    { title: "Cybersecurity & Ethical AI", desc: "Build secure, trustworthy systems with privacy-preserving AI and responsible innovation practices." },
    { title: "Agentic & Multimodal Systems", desc: "Design autonomous agents and systems that process text, vision, and audio for advanced applications." },
    { title: "Scalable Computing & DevOps", desc: "Engineer robust infrastructure for deploying AI at scale with modern containerization and automation." },
  ]

  const specializationsData = [
    { title: "CSE (AI & ML)", topics: ["Deep Learning & Neural Networks", "Natural Language Processing", "Computer Vision", "Reinforcement Learning", "AI Ethics & Responsible AI"], careers: ["AI Engineer", "ML Engineer", "Data Scientist", "Research Scientist", "NLP Engineer"] },
    { title: "CSE (Data Science)", topics: ["Statistical Analysis & Probability", "Big Data Technologies", "Data Visualization", "Predictive Analytics", "Database Management & SQL"], careers: ["Data Analyst", "Data Scientist", "Business Analyst", "BI Developer", "Database Administrator"] },
    { title: "CSE (AI & ML Advanced)", topics: ["Advanced ML", "Autonomous Systems", "Pattern Recognition", "Cloud AI Platforms", "MLOps & Model Deployment"], careers: ["AI Researcher", "MLOps Engineer", "AI Product Manager", "Robotics Engineer", "AI Consultant"] },
  ]

  const labsData = [
    { image: "/Labs/CSE/1.webp", name: "Programming Lab", desc: "Foundation programming and algorithm development" },
    { image: "/Labs/CSE/2.webp", name: "Database & Networks Lab", desc: "Database design, networks, and systems" },
    { image: "/Labs/CSE/3.webp", name: "AI & Machine Learning Lab", desc: "ML algorithms, neural networks and deep learning" },
    { image: "/Labs/CSE/4.webp", name: "Web & Mobile Development Lab", desc: "Full-stack development and capstone projects" },
  ]

  const programsData = [
    { title: "B.Tech - Computer Science & Engineering", level: "Undergraduate", intake: "120" },
    { title: "B.Tech - CSE (Data Science)", level: "Undergraduate", intake: "60" },
    { title: "B.Tech - CSE (AI & ML)", level: "Undergraduate", intake: "60" },
    { title: "M.Tech - Computer Science & Engineering", level: "Postgraduate", intake: "18" },
  ]

  const peoData = [
    { num: "PEO1", text: "To excel in their career as competent software engineers in IT and allied organizations." },
    { num: "PEO2", text: "To pursue higher education and demonstrate research temper for providing solutions to engineering problems." },
    { num: "PEO3", text: "To contribute to societal development by exhibiting leadership through professional, social and ethical values." },
  ]

  const psoData = [
    { num: "PSO1", text: "Apply engineering principles and methodologies in software project development utilizing open-ended programming environments." },
    { num: "PSO2", text: "Analyse, design, develop and deploy IT solutions and applications combining hardware and software." },
  ]

  const poData = [
    { num: "PO1", title: "Engineering Knowledge", text: "Apply the knowledge of mathematics, science, engineering fundamentals and an engineering specialization to solve complex engineering problems." },
    { num: "PO2", title: "Problem Analysis", text: "Identify, formulate, review research literature and analyze complex engineering problems reaching substantiated conclusions using first principles." },
    { num: "PO3", title: "Design/Development of Solutions", text: "Design solutions for complex engineering problems and design system components or processes that meet specified needs." },
    { num: "PO4", title: "Conduct Investigations", text: "Conduct investigations of complex problems using research-based knowledge and research methods including design of experiments." },
    { num: "PO5", title: "Modern Tool Usage", text: "Create, select and apply appropriate techniques, resources and modern engineering and IT tools." },
    { num: "PO6", title: "The Engineer and Society", text: "Apply reasoning to assess societal, health, safety, legal and cultural issues and consequent responsibilities." },
    { num: "PO7", title: "Environment and Sustainability", text: "Understand and assess the impact of professional engineering solutions in societal and environmental contexts." },
    { num: "PO8", title: "Ethics", text: "Apply ethical principles and commit to professional ethics and responsibilities and norms of engineering practice." },
    { num: "PO9", title: "Individual and Team Work", text: "Function effectively as an individual, and as a member or leader in diverse teams and multidisciplinary settings." },
    { num: "PO10", title: "Communication", text: "Communicate effectively on complex engineering activities with the engineering community and society at large." },
    { num: "PO11", title: "Project Management and Finance", text: "Demonstrate knowledge and understanding of engineering and management principles and apply to own work." },
  ]

  return (
    <main style={{ backgroundColor: "#F5EFE4", fontFamily: "Arimo, Arial, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');*{margin:0;padding:0;box-sizing:border-box}.k-container{max-width:1400px;margin:0 auto;padding:0 24px}.k-section{padding:72px 0}h1{font-size:61.2px;font-weight:700;color:white}h2{font-size:40.8px;font-weight:700;color:#2B3490;margin-bottom:48px}h3{font-size:24px;font-weight:700;color:#2B3490}h4{font-size:16px;font-weight:700;color:#2B3490;margin-top:16px;margin-bottom:12px}p{font-size:15px;line-height:1.8;color:#555;margin-bottom:16px}.k-hero{background:linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url(/banners/cse%20banner.jpg);background-size:cover;background-position:center;min-height:280px;padding:0 0 40px;display:flex;align-items:center}.k-highlights-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.k-highlight-card{background:white;border:0.8px solid #EEF0F3;border-radius:12px;padding:24px}.k-highlight-icon{font-size:32px;margin-bottom:12px}.k-highlight-title{font-size:16px;font-weight:700;color:#2B3490;margin-bottom:12px}.k-highlight-desc{font-size:14px;line-height:1.6;color:#666}.k-vision-box{background:#F9F9F9;border:1.6px solid #D4A500;border-radius:8px;padding:28px}.k-mission-items{display:flex;flex-direction:column;gap:16px}.k-mission-item{background:#F4F3EF;border-radius:8px;padding:20px;position:relative}.k-mission-badge{position:absolute;top:12px;right:12px;background:#2B3490;color:#D4A500;font-size:11px;font-weight:700;padding:4px 12px;border-radius:4px}.k-mission-text{padding-top:16px;color:#555;font-size:14px;line-height:1.7}.k-hod-section{display:grid;grid-template-columns:300px 1fr;gap:48px}.k-hod-photo{width:100%;border:8px solid #2B3490;border-radius:8px;object-fit:cover}.k-hod-meta{color:#D4A500;font-weight:600;font-size:13px;margin:8px 0 16px;letter-spacing:0.5px}.k-specs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.k-spec-card{background:white;border-radius:12px;padding:28px;border:0.8px solid #EEF0F3}.k-spec-title{font-size:16px;font-weight:700;color:#2B3490;margin-bottom:20px}.k-spec-list{list-style:none}.k-spec-list li{padding:8px 0;padding-left:20px;position:relative;color:#555;font-size:14px}.k-spec-list li:before{content:"•";position:absolute;left:0;color:#D4A500;font-weight:bold}.k-faculty-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}.k-faculty-card{background:#F7F8FA;border:0.8px solid #EEF0F3;border-radius:16px;padding:32px}.k-faculty-photo{width:120px;height:120px;border:4px solid #2B3490;border-radius:8px;object-fit:cover;margin-bottom:16px}.k-faculty-name{font-size:16px;font-weight:700;color:#2B3490}.k-faculty-title{font-size:13px;color:#888}.k-labs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}.k-lab-card{background:white;border-radius:12px;overflow:hidden;border:0.8px solid #EEF0F3}.k-lab-image{width:100%;height:240px;object-fit:cover}.k-lab-info{padding:20px}.k-lab-name{font-size:16px;font-weight:700;color:#2B3490;margin-bottom:8px}.k-lab-desc{font-size:14px;color:#666;line-height:1.6}.k-programs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}.k-program-card{background:white;border-radius:12px;padding:28px;border:0.8px solid #EEF0F3}.k-program-title{font-size:16px;font-weight:700;color:#2B3490;margin-bottom:16px}.k-program-meta{display:flex;justify-content:space-between;font-size:13px;color:#888;gap:16px}.k-peo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px}.k-peo-card{background:white;border-radius:12px;padding:28px;border:0.8px solid #EEF0F3}.k-peo-num{color:#D4A500;font-weight:700;font-size:14px;margin-bottom:12px}.k-peo-text{color:#555;font-size:14px;line-height:1.7}.k-po-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:20px}.k-po-card{background:white;border-radius:12px;padding:24px;border:0.8px solid #EEF0F3}.k-po-header{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}.k-po-num{color:#2B3490;font-weight:700;font-size:14px;min-width:50px}.k-po-title{font-size:15px;font-weight:700;color:#2B3490}.k-po-text{color:#555;font-size:13px;line-height:1.6;margin-top:8px}@media(max-width:1024px){.k-highlights-grid{grid-template-columns:repeat(2,1fr)}.k-specs-grid{grid-template-columns:1fr}.k-po-grid{grid-template-columns:1fr}.k-hod-section{grid-template-columns:1fr}}@media(max-width:640px){h1{font-size:36px}h2{font-size:28px}.k-highlights-grid{grid-template-columns:1fr}}`}</style>

      <section className="k-hero"><div className="k-container"><h1>Computer Science & Engineering</h1></div></section>

      <section className="k-section"><div className="k-container"><h2>About the Department</h2><p>With the fast-changing arena and advent of technology, the ubiquitous use of computers compels people to become computer literate. Realizing this, the college introduced Computer Science and Engineering, commemorating the decennial year of its inception. The department has since won laurels through the dedication of well-qualified, experienced faculty. It is now a centre of excellence with competent faculty, state-of-the-art laboratory equipment, and adequate infrastructure for graduate, postgraduate and research programmes — moulding students into leaders in their profession.</p></div></section>

      <section className="k-section" style={{background:"white"}}><div className="k-container"><h2>🤖 AI-Enabled Highlights</h2><div className="k-highlights-grid">{highlightsData.map((item,i)=>(<div key={i} className="k-highlight-card"><div className="k-highlight-icon">✨</div><div className="k-highlight-title">{item.title}</div><div className="k-highlight-desc">{item.desc}</div></div>))}</div></div></section>

      <section className="k-section"><div className="k-container"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"32px"}}><div><h2 style={{marginBottom:"24px"}}>Vision</h2><div className="k-vision-box"><p style={{marginBottom:"0"}}>To evolve as a recognized centre of excellence in the area of Computer Science and Engineering and other related inter-disciplinary fields.</p></div></div><div><h2 style={{marginBottom:"24px"}}>Mission</h2><div className="k-mission-items"><div className="k-mission-item"><div className="k-mission-badge">M1</div><div className="k-mission-text">To produce competent and industry-ready professionals through a well-balanced curriculum and innovative pedagogy.</div></div><div className="k-mission-item"><div className="k-mission-badge">M2</div><div className="k-mission-text">To provide a conducive environment for research by establishing centres of excellence and industry collaborations.</div></div><div className="k-mission-item"><div className="k-mission-badge">M3</div><div className="k-mission-text">To instill leadership qualities and ethical values among students through co-curricular and extracurricular activities.</div></div></div></div></div></div></section>

      <section className="k-section" style={{background:"white"}}><div className="k-container"><h2>Head of Department</h2><div className="k-hod-section"><img src="/faculty/cse/cse-hod.jpg" alt="Dr. V. Lokeswara Reddy" className="k-hod-photo" /><div><h3>Dr. V. Lokeswara Reddy</h3><div className="k-hod-meta">HEAD OF DEPARTMENT, CSE</div><div className="k-hod-meta">M.Tech., Ph.D. | hod.cse@ksrmce.ac.in</div><h4>Message from HOD</h4><p>Welcome to the Department of Computer Science & Engineering. Our department is committed to nurturing skilled, ethical and industry-ready computer engineers prepared for the challenges of a rapidly evolving technological world. We combine rigorous academic training with hands-on experience, ensuring our graduates excel in their careers and contribute meaningfully to technological innovation and societal progress.</p></div></div></div></section>

      <section className="k-section"><div className="k-container"><h2>CSE Specializations</h2><div className="k-specs-grid">{specializationsData.map((spec,i)=>(<div key={i} className="k-spec-card"><div className="k-spec-title">{spec.title}</div><h4>KEY TOPICS</h4><ul className="k-spec-list">{spec.topics.map((topic,j)=>(<li key={j}>{topic}</li>))}</ul><h4>CAREER PATHS</h4><ul className="k-spec-list">{spec.careers.map((career,j)=>(<li key={j}>{career}</li>))}</ul></div>))}</div></div></section>

      <section className="k-section" style={{background:"white"}}><div className="k-container"><h2>Programmes Offered</h2><div className="k-programs-grid">{programsData.map((prog,i)=>(<div key={i} className="k-program-card"><div className="k-program-title">{prog.title}</div><div className="k-program-meta"><span>Level: {prog.level}</span><span>Intake: {prog.intake}</span></div></div>))}</div></div></section>

      <section className="k-section"><div className="k-container"><h2>Laboratories</h2><div className="k-labs-grid">{labsData.map((lab,i)=>(<div key={i} className="k-lab-card"><img src={lab.image} alt={lab.name} className="k-lab-image" /><div className="k-lab-info"><div className="k-lab-name">{lab.name}</div><div className="k-lab-desc">{lab.desc}</div></div></div>))}</div></div></section>

      <section className="k-section" style={{background:"white"}}><div className="k-container"><h2>Programme Educational Objectives (PEOs)</h2><div className="k-peo-grid">{peoData.map((peo,i)=>(<div key={i} className="k-peo-card"><div className="k-peo-num">{peo.num}</div><div className="k-peo-text">{peo.text}</div></div>))}</div></div></section>

      <section className="k-section"><div className="k-container"><h2>Programme Specific Outcomes (PSOs)</h2><div className="k-peo-grid">{psoData.map((pso,i)=>(<div key={i} className="k-peo-card"><div className="k-peo-num">{pso.num}</div><div className="k-peo-text">{pso.text}</div></div>))}</div></div></section>

      <section className="k-section" style={{background:"white"}}><div className="k-container"><h2>Our Faculty</h2><div className="k-faculty-grid">{facultyData.map((faculty,i)=>(<div key={i} className="k-faculty-card">{faculty.photo&&<img src={faculty.photo} alt={faculty.name} className="k-faculty-photo" />}<div className="k-faculty-name">{faculty.name}</div><div className="k-faculty-title">{faculty.title}</div></div>))}</div></div></section>

      <section className="k-section"><div className="k-container"><h2>Programme Outcomes (POs) - NBA Standards</h2><div className="k-po-grid">{poData.map((po,i)=>(<div key={i} className="k-po-card"><div className="k-po-header"><div className="k-po-num">{po.num}</div><div className="k-po-title">{po.title}</div></div><div className="k-po-text">{po.text}</div></div>))}</div></div></section>
    </main>
  )
}
