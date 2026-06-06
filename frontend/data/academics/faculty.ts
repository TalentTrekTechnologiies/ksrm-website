export interface FacultyMember {
  name: string
  designation: string
  qualification: string
  experience: string
  specialization: string
  photoUrl: string
}

export interface Department {
  name: string
  slug: string
  facultyCount: number
  faculty: FacultyMember[]
}

export interface FacultyData {
  pageTitle: string
  subtitle: string
  intro: string
  departments: Department[]
  stats: {
    totalFaculty: number
    phdHolders: number
    avgExperience: string
  }
}

export const faculty: FacultyData = {
  pageTitle: "Faculty",
  subtitle: "Meet Our Experienced Educators",
  intro:
    "KSRM College of Engineering is served by a dedicated team of experienced faculty members with strong academic credentials and industry exposure. Our faculty are committed to imparting quality education, conducting research, and mentoring the next generation of engineers.",
  departments: [
    {
      name: "Computer Science & Engineering",
      slug: "cse",
      facultyCount: 24,
      faculty: [
        {
          name: "Dr. [HOD Name]",
          designation: "Professor & Head",
          qualification: "M.Tech., Ph.D.",
          experience: "18 years",
          specialization: "Machine Learning",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Dr. Faculty Two",
          designation: "Professor",
          qualification: "M.Tech., Ph.D.",
          experience: "15 years",
          specialization: "Data Science",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Mr. Faculty Three",
          designation: "Associate Professor",
          qualification: "M.Tech.",
          experience: "10 years",
          specialization: "Computer Networks",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Ms. Faculty Four",
          designation: "Assistant Professor",
          qualification: "M.Tech.",
          experience: "6 years",
          specialization: "Web Technologies",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Mr. Faculty Five",
          designation: "Assistant Professor",
          qualification: "M.Tech.",
          experience: "5 years",
          specialization: "Database Systems",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
      ],
    },
    {
      name: "Electronics & Communication Engineering",
      slug: "ece",
      facultyCount: 18,
      faculty: [
        {
          name: "Dr. [HOD Name]",
          designation: "Professor & Head",
          qualification: "M.Tech., Ph.D.",
          experience: "16 years",
          specialization: "VLSI Design",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Dr. Faculty Two",
          designation: "Professor",
          qualification: "M.Tech., Ph.D.",
          experience: "14 years",
          specialization: "Digital Signal Processing",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Mr. Faculty Three",
          designation: "Associate Professor",
          qualification: "M.Tech.",
          experience: "9 years",
          specialization: "Embedded Systems",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Ms. Faculty Four",
          designation: "Assistant Professor",
          qualification: "M.Tech.",
          experience: "7 years",
          specialization: "Communications",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
      ],
    },
    {
      name: "Electrical & Electronics Engineering",
      slug: "eee",
      facultyCount: 16,
      faculty: [
        {
          name: "Dr. [HOD Name]",
          designation: "Professor & Head",
          qualification: "M.Tech., Ph.D.",
          experience: "17 years",
          specialization: "Power Systems",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Dr. Faculty Two",
          designation: "Professor",
          qualification: "M.Tech., Ph.D.",
          experience: "13 years",
          specialization: "Electrical Machines",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Mr. Faculty Three",
          designation: "Associate Professor",
          qualification: "M.Tech.",
          experience: "8 years",
          specialization: "Power Electronics",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Ms. Faculty Four",
          designation: "Assistant Professor",
          qualification: "M.Tech.",
          experience: "5 years",
          specialization: "Control Systems",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
      ],
    },
    {
      name: "Civil Engineering",
      slug: "civil",
      facultyCount: 20,
      faculty: [
        {
          name: "Dr. [HOD Name]",
          designation: "Professor & Head",
          qualification: "M.Tech., Ph.D.",
          experience: "19 years",
          specialization: "Structural Engineering",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Dr. Faculty Two",
          designation: "Professor",
          qualification: "M.Tech., Ph.D.",
          experience: "14 years",
          specialization: "Geotechnical Engineering",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Mr. Faculty Three",
          designation: "Associate Professor",
          qualification: "M.Tech.",
          experience: "10 years",
          specialization: "Transportation Engineering",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Ms. Faculty Four",
          designation: "Assistant Professor",
          qualification: "M.Tech.",
          experience: "6 years",
          specialization: "Environmental Engineering",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Mr. Faculty Five",
          designation: "Assistant Professor",
          qualification: "M.Tech.",
          experience: "4 years",
          specialization: "Water Resources",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
      ],
    },
    {
      name: "Mechanical Engineering",
      slug: "mechanical",
      facultyCount: 16,
      faculty: [
        {
          name: "Dr. [HOD Name]",
          designation: "Professor & Head",
          qualification: "M.Tech., Ph.D.",
          experience: "18 years",
          specialization: "CAD/CAM",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Dr. Faculty Two",
          designation: "Professor",
          qualification: "M.Tech., Ph.D.",
          experience: "15 years",
          specialization: "Thermal Engineering",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Mr. Faculty Three",
          designation: "Associate Professor",
          qualification: "M.Tech.",
          experience: "9 years",
          specialization: "Manufacturing Technology",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Ms. Faculty Four",
          designation: "Assistant Professor",
          qualification: "M.Tech.",
          experience: "5 years",
          specialization: "Fluid Mechanics",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
      ],
    },
    {
      name: "Humanities & Sciences",
      slug: "humanities-sciences",
      facultyCount: 22,
      faculty: [
        {
          name: "Dr. [HOD Name]",
          designation: "Professor & Head",
          qualification: "M.Tech., Ph.D.",
          experience: "16 years",
          specialization: "Mathematics",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Dr. Faculty Two",
          designation: "Professor",
          qualification: "M.Tech., Ph.D.",
          experience: "14 years",
          specialization: "Physics",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Ms. Faculty Three",
          designation: "Associate Professor",
          qualification: "M.A., Ph.D.",
          experience: "10 years",
          specialization: "English Communication",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Mr. Faculty Four",
          designation: "Assistant Professor",
          qualification: "M.Sc.",
          experience: "7 years",
          specialization: "Chemistry",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Ms. Faculty Five",
          designation: "Assistant Professor",
          qualification: "M.A.",
          experience: "5 years",
          specialization: "Professional Communication",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
      ],
    },
    {
      name: "Management Studies (MBA)",
      slug: "mba",
      facultyCount: 12,
      faculty: [
        {
          name: "Dr. [HOD Name]",
          designation: "Professor & Head",
          qualification: "MBA, Ph.D.",
          experience: "17 years",
          specialization: "Strategic Management",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Dr. Faculty Two",
          designation: "Professor",
          qualification: "MBA, Ph.D.",
          experience: "15 years",
          specialization: "Finance",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Mr. Faculty Three",
          designation: "Associate Professor",
          qualification: "MBA",
          experience: "8 years",
          specialization: "Marketing",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
        {
          name: "Ms. Faculty Four",
          designation: "Assistant Professor",
          qualification: "MBA",
          experience: "5 years",
          specialization: "Human Resources",
          photoUrl: "/images/faculty/placeholder.jpg",
        },
      ],
    },
  ],
  stats: {
    totalFaculty: 128,
    phdHolders: 35,
    avgExperience: "10.5 years",
  },
}
