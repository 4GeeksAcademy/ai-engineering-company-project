# Product Context — HealthCore

## Company

HealthCore is an outpatient healthcare network founded in **2011** in Austin, Texas by **Dr. Sandra Okonkwo**. It operates **12 clinics** (9 US: Texas, Florida, Georgia; 3 UK: London, Manchester), ~**200** staff, ~**$28M** annual revenue.

Brand promise: accessible, high-quality care — same-day bookings, extended hours, bilingual staff in US markets.

## Organisation (decision-makers)

| Area | Lead | Relevance |
|------|------|-----------|
| Clinical Operations | Dr. Marcus Reid | Clinic processes; fragmented EHRs |
| Patient Experience | Priya Nair | Booking, reminders; **~22% no-show** rate |
| Revenue Cycle | Tom Callahan | Claims; **~14% denial** rate (US) |
| Compliance | Claire Whitfield | HIPAA (US) / UK GDPR — all systems must respect |
| People & Workforce | Diane Foster | Hiring (~47 days), CME / licence tracking |
| Technology | James Osei | Legacy patchwork; HealthCore Digital |
| Executive | Dr. Okonkwo | Needs timely, unified operational answers |

## Pain points agents must respect

- No shared online booking; US phone vs UK desk.
- High no-shows with little proactive outreach.
- Billing denials cost significant revenue.
- CME / compliance tracked manually.
- Dual EHR and billing stacks; no shared data layer.
- Patient data is regulated — treat sample/demo data carefully; never invent production PHI flows without compliance review.

## Product surfaces in this repo

1. **Public website** (`uis/website`) — trust, services, US locations, contact, appointment enquiry.
2. **Backoffice** (`uis/backoffice`) — HealthCore Digital internal UI; operations analytics from Milestone 2 logic.
3. **Business logic** (`src/`) — shared TypeScript domain utilities (import only).

## Voice and tone

Clean, professional healthcare. Evidence-driven. Avoid gimmicky UI patterns. Accessibility matters (skip links, readable type, clear CTAs).
