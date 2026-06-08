const fs = require('fs');
const path = require('path');

// Map faculty names to downloaded filenames
const photoMapping = {
  cse: {
    'Dr. V. Lokeswara Reddy': '',
    'Dr. N. Amaranatha Reddy': '',
    'Dr. G. Sreenivasa Reddy': '',
    'Dr. V. Giridhar': '',
    'Dr. T. Kiran Kumar': '',
    'Dr. V. Ramesh Babu': '',
    'Dr. P. Kishore Kumar Reddy': '',
    'Dr. I. Srinivasula Reddy': '',
    'Sri. V.V. Prasad': '',
    'Sri. N. Prathap Kumar': '',
    'Smt. K. Niveditha': '',
    'Sri. P. Pavan Kumar': '',
    'Miss. V. SaiNeereja': '',
    'Sri. CH. Santosh Kumar': '',
    'Sri. M.C. Venkata Subbaiah': '',
    'Sri. K. Hemanth Kumar Reddy': '',
    'Sri. K. Pramod': '',
    'Sri. Reddi Satish Kumar': '',
    'M. Anusha': '',
    'S. Nazeer Ahmed': '',
    'Sri. D. Dharma Simha Reddy': '',
    'R. Naga Raju': '',
    'Ramprakash Reddy Arava': '/images/departments/cse/faculty/Ramprakash%20Reddy%20Arava.jpg',
    'Sri. Y. Dastagiri': '',
    'K. Karthik Yadav': '/images/departments/cse/faculty/karthik.jpg',
    'S. Khaja Khizar': '/images/departments/cse/faculty/S.%20Khaja%20Khizar.jpg',
    'P. Naga Lakshmi': '/images/departments/cse/faculty/Nagalakshmi.jpeg',
    'N. Narayana Reddy': '/images/departments/cse/faculty/narayana-reddy.jpg',
    'K. Shabana': '/images/departments/cse/faculty/Shabana.jpeg',
    'V. Sudha': '/images/departments/cse/faculty/V.%20Sudha.jpg',
  },
  eee: {
    'Dr. M.S. Priyadarshini': '/images/departments/eee/faculty/EEE-HOD.jpeg',
    'Mr. M. Bhaskar Reddy': '/images/departments/eee/faculty/Bhaskar.jpg',
    'Mr. K. Rama Mohan Reddy': '',
    'Dr. C. Kumar Reddy': '/images/departments/eee/faculty/Dr.%20C%20Kumar%20Reddy.jpg',
    'Sri. K. Kalyan Kumar': '/images/departments/eee/faculty/K%20Kalyan%20Kumar.jpg',
    'Sri. T. Kishore Kumar': '',
    'Sri. N. Siddhik': '',
    'Sri. S. Khader Vali': '/images/departments/eee/faculty/S%20Khadarvalli.jpg',
    'Smt. A. Jyothirmayi': '',
    'Mr. T. Naresh': '',
    'Dr. T. Mari Prasath': '',
    'Sri. G. Hussain Basha': '/images/departments/eee/faculty/G%20Hussain%20Basha.jpg',
    'Dr. K. Amaresh': '/images/departments/eee/faculty/Dr.Amaresh.jpg',
    'Sri. P. Durga Prasad': '',
    'Sri. Bhaskar': '/images/departments/eee/faculty/Bhaskar.jpg',
    'Sri. Ram Mohan': '',
    'Sri. Saleh': '',
    'Sri. Kalyan': '',
    'Sri. Kishore': '',
    'Sri. Siddhik': '',
    'Sri. Khader': '',
  },
  ece: {
    'Dr. [HOD Name]': '',
    'Dr. Faculty Two': '',
    'Mr. Faculty Three': '',
    'Ms. Faculty Four': '',
    'Mr. Faculty Five': '',
    'Ms. Faculty Six': '',
  },
  civil: {
    'Dr. G. Chennakesava Reddy': '',
    'Dr. G. Sreenivasa Reddy': '',
    'Sri. S. Sridhar': '',
    'Dr. V. Giridhar': '',
    'Dr. M.V. Ravi Kishore Reddy': '',
    'Dr. I. Srinivasula Reddy': '',
    'Sri. P. Suresh Praveen Kumar': '',
    'Smt. K. Niveditha': '',
    'Sri. P. Rajendra Kumar': '',
    'Sri. Y. Dastagiri': '',
    'Smt. V. Venkata Subbamma': '',
    'Sri. K. Hemanth Kumar Reddy': '',
    'Sri. D. Viswanath': '',
    'Sri. M. Vijaya Kumar': '',
  },
  mechanical: {
    'Dr. [HOD Name]': '',
    'Dr. Faculty Two': '',
    'Mr. Faculty Three': '',
    'Ms. Faculty Four': '',
    'Mr. Faculty Five': '',
    'Ms. Faculty Six': '',
  },
};

// Read departments.ts
const filepath = path.join(__dirname, '../data/departments.ts');
let content = fs.readFileSync(filepath, 'utf-8');

// For now, just report the mappings
console.log('=== FACULTY PHOTO MAPPINGS ===\n');
for (const [dept, mapping] of Object.entries(photoMapping)) {
  console.log(`${dept}:`);
  for (const [name, photo] of Object.entries(mapping)) {
    if (photo) {
      console.log(`  ✅ ${name} -> ${path.basename(photo)}`);
    }
  }
  console.log('');
}

console.log('Note: For faculty without downloaded images, photo field remains empty ""');
console.log('This shows their initials on a blue gradient background.');
