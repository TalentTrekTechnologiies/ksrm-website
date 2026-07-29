export interface GrievanceType {
  type: string
  description: string
}

export interface ProcessStep {
  step: string
  description: string
}

export interface GrievanceData {
  pageTitle: string
  subtitle: string
  intro: string
  policyStatement: string
  grievanceTypes: GrievanceType[]
  process: ProcessStep[]
  timelines: {
    acknowledgement: string
    resolution: string
    appeal: string
  }
  contact: {
    officer: string
    phone: string
    email: string
    officeHours: string
  }
}

export const grievance: GrievanceData = {
  pageTitle: "Grievance Redressal",
  subtitle: "Fair & Transparent Resolution",
  intro:
    "K.S.R.M. College of Engineering has established a comprehensive grievance redressal system to address student concerns and complaints. We believe in fair, transparent, and timely resolution of all grievances while maintaining confidentiality and respecting the dignity of all parties involved.",
  policyStatement:
    "Every student has the right to file a grievance without fear of victimization or retaliation. The college is committed to providing a fair and transparent process for grievance redressal. All grievances will be treated with utmost confidentiality and resolved within the stipulated timelines. Any form of victimization for filing a genuine grievance is strictly prohibited and will result in disciplinary action.",
  grievanceTypes: [
    {
      type: "Academic Grievances",
      description: "Issues related to examinations, evaluations, course content, faculty behavior, or academic standards.",
    },
    {
      type: "Hostel-Related Issues",
      description: "Problems concerning hostel facilities, management, discipline, or accommodation.",
    },
    {
      type: "Financial Matters",
      description: "Issues related to fee structure, refunds, scholarships, or financial irregularities.",
    },
    {
      type: "Disciplinary Concerns",
      description: "Appeal against disciplinary action or concerns about disciplinary processes.",
    },
    {
      type: "Harassment & Bullying",
      description: "Any form of harassment, bullying, discrimination, or unfair treatment.",
    },
    {
      type: "Infrastructure & Services",
      description: "Issues related to campus facilities, maintenance, canteen, or support services.",
    },
  ],
  process: [
    {
      step: "File Complaint",
      description: "Submit grievance in writing to the Grievance Officer with detailed description and supporting documents.",
    },
    {
      step: "Acknowledgement",
      description: "Grievance Officer acknowledges receipt within 7 working days with reference number.",
    },
    {
      step: "Preliminary Investigation",
      description: "Initial review to verify if grievance is valid and determine appropriate resolution pathway.",
    },
    {
      step: "Hearing",
      description: "Opportunity for complainant to present case and provide evidence before the committee.",
    },
    {
      step: "Resolution",
      description: "Committee deliberates and issues written resolution with recommendations within 30 days.",
    },
    {
      step: "Appeal",
      description: "Unsatisfied parties can file appeal within 15 days for higher authority review.",
    },
  ],
  timelines: {
    acknowledgement: "7 working days",
    resolution: "30 working days",
    appeal: "15 working days",
  },
  contact: {
    officer: "Chief Grievance Officer",
    phone: "+91-8554-233333 (Ext: 390)",
    email: "grievance@ksrmce.ac.in",
    officeHours: "Monday to Friday, 10:00 AM - 4:00 PM",
  },
}
