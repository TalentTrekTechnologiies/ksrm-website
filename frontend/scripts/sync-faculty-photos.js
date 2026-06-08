const fs = require('fs');
const path = require('path');

// Read both files
const facultyFile = fs.readFileSync(path.join(__dirname, '../data/academics/faculty.ts'), 'utf-8');
const departmentsFile = fs.readFileSync(path.join(__dirname, '../data/departments.ts'), 'utf-8');

// Extract faculty data from departments.ts
const departmentSlugs = [
  { key: 'cse', slug: 'cse' },
  { key: 'eee', slug: 'eee' },
  { key: 'ece', slug: 'ece' },
  { key: 'civil', slug: 'civil' },
  { key: 'mechanical', slug: 'mechanical' },
  { key: 'humanities-sciences', slug: 'humanities-sciences' },
  { key: 'mba', slug: 'mba' },
];

function extractDepartmentFaculty(key) {
  const quotedKey = key.includes('-') ? `"${key}"` : key;
  const pattern = new RegExp(`${quotedKey}:\\s*\\{[\\s\\S]*?faculty:\\s*\\[([\\s\\S]*?)\\],\\s*(?:programmes:|gallery:)`, 'm');
  const match = departmentsFile.match(pattern);

  if (!match) return [];

  const facultyText = match[1];
  const facultyMembers = [];

  const facultyPattern = /\{\s*name:\s*"([^"]+)"[\s\S]*?designation:\s*"([^"]+)"[\s\S]*?qualification:\s*"([^"]+)"[\s\S]*?photo:\s*"([^"]*)"/g;

  let match2;
  while ((match2 = facultyPattern.exec(facultyText)) !== null) {
    facultyMembers.push({
      name: match2[1],
      designation: match2[2],
      qualification: match2[3],
      photo: match2[4],
    });
  }

  return facultyMembers;
}

// Build mapping of faculty name to photo path
console.log('Building faculty photo mapping from departments.ts...\n');
const photoMap = {};

departmentSlugs.forEach(({ key }) => {
  const faculty = extractDepartmentFaculty(key);
  faculty.forEach(f => {
    photoMap[f.name] = f.photo;
  });
});

console.log(`✅ Mapped ${Object.keys(photoMap).length} faculty members\n`);

// Now update faculty.ts
let updatedFacultyFile = facultyFile;

// Replace photoUrl values for each mapped faculty
Object.entries(photoMap).forEach(([name, photo]) => {
  // Find the faculty entry in faculty.ts and update its photoUrl
  const pattern = new RegExp(`("name":\\s*"${name.replace(/[.*+?^${}()|\\[\]\\\\]/g, '\\$&')}"[\\s\\S]*?"photoUrl":\\s*)"([^"]*)"`, 'g');

  if (pattern.test(updatedFacultyFile)) {
    updatedFacultyFile = updatedFacultyFile.replace(pattern, `$1"${photo}"`);
    console.log(`✅ ${name} → ${photo || '(empty)'}`);
  }
});

// Write updated faculty.ts
fs.writeFileSync(path.join(__dirname, '../data/academics/faculty.ts'), updatedFacultyFile);
console.log('\n✅ Updated data/academics/faculty.ts with matching photo paths');
