import type { Metadata } from "next"
import { Rajdhani, DM_Sans } from "next/font/google"
import "./globals.css"
import IntroSplash from "@/components/layout/IntroSplash"
import TopBar from "@/components/layout/TopBar"
import Header from "@/components/layout/Header"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import BackToTop from "@/components/layout/BackToTop"

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "K.S.R.M College of Engineering | NAAC A++ | NBA Accredited",
  description: "K.S.R.M College of Engineering, Kadapa — 45+ years of engineering excellence. NAAC A++ | NBA Tier-1 | UGC Autonomous | 7 Departments | 90% Placement Rate",
  keywords: ["engineering college", "KSRM", "Kadapa", "NAAC A++", "NBA accredited", "engineering education"],
  authors: [{ name: "K.S.R.M College of Engineering" }],
  creator: "K.S.R.M College of Engineering",
  publisher: "K.S.R.M College of Engineering",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ksrmce.ac.in",
    title: "K.S.R.M College of Engineering | NAAC A++ | NBA Accredited",
    description: "K.S.R.M College of Engineering, Kadapa — 45+ years of engineering excellence. NAAC A++ | NBA Tier-1 | UGC Autonomous",
    siteName: "K.S.R.M College of Engineering",
    images: [
      {
        url: "https://ksrmce.ac.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "K.S.R.M College of Engineering Campus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "K.S.R.M College of Engineering | NAAC A++ | NBA Accredited",
    description: "K.S.R.M College of Engineering, Kadapa — 45+ years of engineering excellence",
    images: ["https://ksrmce.ac.in/og-image.jpg"],
  },
  viewport: "width=device-width, initial-scale=1",
  metadataBase: new URL("https://ksrmce.ac.in"),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "K.S.R.M College of Engineering",
    alternateName: "KSRMCE",
    url: "https://ksrmce.ac.in",
    logo: "https://ksrmce.ac.in/logo.png",
    description: "K.S.R.M College of Engineering, Kadapa — 45+ years of engineering excellence. NAAC A++ | NBA Tier-1 | UGC Autonomous",
    sameAs: [
      "https://www.facebook.com/ksrmce",
      "https://www.twitter.com/ksrmce",
      "https://www.linkedin.com/company/ksrmce",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "K.S.R.M College of Engineering, Kadapa",
      addressLocality: "Kadapa",
      addressRegion: "Andhra Pradesh",
      postalCode: "516003",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Admissions",
      telephone: "+91-9000073434",
      email: "ksrmcengg@yahoo.co.in",
    },
    foundingDate: "1980",
    numberOfEmployees: "150+",
    educationLevel: "Bachelor, Master",
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${rajdhani.variable} ${dmSans.variable} antialiased`}>
        <IntroSplash />
        <TopBar />
         <Header />
        <Navbar />
        {children}
        <Footer />
        <BackToTop />
      </body>
    </html>
  )
}