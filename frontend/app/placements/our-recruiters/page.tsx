import { Metadata } from 'next'
import PlacementsRecruitersTemplate from '@/components/placements/PlacementsRecruitersTemplate'

export const metadata: Metadata = {
  title: 'Our Recruiters | Training & Placements | KSRM College of Engineering',
  description: 'Meet the leading organizations that recruit KSRM graduates.',
}

export default function OurRecruitersPage() {
  return <PlacementsRecruitersTemplate />
}
