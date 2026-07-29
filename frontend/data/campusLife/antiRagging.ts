export interface CommitteeMember {
  name: string
  designation: string
  role: "Chairman" | "Member" | "Convenor"
}

export interface HelplineNumber {
  label: string
  number: string
}

export interface AntiRaggingData {
  pageTitle: string
  subtitle: string
  intro: string
  policyStatement: string
  committeeMembers: CommitteeMember[]
  helplineNumbers: HelplineNumber[]
  whatIsRagging: string[]
  punishments: string[]
  howToReport: string[]
  affidavit: {
    description: string
    studentLink: string
    parentLink: string
  }
}

export const antiRagging: AntiRaggingData = {
  pageTitle: "Anti-Ragging",
  subtitle: "Zero Tolerance Policy",
  intro:
    "K.S.R.M. College of Engineering has implemented a strict zero-tolerance anti-ragging policy. The college is committed to creating a safe, inclusive, and harassment-free environment for all students. Ragging in any form is strictly prohibited and will result in severe disciplinary action.",
  policyStatement:
    "Ragging is a serious criminal offense under the Ragging Prohibition Act and various state laws. K.S.R.M. College of Engineering strictly prohibits ragging of any kind. Students found indulging in ragging shall be subject to immediate expulsion and legal proceedings. All staff members are duty-bound to report any incidents of ragging to the Anti-Ragging Committee immediately.",
  committeeMembers: [
    {
      name: "Dr. [Principal Name]",
      designation: "Principal",
      role: "Chairman",
    },
    {
      name: "Dr. [Dean Name]",
      designation: "Dean of Student Affairs",
      role: "Convenor",
    },
    {
      name: "Mr. [Faculty Name]",
      designation: "Faculty Member",
      role: "Member",
    },
    {
      name: "Ms. [Faculty Name]",
      designation: "Faculty Member",
      role: "Member",
    },
    {
      name: "[Senior Student Name]",
      designation: "Senior Student Representative",
      role: "Member",
    },
  ],
  helplineNumbers: [
    {
      label: "National Helpline",
      number: "1800-5500-22",
    },
    {
      label: "College Helpline",
      number: "+91-8554-233333",
    },
    {
      label: "Anti-Ragging Committee",
      number: "+91-8554-233333 (Ext: 380)",
    },
  ],
  whatIsRagging: [
    "Any conduct by which a student subjects another student to torture, physical abuse, or psychological harassment",
    "Forcing seniors and juniors into humiliating acts or situations",
    "Coercing juniors to participate in unethical or illegal activities",
    "Ostracizing, insulting, or demeaning remarks towards any student",
    "Use of abusive language or threats against any student",
    "Forcing students to perform stunts or endure unnecessary hardship",
    "Unauthorized use of personal spaces or belongings",
    "Any form of intimidation or bullying",
  ],
  punishments: [
    "Immediate suspension from hostel and college premises",
    "Expulsion from the institution",
    "Criminally prosecuted under Section 144 (Unlawful Assembly) and 506 (Criminal Intimidation) of IPC",
    "Submission to police for prosecutions",
    "Fine as per institutional norms",
    "Loss of educational opportunity in premier institutions",
    "Permanent criminal record affecting future employment",
    "Court-ordered community service and rehabilitation",
  ],
  howToReport: [
    "Contact the Anti-Ragging Committee directly using helpline numbers",
    "Report to your class mentor or hostel warden immediately",
    "Approach the Dean of Student Affairs in person",
    "Send written complaint to anti-ragging@ksrmce.ac.in with details",
    "File complaint with local police authorities",
    "Report anonymously through college notice boards or suggestion boxes",
    "Contact parents/guardians who can escalate to college administration",
  ],
  affidavit: {
    description:
      "All students and parents must submit anti-ragging affidavits at the time of admission, confirming their commitment to adhering to the anti-ragging policy.",
    studentLink: "/documents/affidavit/student-anti-ragging.pdf",
    parentLink: "/documents/affidavit/parent-anti-ragging.pdf",
  },
}
