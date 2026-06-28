import { Metadata } from 'next'
import PlacementsRecordTemplate from '@/components/placements/PlacementsRecordTemplate'

export const metadata: Metadata = {
  title: 'Placements Record | Training & Placements | KSRM College of Engineering',
  description: 'Historical placement data and statistics from KSRM College of Engineering.',
}

export default function PlacementsRecordPage() {
  return <PlacementsRecordTemplate />
}
