# Institutional Arbitration Management Platform — Product Requirements Document (V1)

## Context

The firm received a Request for Information from an external Arbitration Centre, asking for details across empanelment, panel composition, fees, facilities, rules, and case-administration processes. Rather than just responding to that RFI, leadership decided to use it as a checklist for standing up the firm's **own** institutional arbitration centre — the firm will act as the arbitration institution itself (administering real cases end-to-end, appointing arbitrators, running hearings), not merely referring disputes to outside centres.

The firm already owns bookable physical infrastructure — arbitration rooms, conference rooms, event spaces, meeting halls, and multiple floors — which becomes both an operational necessity (hearings need rooms) and a secondary revenue stream (external parties can rent the same spaces).

This document is the product spec for V1: what gets built, for whom, on what stack, with what data model, and what is deliberately deferred. It is the output of a structured brainstorming session and reflects decisions made and confirmed interactively — every major choice below was presented with alternatives and a recommendation, and confirmed or overridden by the stakeholder before being locked in.

**Intended outcome:** a buildable, internally consistent V1 spec that a development team (or Claude Code in a future session) can turn directly into an implementation plan and code, without re-litigating scope or architecture mid-build.

---

## Key Decisions Log (with rationale)

| Decision | Choice | Why |
|---|---|---|
| Platform identity | The firm **is** the arbitration centre (not a CRM for evaluating external centres) | Confirmed explicitly; changes everything downstream — this is a real case-administration system, not a research tool |
| User roles | Admin/Secretariat, Arbitrator, Party/Counsel, Public (all four, V1) | All four confirmed as required for a functioning institution — you can't run cases without arbitrators, filers, and staff |
| V1 module scope | Public Site/CMS, Empanelment & Panel, Case Management & Filing, Facility Booking | Confirmed as the full V1 set — fees/billing scoped down to manual (see below) rather than cut entirely |
| Payments | Fee schedule **display only**, manual admin reconciliation — no payment gateway in V1 | Avoids PCI/compliance scope in V1; fastest path to a working system |
| Facility booking access | **Fully open** — external third parties can request bookings, not just internal/case use | Confirmed as a deliberate revenue-generating capability, not just an internal tool |
| Case-linked booking approval | Manual admin approval, tagged `CASE_LINKED` + high-priority flag (not auto-approved) | Rooms have real capacity/AV/secretarial constraints; auto-approval risks double-booking against external rentals |
| Arbitrator appointment model | Admin manually assigns sole **or** 3-member tribunal (claimant nominee / respondent nominee / presiding) from the panel | Matches how institutions actually run appointments; no automated matching algorithm in V1 |
| Arbitrator availability | Informational-only (admin sees stated unavailable dates but nothing is hard-blocked) | Senior/retired-judge arbitrators won't maintain live calendars; hard-blocking would produce stale, false conflicts |
| Empanelment review pipeline | Multi-stage: `Applied → Document Verified → Interview Scheduled → Approved/Rejected` | Matches the real institutional review process, not a single approve/reject step |
| Notifications | Email via SMTP (firm's existing mail server) | Needed for status changes, confirmations, reminders; no cloud email service required |
| File storage | Base64-encoded file content in MySQL `LONGTEXT` columns, capped at 15MB/file | Matches the firm's existing production pattern; explicitly no cloud storage, no filesystem-path approach |
| Database | **MySQL 8** (not Postgres) | Firm's standing production choice — overrode initial Postgres recommendation |
| Hosting/infra | **No cloud, anywhere** — on-prem in both dev and production | Explicit, standing constraint, not a V1-only limitation |
| Auth | Auth.js (NextAuth), email/password, `role` field on `User` | Simple, well-documented, avoids building custom session/JWT handling |
| Frontend/backend | Next.js 16 (App Router, Turbopack default), React 19.2, TanStack Query + Table, one monolithic codebase | Confirmed current-stable via web search (Next.js 16, Oct 2025 GA, 16.2.7 as of June 2026); one deployable unit suits an on-prem, no-cloud, no-third-party-consumer setup |
| Local dev infra | Docker Compose: MySQL 8 + Adminer | Adminer is the MySQL-native equivalent of the originally-requested pgAdmin; one command spins up a working local environment matching production topology |
| RFI response documents | Dedicated `RFI_RESPONSE` resource category (not bundled under `OTHER`) | Stakeholder listed it as its own document type; needs to be separately filterable/labeled on `/resources`, not buried |
| Fast-Track vs. Emergency Arbitration | Split into two distinct mechanisms: `isFastTrack` (expedited procedure) and `isEmergency` + a pre-tribunal `EMERGENCY_ARBITRATOR` appointment role | These are institutionally different: Emergency Arbitration appoints an arbitrator for urgent interim relief *before* the full tribunal is even constituted. A single combined toggle couldn't represent that pre-tribunal appointment |

---

## Section 1: Architecture Overview

**System type:** Full-stack monolith. Next.js Route Handlers serve as the API layer — no separate backend service.

**Stack:**
- **Frontend:** Next.js 16 (App Router, Turbopack), React 19.2, Tailwind CSS, TanStack Query (data fetching/caching), TanStack Table (admin data grids)
- **Backend:** Next.js Route Handlers, Prisma ORM against MySQL
- **Database:** MySQL 8 (Docker locally, on-prem in production)
- **File storage:** Base64 content in MySQL `LONGTEXT` columns, 15MB/file hard cap enforced server-side
- **Auth:** Auth.js (NextAuth), credentials provider, session carries `role`
- **Email:** Nodemailer via SMTP (firm's mail server/relay)
- **Local dev infra:** `docker-compose.yml` — MySQL 8 + Adminer, no cloud dependency, mirrors production

**Four portals, one codebase, role-gated:**

| Portal | Access | Core purpose |
|---|---|---|
| Public site | Unauthenticated | Centre info, rules, model clause generator, fee schedule, resource downloads, empanelment application, dispute referral, facility browse/booking |
| Admin/Secretariat | `role: ADMIN` | Empanelment review, case administration, arbitrator appointment, booking approval, CMS |
| Arbitrator | `role: ARBITRATOR` | Case workspace, profile/availability, empanelment/renewal status |
| Party/Counsel | `role: PARTY` | Case filing, case tracking, case-linked room booking |

**API structure:**
- `/api/public/*` — no auth, rate-limited
- `/api/admin/*` — `role === ADMIN` only, enforced in `middleware.ts`
- `/api/cases/*`, `/api/bookings/*`, `/api/empanelment/*` — authenticated, **role-agnostic paths** with per-request ownership checks inside the handler (Party owns it / Arbitrator assigned to it / Admin always). Cases, documents, and timelines are shared resources viewed through different role lenses — path-based role namespacing would force duplicate handler logic for the same resource.

---

## Section 2: Modules, Views & Routes

### Public Site Module
| Route | View | Notes |
|---|---|---|
| `/` | Home | Links into Directory / Model Clause / Filing / Empanelment |
| `/about` | About & Services | Institutional background, facilities list — CMS-driven |
| `/arbitrators` | Directory of Arbitrators | Filter by specialization (Commercial/Banking/Loan Recovery/Infrastructure/Financial), search. Shows `APPROVED` panel members only |
| `/arbitrators/[slug]` | Public profile | Bio, expertise, external High Court profile link. No contact/fee data |
| `/model-clause` | Model Clause Generator | Select dispute type/seat/fast-track variant → live preview → copy to clipboard, no DB write |
| `/empanelment/apply` | Empanelment application | Multi-step: details → specialization → documents → submit |
| `/refer-dispute` | Dispute referral | Entity type (Bank/Law Firm/NBFC/Advocate), summary, contact |
| `/resources` | Download hub | CMS-driven: manuals, brochures, fee schedules, rules, RFI response documents |
| `/facilities` | Facility browse | Public list of bookable spaces with capacity/description/rate |
| `/facilities/book` | External booking request | Live availability, no login required, tagged `source: EXTERNAL_PUBLIC` |

### Admin/Secretariat Portal — `/admin/*`
| Route | View | Notes |
|---|---|---|
| `/admin` | Dashboard | Pending empanelment/referrals, today's bookings, upcoming hearings, fee status |
| `/admin/empanelment`, `/admin/empanelment/[id]` | Review pipeline | Stage transitions, document review, fee status (Registration/Renewal/Membership) |
| `/admin/panel` | Panel roster | Specialization tags, suspend/deactivate |
| `/admin/referrals` | Referral queue | Convert to case, or close |
| `/admin/cases`, `/admin/cases/[id]` | Case administration | Tribunal assignment, **Fast-Track toggle** (expedited procedure) and separate **Emergency Arbitration appointment** (pre-tribunal emergency arbitrator for urgent interim relief), status timeline, documents, linked bookings |
| `/admin/bookings`, `/admin/bookings/[id]` | Facility scheduler | Calendar + list, approve/reject, virtual meeting URL, secretarial assignment, conflict warning |
| `/admin/cms/content`, `/cms/resources`, `/cms/fees` | CMS | Public content blocks, resource library, fee schedule editor |

### Arbitrator Portal — `/arbitrator/*`
| Route | View |
|---|---|
| `/arbitrator` | Dashboard: assigned cases, upcoming hearings, renewal alert |
| `/arbitrator/profile` | Bio, specializations, High Court link, informational availability blocks |
| `/arbitrator/cases`, `/cases/[id]` | Case workspace: filings, timeline, upload Orders/Awards |
| `/arbitrator/empanelment-status` | Status, renewal due date, fee payment record (read-only) |

### Party/Counsel Portal — `/portal/*`
| Route | View |
|---|---|
| `/portal` | Filed cases + status |
| `/portal/cases/new` | Filing wizard: case details → referring entity type → counterparty → documents |
| `/portal/cases/[id]` | Timeline, hearing dates, orders, arbitrator names (no contact info) |
| `/portal/cases/[id]/booking` | Case-linked room/virtual hearing request → same approval queue, pre-linked to `case_id`, tagged high-priority |

---

## Section 3: Database Schema (Prisma / MySQL)

Deliberate deviations from a naive reading of the requirements, each solving a real gap:
- **`CaseArbitrator` join table** (not a single FK) — represents sole *or* 3-member tribunals with roles (`SOLE`, `PRESIDING`, `CLAIMANT_NOMINEE`, `RESPONDENT_NOMINEE`), plus a distinct `EMERGENCY_ARBITRATOR` role that can be appointed *before* the full tribunal exists — a case can carry an emergency-arbitrator row and a later sole/tribunal set simultaneously
- **`Facility` catalog + `facilityId` FK** (not a free-text room string) — single source of truth for the public `/facilities` page, capacity filters, and the scheduler
- **`FeeSchedule` (rate card) separated from `FeePayment` (ledger)** — auditability across case fees, registration, and annual renewals
- **`CaseStatusHistory`** — append-only audit trail for dispute tracking/legal auditing
- **`DisputeReferral`** — backs the public referral form and admin referral queue, converts into a `Case`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ── Enums ──────────────────────────────────────────────

enum Role { ADMIN ARBITRATOR PARTY }

enum Specialization { COMMERCIAL BANKING FINANCIAL INFRASTRUCTURE LOAN_RECOVERY OTHER }

enum EmpanelmentStatus { PENDING APPROVED EXPIRED SUSPENDED }

enum EmpanelmentStage { APPLIED DOCUMENT_VERIFIED INTERVIEW_SCHEDULED APPROVED REJECTED }

enum ReferringEntityType { BANK NBFC LAW_FIRM ADVOCATE INDIVIDUAL OTHER }

enum ReferralStatus { NEW UNDER_REVIEW CONVERTED CLOSED }

enum CaseStatus { DRAFT FILED UNDER_REVIEW ARBITRATOR_ASSIGNED IN_HEARING AWARD_PASSED CLOSED }

enum ArbitratorRole { SOLE PRESIDING CLAIMANT_NOMINEE RESPONDENT_NOMINEE EMERGENCY_ARBITRATOR }

enum CaseDocumentType { FILING EVIDENCE ORDER AWARD OTHER }

enum FacilityType { ARBITRATION_ROOM CONFERENCE_ROOM EVENT_SPACE MEETING_HALL FLOOR }

enum BookingType { PHYSICAL_ROOM VIRTUAL_HEARING HYBRID }

enum BookingSource { ADMIN CASE_LINKED EXTERNAL_PUBLIC }

enum BookingStatus { PENDING CONFIRMED CANCELLED REJECTED }

enum FeeCategory { ADMINISTRATIVE FILING ARBITRATOR ROOM_RENTAL REGISTRATION ANNUAL_RENEWAL MEMBERSHIP }

enum PaymentStatus { UNPAID PAID WAIVED }

enum ResourceCategory { MANUAL BROCHURE FEE_SCHEDULE RULES RFI_RESPONSE OTHER }

// ── User & Auth ────────────────────────────────────────

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  phone        String?
  role         Role
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  arbitratorProfile   ArbitratorProfile?
  casesFiled          Case[]              @relation("CasesFiledByParty")
  documentsUploaded   CaseDocument[]      @relation("DocumentUploadedBy")
  statusChangesMade   CaseStatusHistory[] @relation("StatusChangedBy")
  bookingsHandled     FacilityBooking[]   @relation("BookingRecordedBy")
  feePaymentsRecorded FeePayment[]        @relation("FeePaymentRecordedBy")
  resourcesUploaded   Resource[]          @relation("ResourceUploadedBy")
  contentEdited       ContentBlock[]      @relation("ContentUpdatedBy")

  @@index([role])
}

// ── Arbitrators & Panel ────────────────────────────────

model ArbitratorProfile {
  id                 String                  @id @default(cuid())
  userId             String                  @unique
  user               User                    @relation(fields: [userId], references: [id])
  slug               String                  @unique
  title              String?
  bio                String                  @db.Text
  externalProfileUrl String?
  isProminent        Boolean                 @default(false)
  photoBase64        String?                 @db.LongText
  empanelmentStatus  EmpanelmentStatus       @default(PENDING)
  renewalDueDate     DateTime?
  applicationId      String?                 @unique
  application        EmpanelmentApplication? @relation(fields: [applicationId], references: [id])
  createdAt          DateTime                @default(now())
  updatedAt          DateTime                @updatedAt

  specializations    ArbitratorSpecialization[]
  availabilityBlocks ArbitratorAvailability[]
  caseAssignments    CaseArbitrator[]
  feePayments        FeePayment[]

  @@index([empanelmentStatus])
}

model ArbitratorSpecialization {
  id             String            @id @default(cuid())
  arbitratorId   String
  arbitrator     ArbitratorProfile @relation(fields: [arbitratorId], references: [id], onDelete: Cascade)
  specialization Specialization

  @@unique([arbitratorId, specialization])
  @@index([specialization])
}

model ArbitratorAvailability {
  id           String            @id @default(cuid())
  arbitratorId String
  arbitrator   ArbitratorProfile @relation(fields: [arbitratorId], references: [id], onDelete: Cascade)
  startDate    DateTime
  endDate      DateTime
  note         String?
  createdAt    DateTime          @default(now())

  @@index([arbitratorId, startDate, endDate])
}

// ── Empanelment Applications ───────────────────────────

model EmpanelmentApplication {
  id                     String           @id @default(cuid())
  applicantName          String
  applicantEmail         String
  applicantPhone         String
  professionalBackground String           @db.Text
  proposedSpecializations Json
  stage                  EmpanelmentStage @default(APPLIED)
  interviewScheduledAt   DateTime?
  reviewerNotes          String?          @db.Text
  registrationFeePaid    Boolean          @default(false)
  registrationFeePaidAt  DateTime?
  createdAt              DateTime         @default(now())
  updatedAt              DateTime         @updatedAt

  documents        EmpanelmentDocument[]
  resultingProfile ArbitratorProfile?
  feePayments      FeePayment[]

  @@index([stage])
  @@index([applicantEmail])
}

model EmpanelmentDocument {
  id            String                 @id @default(cuid())
  applicationId String
  application   EmpanelmentApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  fileName      String
  mimeType      String
  contentBase64 String                 @db.LongText
  uploadedAt    DateTime               @default(now())

  @@index([applicationId])
}

// ── Dispute Referrals ──────────────────────────────────

model DisputeReferral {
  id              String              @id @default(cuid())
  referrerName    String
  referrerEmail   String
  referrerPhone   String?
  entityType      ReferringEntityType
  disputeSummary  String              @db.Text
  status          ReferralStatus      @default(NEW)
  convertedCaseId String?             @unique
  convertedCase   Case?               @relation(fields: [convertedCaseId], references: [id])
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@index([status])
}

// ── Cases ───────────────────────────────────────────────

model Case {
  id                  String              @id @default(cuid())
  caseNumber          String              @unique
  title               String
  description         String              @db.Text
  referringEntityType ReferringEntityType
  claimAmount         Decimal             @db.Decimal(14, 2)
  isFastTrack         Boolean             @default(false)
  isEmergency         Boolean             @default(false)
  status              CaseStatus          @default(DRAFT)
  partyId             String
  party               User                @relation("CasesFiledByParty", fields: [partyId], references: [id])
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  referral      DisputeReferral?
  documents     CaseDocument[]
  arbitrators   CaseArbitrator[]
  statusHistory CaseStatusHistory[]
  bookings      FacilityBooking[]
  feePayments   FeePayment[]

  @@index([status])
  @@index([referringEntityType])
  @@index([partyId])
}

model CaseArbitrator {
  id           String            @id @default(cuid())
  caseId       String
  case         Case              @relation(fields: [caseId], references: [id], onDelete: Cascade)
  arbitratorId String
  arbitrator   ArbitratorProfile @relation(fields: [arbitratorId], references: [id])
  role         ArbitratorRole
  appointedAt  DateTime          @default(now())

  @@unique([caseId, arbitratorId])
  @@index([arbitratorId])
}

model CaseStatusHistory {
  id              String     @id @default(cuid())
  caseId          String
  case            Case       @relation(fields: [caseId], references: [id], onDelete: Cascade)
  status          CaseStatus
  note            String?    @db.Text
  changedByUserId String?
  changedBy       User?      @relation("StatusChangedBy", fields: [changedByUserId], references: [id])
  changedAt       DateTime   @default(now())

  @@index([caseId, changedAt])
}

model CaseDocument {
  id               String           @id @default(cuid())
  caseId           String
  case             Case             @relation(fields: [caseId], references: [id], onDelete: Cascade)
  fileName         String
  mimeType         String
  contentBase64    String           @db.LongText
  documentType     CaseDocumentType
  uploadedByUserId String
  uploadedBy       User             @relation("DocumentUploadedBy", fields: [uploadedByUserId], references: [id])
  createdAt        DateTime         @default(now())

  @@index([caseId, documentType])
}

// ── Facility & Hearing Bookings ────────────────────────

model Facility {
  id             String       @id @default(cuid())
  name           String
  type           FacilityType
  floorLabel     String?
  capacity       Int?
  description    String?      @db.Text
  indicativeRate Decimal?     @db.Decimal(10, 2)
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  bookings FacilityBooking[]

  @@index([type, isActive])
}

model FacilityBooking {
  id                            String        @id @default(cuid())
  caseId                        String?
  case                          Case?         @relation(fields: [caseId], references: [id])
  facilityId                    String
  facility                      Facility      @relation(fields: [facilityId], references: [id])
  bookingType                   BookingType
  startTime                     DateTime
  endTime                       DateTime
  virtualMeetingUrl             String?
  secretarialAssistanceRequired Boolean       @default(false)
  assignedStaffName             String?
  source                        BookingSource
  isPriority                    Boolean       @default(false)
  status                        BookingStatus @default(PENDING)
  requesterName                 String
  requesterEmail                String
  requesterPhone                String?
  recordedByUserId              String?
  recordedBy                    User?         @relation("BookingRecordedBy", fields: [recordedByUserId], references: [id])
  createdAt                     DateTime      @default(now())
  updatedAt                     DateTime      @updatedAt

  @@index([facilityId, startTime, endTime])
  @@index([status])
  @@index([caseId])
}

// ── Fee & Commercial Structure ─────────────────────────

model FeeSchedule {
  id            String      @id @default(cuid())
  category      FeeCategory
  label         String
  amount        Decimal     @db.Decimal(10, 2)
  currency      String      @default("INR")
  tier          String?
  effectiveDate DateTime
  isActive      Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  feePayments FeePayment[]

  @@index([category, isActive])
}

// Exactly one of caseId / empanelmentApplicationId / arbitratorProfileId is set,
// enforced at the application layer via Zod .refine() — MySQL/Prisma has no
// multi-column XOR constraint.
model FeePayment {
  id                       String                  @id @default(cuid())
  feeScheduleId            String?
  feeSchedule              FeeSchedule?            @relation(fields: [feeScheduleId], references: [id])
  caseId                   String?
  case                     Case?                   @relation(fields: [caseId], references: [id])
  empanelmentApplicationId String?
  empanelmentApplication   EmpanelmentApplication? @relation(fields: [empanelmentApplicationId], references: [id])
  arbitratorProfileId      String?
  arbitratorProfile        ArbitratorProfile?      @relation(fields: [arbitratorProfileId], references: [id])
  amount                   Decimal                 @db.Decimal(10, 2)
  currency                 String                  @default("INR")
  status                   PaymentStatus           @default(UNPAID)
  paidAt                   DateTime?
  recordedByUserId         String?
  recordedBy               User?                   @relation("FeePaymentRecordedBy", fields: [recordedByUserId], references: [id])
  notes                    String?                 @db.Text
  createdAt                DateTime                @default(now())
  updatedAt                DateTime                @updatedAt

  @@index([status])
  @@index([caseId])
  @@index([empanelmentApplicationId])
  @@index([arbitratorProfileId])
}

// ── CMS ─────────────────────────────────────────────────

model ContentBlock {
  id              String   @id @default(cuid())
  key             String   @unique
  title           String?
  body            String   @db.Text
  updatedByUserId String?
  updatedBy       User?    @relation("ContentUpdatedBy", fields: [updatedByUserId], references: [id])
  updatedAt       DateTime @updatedAt
  createdAt       DateTime @default(now())
}

model Resource {
  id               String           @id @default(cuid())
  title            String
  category         ResourceCategory
  fileName         String
  mimeType         String
  contentBase64    String           @db.LongText
  isPublished      Boolean          @default(true)
  uploadedByUserId String?
  uploadedBy       User?            @relation("ResourceUploadedBy", fields: [uploadedByUserId], references: [id])
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  @@index([category, isPublished])
}

model ModelClauseTemplate {
  id                 String   @id @default(cuid())
  disputeType        String
  seat               String
  language           String   @default("English")
  isFastTrackVariant Boolean  @default(false)
  clauseText         String   @db.Text
  isActive           Boolean  @default(true)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([disputeType, isFastTrackVariant, isActive])
}
```

**Implementation notes to carry forward:**
- 15MB/file cap on all Base64 fields, enforced server-side (Zod + explicit `Buffer.byteLength` check, not just client-side)
- Case number format: `ARB/{YYYY}/{4-digit sequence}`, generated inside the DB transaction at filing/conversion time
- `FeePayment`'s "exactly one FK" rule enforced via Zod `.refine()`, not a DB constraint

---

## Section 4: API Routes & State Machines

### Public Intake — `/api/public/*` (no auth, rate-limited)
- **`POST /api/public/empanelment`** — creates `EmpanelmentApplication` + `EmpanelmentDocument[]` in a transaction (`stage: APPLIED`), sends confirmation email. Rate-limited (e.g. 5/hr/IP).
- **`POST /api/public/disputes/referral`** — creates `DisputeReferral` (`status: NEW`), emails Admin distribution list, auto-ack to referrer.
- **`GET /api/public/arbitrators`** — filters: `sector` (Specialization[]), `judgeStatus` (maps to `isProminent`), `q`, pagination. Hard-filtered to `empanelmentStatus: APPROVED` regardless of query params. Never returns email/phone.

### Admin Management — `/api/admin/*` (`role === ADMIN`)
- **`PATCH /api/admin/empanelment/[id]`** — stage transitions enforced server-side against an explicit allow-list (`APPLIED→{DOCUMENT_VERIFIED,REJECTED}`, `DOCUMENT_VERIFIED→{INTERVIEW_SCHEDULED,REJECTED}`, `INTERVIEW_SCHEDULED→{APPROVED,REJECTED}`). On `APPROVED`: transaction creates `User(role: ARBITRATOR)` + `ArbitratorProfile`, emails account-setup link. Every transition emails the applicant.
- **`POST /api/admin/cases/[id]/assign-arbitrator`** — Zod `.refine()` enforces the submitted role set is exactly one of: (a) one `EMERGENCY_ARBITRATOR` — allowed any time `case.isEmergency === true`, independent of tribunal status, does **not** change `case.status`; (b) one `SOLE`; or (c) one each of `PRESIDING`/`CLAIMANT_NOMINEE`/`RESPONDENT_NOMINEE`. Options (b)/(c) require `case.status === UNDER_REVIEW` and set `status: ARBITRATOR_ASSIGNED`. Creates `CaseArbitrator` rows, appends `CaseStatusHistory`, emails assigned arbitrator(s) — one transaction. A case can carry both an emergency-arbitrator appointment and a later full tribunal.
- **`PATCH /api/admin/bookings/[id]`** — on `CONFIRMED`: conflict check against other `CONFIRMED` bookings on the same `facilityId` with overlapping time range (409 if conflict); `virtualMeetingUrl` required via `.refine()` if booking type isn't pure physical.

### Case Management & Documents — `/api/cases/*` (authenticated, ownership-checked per request)
- **`POST /api/cases/[id]/documents`** — Party (owner) or assigned Arbitrator or Admin. Document-type gated by role server-side: Party → `FILING`/`EVIDENCE` only, Arbitrator → `ORDER`/`AWARD` only (403 otherwise, not just hidden in UI). `AWARD` upload auto-transitions `case.status → AWARD_PASSED` in the same transaction. Response never echoes `contentBase64` back.
- **`GET /api/cases/[id]/timeline`** — same ownership check; returns `statusHistory[]` + `upcomingHearings[]` (confirmed bookings) as separate arrays.

### Conventions
- Zod schemas in `lib/validations/*`, shared between route handlers and client forms
- Multi-table writes wrapped in `prisma.$transaction(...)`; email dispatch happens **after** commit, never inside the transaction
- Ownership-check failures on shared resource routes return `404`, not `403` (prevents case-ID enumeration)

---

## Section 5: Folder Structure

```
arbitration-platform/
├── docker-compose.yml              # MySQL 8 + Adminer
├── .env.example
├── next.config.ts
├── middleware.ts                   # role gate for /admin/*, /arbitrator/*, /portal/*
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                     # bootstrap ADMIN user, Facility catalog, initial FeeSchedule
├── src/
│   ├── app/
│   │   ├── (public)/                # home, about, arbitrators, model-clause, empanelment/apply,
│   │   │   └── ...                  # refer-dispute, resources, facilities(+book)
│   │   ├── (auth)/login/
│   │   ├── admin/                   # dashboard, empanelment, panel, referrals, cases, bookings, cms/*
│   │   ├── arbitrator/              # dashboard, profile, cases, empanelment-status
│   │   ├── portal/                  # dashboard, cases/new, cases/[id](+booking)
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── public/{empanelment,disputes/referral,arbitrators}/
│   │       ├── admin/{empanelment/[id],cases/[id]/assign-arbitrator,bookings/[id]}/
│   │       ├── cases/[id]/{documents,timeline}/
│   │       └── bookings/
│   ├── components/{ui,public,admin,arbitrator,portal}/
│   ├── lib/
│   │   ├── auth.ts prisma.ts mailer.ts file.ts case-number.ts
│   │   ├── validations/{empanelment,referral,case,booking,document}.ts
│   │   └── server/services/{empanelment,case,booking}-service.ts
│   ├── hooks/                       # TanStack Query hooks
│   └── types/
└── docs/                            # this PRD lives here once implementation starts
```

**Bootstrap note:** `prisma/seed.ts` must create the first `ADMIN` user (from `.env` credentials) — there is no self-registration path for Admin, so without a seeded account nobody can log in to approve the first empanelment application or confirm the first booking.

---

## Section 6: Phase 2/3 Roadmap (explicitly deferred)

| Item | Deferred because |
|---|---|
| Online payment gateway (Razorpay/Stripe) | V1: display + manual reconciliation |
| ICS/iCal sync + hard-blocking arbitrator availability | V1: informational-only by design |
| Native Teams/Zoom link generation via API | V1: admin pastes a manually-created link |
| Arbitrator challenge/recusal & replacement workflow | V1's tribunal assignment is create-once; real institutions need a formal challenge→replace flow with its own audit trail |
| Full Staff/secretarial entity (shift scheduling, workload) | V1: free-text `assignedStaffName` |
| Analytics/reporting dashboards | No requirement surfaced yet; needs its own scoping pass |
| In-app notification center | V1: email-only |
| Bulk import/migration tooling | Only relevant if migrating from an existing system — unconfirmed |
| Public third-party API / mobile app | No consumer identified; monolith doesn't block this later |
| Deadline/SLA automation for Fast-Track cases | Depends on Fast-Track institutional rules being formally defined first |

**Standing constraint, not a roadmap item:** no cloud storage or cloud hosting, in any phase, per explicit firm policy.

---

## Verification Plan (once implementation starts)

This PRD is the input to an implementation plan, not code — verification here means confirming the spec is buildable and internally consistent, and defining how the eventual build gets tested end-to-end:

1. **Local environment stands up clean:** `docker compose up` brings up MySQL 8 + Adminer with no cloud dependency; `npx prisma migrate dev` applies the schema above without errors; `npx prisma db seed` creates the bootstrap Admin user, Facility catalog, and initial FeeSchedule rows.
2. **Golden-path walkthrough per role**, once built: Admin logs in with the seeded account → approves a seeded/test empanelment application (walking all four stages) → Party (self-registered) files a case → Admin assigns a 3-member tribunal from the newly-approved arbitrator → Party requests a case-linked room booking → Admin confirms it with a virtual meeting URL and checks the conflict-detection path by attempting a second overlapping booking (expect 409) → Arbitrator uploads an Award document and confirms `case.status` auto-transitions to `AWARD_PASSED`.
3. **Boundary checks:** a Party attempting to fetch another party's case via `/api/cases/[id]/timeline` gets `404`; a Party attempting to upload a `documentType: AWARD` gets `403`; a file upload over 15MB is rejected server-side even if the client-side check is bypassed.
4. **Public-site checks:** `/arbitrators` never returns non-`APPROVED` profiles regardless of filter params; `/facilities/book` accepts an unauthenticated booking request and it appears in `/admin/bookings` tagged `EXTERNAL_PUBLIC`.

No code has been written yet — this document is the frozen spec. The next step is to turn this into a step-by-step implementation plan (migration order, first-buildable-slice sequencing, etc.) before any code is generated.
