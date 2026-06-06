export interface ContactData {
  pageTitle: string
  subtitle: string
  address: string
  phones: string[]
  emails: string[]
  mapEmbedUrl: string
  departments: Array<{
    name: string
    phone: string
    email: string
  }>
  workingHours: string
  socialLinks: {
    facebook: string
    twitter: string
    instagram: string
    youtube: string
  }
}

export const contact: ContactData = {
  pageTitle: "Contact Us",
  subtitle: "We're here to help — reach out to us",
  address:
    "K.S.R.M. College of Engineering, Kadapa – 516 003, Andhra Pradesh, India",
  phones: ["+91 8143731980", "08562 295972", "+91 9000073434"],
  emails: ["ksrmcengg@yahoo.co.in", "principal@ksrmce.ac.in"],
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.125530584371!2d78.76410318567737!3d14.477480402447771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb373e15c65e6b7%3A0x2b13242197e9d9fa!2zS1NSTSDgsJXgsL7gsLLgsYfgsJzgsY0g4LCG4LCr4LGNIOCwh-CwguCwnOCwv-CwqOCxgOCwsOCwv-CwguCwl-CxjQ!5e0!3m2!1ste!2sin!4v1479195998208",
  departments: [
    {
      name: "Principal Office",
      phone: "+91 9000073434",
      email: "principal@ksrmce.ac.in",
    },
    {
      name: "Admissions Office",
      phone: "+91 8143731980",
      email: "ksrmcengg@yahoo.co.in",
    },
    {
      name: "Examination Section",
      phone: "08562 295972",
      email: "principal@ksrmce.ac.in",
    },
    {
      name: "Training & Placement",
      phone: "+91 9000073434",
      email: "principal@ksrmce.ac.in",
    },
  ],
  workingHours: "Monday to Saturday: 9:00 AM – 5:00 PM",
  socialLinks: {
    facebook: "https://facebook.com/ksrmceofficial",
    twitter: "https://twitter.com/ksrmceofficial",
    instagram: "https://instagram.com/ksrmceofficial",
    youtube: "http://youtube.com/ksrmceofficialmedia",
  },
}
