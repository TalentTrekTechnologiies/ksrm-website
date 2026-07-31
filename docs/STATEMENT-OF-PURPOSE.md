# Statement of Purpose

## K.S.R.M. College of Engineering — Website & Content Management System

**Prepared by:** Talent Trek Technologies
**Client:** K.S.R.M. College of Engineering, Kadapa, Andhra Pradesh
**Document type:** Project Statement of Purpose

---

## 1. Purpose

This project delivers a new public website and an accompanying Content
Management System (CMS) for K.S.R.M. College of Engineering, replacing the
institution's earlier website.

Its central purpose is to move the college from a website that could only be
changed by a developer to one the college's own staff can maintain — so that
information reaching students, parents, applicants and accrediting bodies stays
accurate and current.

---

## 2. Background and need

The previous website was a set of individually authored pages. Every change —
a revised fee, a new syllabus, an examination notice, a staff appointment —
required editing the site's source and re-publishing it.

That created four recurring problems:

1. **Information went stale.** Routine updates waited on external availability,
   so published details drifted out of date.
2. **Time-critical notices were delayed.** Examination results and hall tickets
   need to be published the day they are issued, not the week after.
3. **No ownership.** Departments could not maintain their own pages, so accuracy
   depended on someone outside the department.
4. **No record of changes.** There was no reliable way to establish what was
   changed, when, or by whom.

For an institution assessed by NAAC, NBA and AICTE — where published information
is part of the evidence — these are material weaknesses, not conveniences.

---

## 3. Objectives

1. **Enable college staff to manage the website directly**, without technical
   skills and without developer involvement for routine content.
2. **Publish time-sensitive information immediately** — examination
   notifications, results, announcements and events.
3. **Give each department ownership of its own pages**, restricted so that a
   department can edit only its own content.
4. **Maintain a complete record of changes** — who changed what, and when.
5. **Present the institution credibly online** on phones as well as computers,
   and be discoverable through search engines.
6. **Preserve the institution's existing web presence** so that established
   search rankings and links to the old site continue to work.

---

## 4. Scope

### 4.1 Public website

A complete institutional website covering the college's academic and
administrative information: departments, academics, admissions, examinations,
placements, research, campus life, quality cells (IQAC, NAAC, IIC, EDC),
alumni, careers, events, news and contact information.

### 4.2 Content Management System

An administrative interface through which authorised staff manage that content,
covering:

- Homepage sections, department pages, faculty and leadership records
- Photo and video galleries; documents and downloadable forms
- News, events, announcements and the site-wide notice ticker
- Examination notifications, grouped by academic year
- Placement records, recruiters, research output and committees
- A central Media Library for all files
- Editable page tables — fee structures, courses and intake
- Site-wide settings, including a homepage announcement poster

### 4.3 Access control and accountability

- Individual staff accounts with role-based permissions
- Department-scoped access, enforced by the system rather than by convention
- An audit log recording every change with its author and timestamp

### 4.4 Search visibility

Search-engine metadata, a sitemap, structured data identifying the institution,
and redirects mapping the previous website's addresses to their new equivalents,
so existing rankings and inbound links are preserved.

---

## 5. Intended users

| Group | How they use it |
|---|---|
| **Prospective students and parents** | Programmes, admissions, fees, placements, facilities |
| **Current students** | Examination notices, results, syllabus, forms |
| **Department staff** | Maintain their own department's pages |
| **Administrative offices** | Publish notices, events, careers, institutional documents |
| **Accreditation bodies** | Published institutional documents and disclosures |
| **Alumni and recruiters** | Institutional information and points of contact |

---

## 6. Intended outcomes

**For the institution**
- Published information stays current, because updating it no longer depends on
  external availability
- Time-critical notices reach students the day they are issued
- A verifiable record of what was published and when
- Continuity of the college's established web presence

**For staff**
- Content can be updated by the people who own it
- Common tasks require no technical knowledge
- Mistakes are recoverable: deleted items can be restored, and every change is
  attributable

**For visitors**
- Accurate, current information
- A site that works properly on a phone
- Faster access to documents and notices

---

## 7. Approach

The system separates the public website from the content that fills it. The
website presents information; the CMS holds it. Staff change the content, and
the website reflects it — no rebuild, no developer.

Content is stored once and reused wherever it appears. A document added to a
department is shown on that department's page and on the relevant college-wide
page automatically, so the same file is never maintained in two places.

Safeguards are built in rather than added by policy: deletions are reversible,
every change is recorded with its author, and permissions are enforced by the
system.

---

## 8. Deliverables

1. Public website
2. Content Management System
3. Deployment on the college's server infrastructure, with the database and
   uploaded files migrated
4. **User Guide** — module-by-module instructions for staff (`USER-GUIDE.md`)
5. **Standard Operating Procedures** — maintenance, backup and recovery
   procedures for the technical team (`SOP.md`)
6. **Deployment documentation** — server setup and configuration
   (`deploy/VPS-DEPLOYMENT.md`)
7. Complete source code, delivered to the college's repository

---

## 9. Conclusion

The purpose of this project is not simply a redesigned website. It is to put the
college in control of its own published information — so that accuracy depends
on the staff who own the information, rather than on external technical support,
and so that every change is recorded and reversible.
