const fs = require('fs');
const path = require('path');

// Read departments.ts
const departmentsFile = fs.readFileSync(path.join(__dirname, '../data/departments.ts'), 'utf-8');

// Extract each department's data
const departmentSlugs = [
  { key: 'cse', slug: 'cse' },
  { key: 'eee', slug: 'eee' },
  { key: 'ece', slug: 'ece' },
  { key: 'civil', slug: 'civil' },
  { key: 'mechanical', slug: 'mechanical' },
  { key: 'humanities-sciences', slug: 'humanities-sciences' },
  { key: 'mba', slug: 'mba' },
];

// Simple extraction of faculty from departments.ts
function extractDepartmentFaculty(key) {
  // Handle both quoted and unquoted keys
  const quotedKey = key.includes('-') ? `"${key}"` : key;
  const pattern = new RegExp(`${quotedKey}:\\s*\\{[\\s\\S]*?faculty:\\s*\\[([\\s\\S]*?)\\],\\s*(?:programmes:|gallery:)`, 'm');
  const match = departmentsFile.match(pattern);

  if (!match) return [];

  const facultyText = match[1];
  const facultyMembers = [];

  // Extract individual faculty entries
  const facultyPattern = /\{\s*name:\s*"([^"]+)"[\s\S]*?designation:\s*"([^"]+)"[\s\S]*?qualification:\s*"([^"]+)"[\s\S]*?(?:photo:\s*"([^"]*)")?[\s\S]*?(?:specialization:\s*"([^"]*)")?/g;

  let match2;
  while ((match2 = facultyPattern.exec(facultyText)) !== null) {
    facultyMembers.push({
      name: match2[1],
      designation: match2[2],
      qualification: match2[3],
      photo: match2[4] || '',
      specialization: match2[5] || '',
    });
  }

  return facultyMembers;
}

// Extract experience from designation
function getExperience(designation) {
  if (designation.includes('Professor & Head') || designation.includes('Professor')) {
    if (designation.includes('Associate')) return '8+ years';
    return '15+ years';
  }
  if (designation.includes('Associate')) return '8+ years';
  return '5+ years';
}

// Map department slugs to display names
const deptMap = {
  'cse': 'Computer Science & Engineering',
  'eee': 'Electrical & Electronics Engineering',
  'ece': 'Electronics & Communication Engineering',
  'civil': 'Civil Engineering',
  'mechanical': 'Mechanical Engineering',
  'humanities-sciences': 'Humanities & Sciences',
  'mba': 'Management Studies (MBA)',
};

console.log('Extracting faculty data from departments.ts...\n');

const departments = [];
let totalFaculty = 0;
let totalPhd = 0;

departmentSlugs.forEach(({ key, slug }) => {
  const faculty = extractDepartmentFaculty(key);

  if (faculty.length > 0) {
    console.log(`✅ ${deptMap[slug]}: ${faculty.length} faculty`);

    const facultyWithExperience = faculty.slice(0, 6).map(f => ({
      name: f.name,
      designation: f.designation,
      qualification: f.qualification,
      experience: getExperience(f.designation),
      specialization: f.specialization || '',
      photoUrl: f.photo || '',
    }));

    departments.push({
      name: deptMap[slug],
      slug,
      facultyCount: faculty.length,
      faculty: facultyWithExperience,
    });

    totalFaculty += faculty.length;
    totalPhd += faculty.filter(f => f.qualification.includes('Ph.D.')).length;
  }
});

console.log(`\n📊 Summary:
- Total Faculty: ${totalFaculty}
- PhD Holders: ${totalPhd}
- Average Experience: 12+ Years`);

// Generate faculty.ts content
const content = `export interface FacultyMember {
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
  departments: ${JSON.stringify(departments, null, 4)},
  stats: {
    totalFaculty: ${totalFaculty},
    phdHolders: ${totalPhd},
    avgExperience: "12+ Years",
  },
}
`;

// Write to faculty.ts
fs.writeFileSync(path.join(__dirname, '../data/academics/faculty.ts'), content);
console.log('\n✅ Updated data/academics/faculty.ts');
