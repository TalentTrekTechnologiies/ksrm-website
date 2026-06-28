import { Metadata } from 'next'
import PlacementsTrainingsTemplate from '@/components/placements/PlacementsTrainingsTemplate'

export const metadata: Metadata = {
  title: 'Trainings | Training & Placements | KSRM College of Engineering',
  description: 'Discover KSRM\'s k-ReATE Framework for comprehensive student training and skill development.',
}

export default function TrainingsPage() {
  return <PlacementsTrainingsTemplate />
}
