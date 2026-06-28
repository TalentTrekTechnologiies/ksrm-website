import { Metadata } from 'next'
import PlacementsOverviewTemplate from '@/components/placements/PlacementsOverviewTemplate'

export const metadata: Metadata = {
  title: 'Overview | Training & Placements | KSRM College of Engineering',
  description: 'Learn about KSRM\'s Training & Placement Cell, objectives, and leadership team.',
}

export default function OverviewPage() {
  return <PlacementsOverviewTemplate />
}
