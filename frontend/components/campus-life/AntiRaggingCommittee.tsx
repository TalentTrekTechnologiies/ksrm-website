"use client";

import CommitteeRoster from "@/components/committees/CommitteeRoster";

/**
 * The Anti-Ragging Committee's roster.
 *
 * The table itself now lives in CommitteeRoster, shared with the Grievance
 * Redressal Cell - see that file for how the ordering works.
 *
 * No placeholder roster here any more. This page used to print five invented
 * rows - "Dr. [Principal Name]", "Mr. [Faculty Name]" and so on - whenever the
 * CMS held no anti-ragging committee, which is the state it is in today. Those
 * bracketed names were on the live site looking like real appointments to a
 * committee that a student in trouble is meant to approach. Saying the roster
 * is not published yet is the honest answer, and it disappears the moment the
 * committee is entered in Admin -> Committees.
 */
export default function AntiRaggingCommittee() {
  return (
    <CommitteeRoster
      type="ANTI_RAGGING"
      emptyLabel="The Anti-Ragging Committee roster will be published here shortly. In the meantime, please use the contact details above."
    />
  );
}
