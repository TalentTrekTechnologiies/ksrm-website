export interface DegreeVerificationData {
  pageTitle: string
  subtitle: string
  about: string
  verificationLink: string
  steps: Array<{ step: string; title: string; description: string }>
  contact: { office: string; phone: string; email: string }
}

export const degreeVerification: DegreeVerificationData = {
  pageTitle: "Degree Verification",
  subtitle:
    "Verify the authenticity of degrees issued by K.S.R.M. College of Engineering",
  about:
    "K.S.R.M. College of Engineering provides online degree verification services through iCredify platform. Employers and institutions can verify the authenticity of degrees and certificates issued by our college.",
  verificationLink: "http://icredify.com/degreeverify/ksrm",
  steps: [
    {
      step: "1",
      title: "Visit iCredify Portal",
      description: "Go to the official verification portal at icredify.com",
    },
    {
      step: "2",
      title: "Enter Certificate Details",
      description:
        "Enter the certificate number, student name or other required details",
    },
    {
      step: "3",
      title: "Verify Instantly",
      description: "Get instant verification results online",
    },
  ],
  contact: {
    office: "Examination Section",
    phone: "08562 295972",
    email: "principal@ksrmce.ac.in",
  },
}
