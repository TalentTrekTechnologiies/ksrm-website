import type { Metadata } from "next"
import { Rajdhani, DM_Sans } from "next/font/google"
import "./globals.css"
import IntroSplash from "@/components/layout/IntroSplash"
import TopBar from "@/components/layout/TopBar"
import Header from "@/components/layout/Header"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

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
  title: "K.S.R.M College of Engineering",
  description: "K.S.R.M College of Engineering, Kadapa — 40 years of engineering excellence. NAAC A++ | NBA Accredited | AICTE Approved",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${rajdhani.variable} ${dmSans.variable} antialiased`}>
        <IntroSplash />
        <TopBar />
         <Header /> 
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}