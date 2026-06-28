import { Metadata } from 'next'
import PlacementsMoUsTemplate from '@/components/placements/PlacementsMoUsTemplate'

export const metadata: Metadata = {
  title: 'MoUs | Training & Placements | KSRM College of Engineering',
  description: 'Explore KSRM\'s industry partnerships and memoranda of understanding with leading organizations.',
}

export default function MoUsPage() {
  return <PlacementsMoUsTemplate />
}
