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
        "name": "Computer Science & Engineering",
        "slug": "cse",
        "facultyCount": 30,
        "faculty": [
            {
                "name": "Dr. V. Lokeswara Reddy",
                "designation": "Professor & Head",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. N. Amaranatha Reddy",
                "designation": "Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. G. Sreenivasa Reddy",
                "designation": "Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. V. Giridhar",
                "designation": "Associate Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. T. Kiran Kumar",
                "designation": "Associate Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. V. Ramesh Babu",
                "designation": "Associate Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": ""
            }
        ]
    },
    {
        "name": "Electrical & Electronics Engineering",
        "slug": "eee",
        "facultyCount": 21,
        "faculty": [
            {
                "name": "Dr. M.S. Priyadarshini",
                "designation": "Professor & Head",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Mr. M. Bhaskar Reddy",
                "designation": "Professor",
                "qualification": "M.Tech.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Mr. K. Rama Mohan Reddy",
                "designation": "Associate Professor",
                "qualification": "M.Tech.",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. C. Kumar Reddy",
                "designation": "Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/eee/dr.-c-kumar-reddy.jpg"
            },
            {
                "name": "Sri. K. Kalyan Kumar",
                "designation": "Associate Professor",
                "qualification": "M.Tech.",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": "/faculty/eee/k-kalyan-kumar.jpg"
            },
            {
                "name": "Sri. T. Kishore Kumar",
                "designation": "Assistant Professor",
                "qualification": "M.Tech.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            }
        ]
    },
    {
        "name": "Electronics & Communication Engineering",
        "slug": "ece",
        "facultyCount": 6,
        "faculty": [
            {
                "name": "Dr. G. Hemalatha",
                "designation": "Professor & Head",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/ece/dr.-g.-hemalatha.jpg"
            },
            {
                "name": "Dr. D. Arun Kumar",
                "designation": "Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/ece/dr.-d.-arun-kumar.jpg"
            },
            {
                "name": "T. Umamaheswari",
                "designation": "Associate Professor",
                "qualification": "M.Tech.",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": "/faculty/ece/t.-umamaheswari.jpg"
            },
            {
                "name": "P. Swetha",
                "designation": "Assistant Professor",
                "qualification": "M.Tech.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/ece/p.swetha.jpg"
            },
            {
                "name": "R.V. Suresh",
                "designation": "Assistant Professor",
                "qualification": "M.Tech.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/ece/rv.suresh.jpg"
            },
            {
                "name": "M. Prabhakar",
                "designation": "Associate Professor",
                "qualification": "M.Tech.",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": "/faculty/ece/m.-prabhakar.jpg"
            }
        ]
    },
    {
        "name": "Civil Engineering",
        "slug": "civil",
        "facultyCount": 13,
        "faculty": [
            {
                "name": "Dr. G. Chennakesava Reddy",
                "designation": "Professor & Head",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. N. Amaranatha Reddy",
                "designation": "Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. V. Giridhar",
                "designation": "Associate Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. M.V. Ravi Kishore Reddy",
                "designation": "Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/civil/m-v-ravi-k-reddy.jpg"
            },
            {
                "name": "Dr. I. Srinivasula Reddy",
                "designation": "Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/civil/isr.jpg"
            },
            {
                "name": "Sri. P. Suresh Praveen Kumar",
                "designation": "Assistant Professor",
                "qualification": "M.Tech.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            }
        ]
    },
    {
        "name": "Mechanical Engineering",
        "slug": "mechanical",
        "facultyCount": 6,
        "faculty": [
            {
                "name": "D. Merwin Rajesh",
                "designation": "Professor & Head",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/mechanical/d.merwin-rajesh.png"
            },
            {
                "name": "Mahaboob Basha",
                "designation": "Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/mechanical/mahaboob-basha.mec.jpeg"
            },
            {
                "name": "Gowthami",
                "designation": "Associate Professor",
                "qualification": "M.Tech.",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": "/faculty/mechanical/gowthami.jpg"
            },
            {
                "name": "Ravichandra",
                "designation": "Assistant Professor",
                "qualification": "M.Tech.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/mechanical/ravichandra.jpg"
            },
            {
                "name": "Suresh Babu",
                "designation": "Assistant Professor",
                "qualification": "M.Tech.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/mechanical/suresh-babu.jpg"
            },
            {
                "name": "S. Vijay Kumar",
                "designation": "Assistant Professor",
                "qualification": "M.Tech.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": "/faculty/mechanical/s-vijay-kumar.jpg"
            }
        ]
    },
    {
        "name": "Humanities & Sciences",
        "slug": "humanities-sciences",
        "facultyCount": 6,
        "faculty": [
            {
                "name": "Dr. [HOD Name]",
                "designation": "Professor & Head",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. Faculty Two",
                "designation": "Professor",
                "qualification": "M.Tech., Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Ms. Faculty Three",
                "designation": "Associate Professor",
                "qualification": "M.A., Ph.D.",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Mr. Faculty Four",
                "designation": "Assistant Professor",
                "qualification": "M.Sc.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Ms. Faculty Five",
                "designation": "Assistant Professor",
                "qualification": "M.A.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Mr. Faculty Six",
                "designation": "Assistant Professor",
                "qualification": "M.Sc.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            }
        ]
    },
    {
        "name": "Management Studies (MBA)",
        "slug": "mba",
        "facultyCount": 6,
        "faculty": [
            {
                "name": "Dr. [HOD Name]",
                "designation": "Professor & Head",
                "qualification": "MBA, Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Dr. Faculty Two",
                "designation": "Professor",
                "qualification": "MBA, Ph.D.",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Mr. Faculty Three",
                "designation": "Associate Professor",
                "qualification": "MBA",
                "experience": "8+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Ms. Faculty Four",
                "designation": "Assistant Professor",
                "qualification": "MBA",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Mr. Faculty Five",
                "designation": "Assistant Professor",
                "qualification": "MBA, M.Tech",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            },
            {
                "name": "Ms. Faculty Six",
                "designation": "Assistant Professor",
                "qualification": "MBA",
                "experience": "15+ years",
                "specialization": "",
                "photoUrl": ""
            }
        ]
    }
],
  stats: {
    totalFaculty: 88,
    phdHolders: 26,
    avgExperience: "12+ Years",
  },
}
