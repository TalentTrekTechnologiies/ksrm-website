import { Metadata } from 'next'
import PlacementsInternshipsTemplate from '@/components/placements/PlacementsInternshipsTemplate'

export const metadata: Metadata = {
  title: 'Internships | Training & Placements | KSRM College of Engineering',
  description: 'Explore KSRM\'s comprehensive internship programs and industry exposure opportunities.',
}

export default function InternshipsPage() {
  return <PlacementsInternshipsTemplate />
}
