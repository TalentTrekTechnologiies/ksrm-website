# Banner Mapping Strategy for KSRM Website

## Available Banner Images (21 total)
- accreditations banner.jpg
- alumni banner.jpg
- anti-ragging banner.jpg
- civil banner.avif
- contact us banner.webp
- cse banner.jpg
- cultural banner.jpg
- ece banner.jpg
- edc banner.avif
- eee banner.jpg
- examinations banner.jpg
- h&s banner.png
- hostel banner.jpg
- iqac banner.webp
- mba banner.avif
- mechanical banner.jpg
- naac banner.webp
- nss banner.jpg
- sports banner.png
- startup banner.jpg
- transport banner.webp

## Available Filtered Images (useful for fallbacks)
- library.jpg
- lab.jpg, lab2.jpg, lab3.jpg, labw.jpg
- roboticslab.jpg
- block.jpg, blocktop.jpg
- buses.jpg
- event.jpg, event2.jpg, fest.jpg, fest2.jpg
- activity.jpg, activity2.jpg, activity3.jpg, activity4.jpg
- sportsground.jpg, sportsground2.jpg, sportsg3.jpg
- studentsinlib.jpg, studentsinlib2.jpg
- topview.jpg
- achievements.jpg
- inaugaration.jpg, inaugaration2.jpg
- seminar.jpg
- And many more KSR campus photos

## Page-to-Banner Mapping

### Core Pages
| Page | Route | Banner | Reason |
|------|-------|--------|--------|
| Home | / | (Video-based) | Already implemented |
| About | /about | Generic campus + topview.jpg | Institutional overview |
| About Details | /about/[slug] | topview.jpg or generic campus | Institutional details |
| Contact | /contact | contact us banner.webp | Direct mapping |
| Gallery | /gallery | event.jpg or activity.jpg | Photo showcase |
| News | /news | seminar.jpg or event.jpg | News and updates |
| Careers | /careers | startup banner.jpg | Employment opportunities |
| Degree Verification | /degree-verification | examinations banner.jpg | Verification process |

### Admissions
| Page | Route | Banner | Reason |
|------|-------|--------|--------|
| Admissions Main | /admissions | contact us banner.webp | Admissions inquiry |
| UG Admissions | /admissions/ug | contact us banner.webp or classroom image | Undergraduate programs |
| PG Admissions | /admissions/pg | mba banner.avif | Postgraduate programs |
| Diploma | /admissions/diploma | contact us banner.webp | Diploma programs |
| Academics Main | /academics | classroom image or block.jpg | Academic overview |
| Courses & Intake | /academics/courses-intake | classroom image | Course programs |
| Faculty | /academics/faculty | block.jpg or topview.jpg | Faculty listing |
| Academic Calendar | /academics/academic-calendar | library.jpg | Academic schedule |
| Syllabus | /academics/syllabus | library.jpg | Course content |
| Regulations | /academics/regulations | examinations banner.jpg | Academic rules |
| Fee Structure | /academics/fee-structure | contact us banner.webp | Fee information |

### Accreditation & Quality
| Page | Route | Banner | Reason |
|------|-------|--------|--------|
| NAAC | /naac | naac banner.webp | Direct mapping |
| IQAC | /iqac | iqac banner.webp | Direct mapping |
| Accreditation | /accreditation | accreditations banner.jpg | Direct mapping |

### Campus Life
| Page | Route | Banner | Reason |
|------|-------|--------|--------|
| Campus Life Main | /campus-life | blocktop.jpg or topview.jpg | Campus overview |
| Cultural Club | /campus-life/cultural | cultural banner.jpg | Direct mapping |
| Sports | /campus-life/sports | sports banner.png | Direct mapping |
| Hostels | /campus-life/hostels | hostel banner.jpg | Direct mapping |
| NSS | /campus-life/nss | nss banner.jpg | Direct mapping |
| Library | /campus-life/library | library.jpg | Direct mapping |
| Transport | /campus-life/transport | transport banner.webp | Direct mapping |
| Anti-Ragging | /campus-life/anti-ragging | anti-ragging banner.jpg | Direct mapping |
| Startup Cell | /campus-life/startup-cell | startup banner.jpg | Direct mapping |
| EDC | /campus-life/edc | edc banner.avif | Direct mapping |
| Grievance | /campus-life/grievance | block.jpg or admin area image | Administration |
| Campus Facilities | /campus-life/campus-facilities | blocktop.jpg or topview.jpg | Facilities overview |

### Departments
| Page | Route | Banner | Reason |
|------|-------|--------|--------|
| Departments Main | /departments | blocktop.jpg or topview.jpg | All departments |
| Computer Science | /departments/cse | cse banner.jpg | Direct mapping |
| Electronics & Comm | /departments/ece | ece banner.jpg | Direct mapping |
| Electrical & Elec | /departments/eee | eee banner.jpg | Direct mapping |
| Mechanical | /departments/mechanical | mechanical banner.jpg | Direct mapping |
| Civil | /departments/civil | civil banner.avif | Direct mapping |
| MBA | /departments/mba | mba banner.avif | Direct mapping |
| H&S | /departments/hs | h&s banner.png | Direct mapping |

### Placements & Research
| Page | Route | Banner | Reason |
|------|-------|--------|--------|
| Placements Main | /placements | startup banner.jpg | Career opportunities |
| Overview | /placements/overview | startup banner.jpg | Placement statistics |
| Our Recruiters | /placements/our-recruiters | startup banner.jpg | Companies |
| MoUs | /placements/mous | startup banner.jpg | Partnerships |
| Internships | /placements/internships | startup banner.jpg | Training |
| Trainings | /placements/trainings | seminar.jpg or training image | Training programs |
| Placements Record | /placements/placements-record | achievements.jpg | Success stories |
| Research | /research | lab.jpg or roboticslab.jpg | Research & Innovation |
| IIC | /iic | startup banner.jpg | Innovation & incubation |
| EDC (root) | /edc | edc banner.avif | Entrepreneurship |

### Admissions Pages (Root Level)
| Page | Route | Banner | Reason |
|------|-------|--------|--------|
| Admissions Main | /admissions | contact us banner.webp | Main admissions |
| UG | /admissions/ug | contact us banner.webp | UG programs |
| PG | /admissions/pg | mba banner.avif | PG programs |
| Diploma | /admissions/diploma | contact us banner.webp | Diploma programs |

### Examinations
| Page | Route | Banner | Reason |
|------|-------|--------|--------|
| Examinations | /examinations | examinations banner.jpg | Direct mapping |

### Alumni
| Page | Route | Banner | Reason |
|------|-------|--------|--------|
| Alumni | /alumni | alumni banner.jpg | Direct mapping |

## Implementation Rules
1. Use exact banner file paths from /banners/ folder with proper spacing
2. Use filtered images only when no banner exists
3. Remove all ::after overlay gradients
4. Remove all rgba() overlays
5. Remove all blue gradient backgrounds
6. Keep text white with subtle shadow for readability
7. Maintain consistent hero height (320px min-height)
8. Ensure all images use cover sizing
9. Test on light and dark banners
