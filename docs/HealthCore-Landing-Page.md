OVERVIEW:
You need to create a website for an out-patient healthcare company named HealthCore.  Healthcore founder/CEO is Dr. Sandra Okonkwo and she founded HealthCore in 2011 in Austin, Texas. This company has office sites in the U.S. in Texas, Florida, & Georiga, and in the U.K in London and Manchester. HealthCore offers appointments for primary care, specialist consultations, chronic disease management, and preventative health programs.  You need to make a clean, professional healthcare landing page for HealthCore.  It must be available in English and Spanish.  The landing page needs to include the services offered, locations, and and overview of ‘who we are’. Secondly, there needs to be an inquiry form patients can fill out to request an appointment.  

CONTEXT:
Implement language switching using either two separate HTML files (index.html / index.es.html and application.html / application.es.html) or a single page with a toggle that swaps content via data-lang attributes and JavaScript.
All labels, error messages, placeholder text, button labels, and success messages must be fully translated. Do not leave any user-facing text in English when the page is in Spanish mode.
The landing page must include:
•	Header
o	Logo or name "HealthCore"
o	Navigation: Home | Services | Locations | Contact
o	Language toggle: EN | ES
•	Hero Section
o	Headline: "Healthcare that fits your life"
o	Subheadline: "12 outpatient clinics across the US and UK offering same-day appointments, extended hours, and bilingual care — so you can get the attention you need, when you need it."
o	Call to action: Button "Request an appointment" linking to the enquiry form



•	Services (3 Columns)
o	Primary Care & Chronic Disease
	Same-day appointments with primary care physicians
	Ongoing management of diabetes, hypertension, and asthma
o	Specialist Consultations
	Cardiology, endocrinology, pulmonology, and women's health
	Referrals coordinated within the HealthCore network
o	Preventive Health & Wellbeing
	Screenings, vaccinations, and annual check-ups
	Mental health counselling and psychiatry referrals
•	Why HealthCore (2 Columns)
o	Same-day appointments at most locations
o	Extended hours — weekdays until 7pm or 8pm, Saturdays available
o	Bilingual staff in English and Spanish at US locations
o	12 clinics across Texas, Florida, Georgia, and the United Kingdom
Locations (US only — display as a table or card grid)
Clinic name	City	State	Phone	Hours
HealthCore Austin Central	Austin	TX	(512) 340-8800	Mon–Fri 7am–8pm · Sat 9am–3pm
HealthCore Austin North	Austin	TX	(512) 340-8810	Mon–Fri 8am–7pm
HealthCore San Antonio	San Antonio	TX	(210) 720-4400	Mon–Fri 8am–6pm · Sat 9am–1pm
HealthCore Miami	Miami	FL	(305) 510-7700	Mon–Fri 7am–8pm · Sat 9am–4pm
HealthCore Orlando	Orlando	FL	(407) 892-6600	Mon–Fri 8am–6pm
HealthCore Atlanta	Atlanta	GA	(404) 330-9900	Mon–Fri 8am–7pm
UK clinics serve a separate market and are not included in this public-facing website.
Contact
•	General enquiries: info@healthcore.com
•	Austin HQ: (512) 340-8800
•	Miami: (305) 510-7700
•	UK (London): +44 20 7946 0100
Footer
•	© 2025 HealthCore. All rights reserved.
•	LinkedIn | Facebook | Instagram

Patient enquiry form fields
The form (application.html) is a patient enquiry form — not a booking form. Its purpose is to collect enough structured information so the front desk can call the patient back and confirm an appointment. All field name attributes are specified below and must be used exactly as written.
Field	Type	name attribute	Validation	Required
First name	text	first_name	2–50 characters, letters only	Yes
Last name	text	last_name	2–50 characters, letters only	Yes
Date of birth	date	date_of_birth	Cannot be a future date · Patient cannot be older than 120 years	Yes
Email address	email	email	Valid email format	Yes
Phone number	tel	phone	Must start with country code (e.g., +1 305 555 0191 or +34 612 345 678)	Yes
Preferred language	select	preferred_language	Options: English · Spanish	Yes
Preferred clinic	select	preferred_clinic	Options must use the clinic names from the Locations table above	Yes
Preferred date	date	preferred_date	At least 1 business day from today · No more than 60 days ahead	Yes
Preferred time of day	select	preferred_time	Options: Morning (7am–12pm) · Afternoon (12pm–5pm) · Evening (5pm–8pm)	Yes
Service needed	select	service_type	Options: Primary Care · Chronic Disease Management · Specialist Consultation · Preventive Health · Women's Health · Paediatric Care · Mental Health	Yes
Is this your first visit to HealthCore?	radio	new_patient	Options: Yes · No	Yes
Do you have health insurance?	radio	has_insurance	Options: Yes · No	Yes
Insurance provider	text	insurance_provider	Required only if has_insurance = Yes · Max 100 characters	Conditional
Member ID	text	insurance_member_id	Required only if has_insurance = Yes · 6–20 alphanumeric characters	Conditional
Brief description of your health concern	textarea	health_concern	20–500 characters · Live character counter	Yes
I consent to HealthCore contacting me	checkbox	contact_consent	Must be checked to submit	Yes
 
Specific validations
1.	First name / Last name: Letters only (including accented characters: á, é, í, ó, ú, ñ, ü). No numbers or special characters.
2.	Date of birth: Cannot be a future date. Patient must be between 0 and 120 years old.
3.	Phone: Must start with + followed by a country code. Accept formats like +1 305 555 0191 or +34 612 345 678.
4.	Preferred date: At least 1 business day from today. No more than 60 days in the future.
5.	Service type + date of birth (Paediatric Care): If the patient selects "Paediatric Care", their date of birth must indicate they are under 18. If not, show a specific error.
6.	Preferred time + clinic hours: If the patient selects "Evening (5pm–8pm)", only clinics open past 5pm are valid. Display a warning if the combination is unlikely to be available (e.g., San Antonio closes at 6pm, Austin North at 7pm).
7.	Insurance fields: If has_insurance = Yes, both insurance_provider and insurance_member_id become required and must be validated.
8.	Returning patient: If new_patient = No, display an additional optional field: Patient ID (name="patient_id", format HC- followed by 6 alphanumeric characters, e.g., HC-A3F291).
9.	Health concern: Minimum 20 characters. Maximum 500. Show a live character counter.
10.	Consent checkbox: Must be checked to submit. If unchecked, the form does not submit.
 
Expected error messages
When a field does not pass validation, display these specific messages:
•	First name: "First name must contain only letters and be at least 2 characters"
•	Last name: "Last name must contain only letters and be at least 2 characters"
•	Date of birth: "Enter a valid date of birth. Patient must be between 0 and 120 years old"
•	Email: "Enter a valid email address (example: name@provider.com)"
•	Phone: "Phone must include a country code (example: +1 305 555 0191)"
•	Preferred language: "Select your preferred language"
•	Preferred clinic: "Select the clinic you would like to visit"
•	Preferred date: "Select a date at least 1 business day from today and no more than 60 days ahead"
•	Preferred time: "Select your preferred time of day"
•	Service type: "Select the type of care you are looking for"
•	Service type (Paediatric): "Paediatric Care is available for patients under 18. Please check the date of birth or select a different service."
•	New patient: "Please indicate whether this is your first visit to HealthCore"
•	Has insurance: "Please indicate whether you have health insurance"
•	Insurance provider: "Please enter your insurance provider name"
•	Member ID: "Member ID must be between 6 and 20 alphanumeric characters"
•	Health concern: "Please describe your health concern in at least 20 characters (X characters remaining)"
•	Consent: "You must consent to being contacted before submitting this form"
 
Success message
When the form validates correctly (simulate submission — do not send data anywhere), display:
Thank you for reaching out to HealthCore.
We have received your enquiry. A member of our front desk team will contact you within 1 business day to confirm your appointment details and answer any questions.
If you need urgent assistance, please call your preferred clinic directly using the numbers listed on our website.
We look forward to caring for you.
 
Specific restriction
The enquiry form is designed for patients seeking care — not for companies or healthcare providers looking to partner with HealthCore. The form must include a visible note that reads:
"Are you a healthcare provider or organisation looking to partner with HealthCore? Contact our operations team at partnerships@healthcore.com"
 
Required Schema.org markup
Implement the following Schema.org structured data on your landing page:
{
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "name": "HealthCore",
  "description": "Outpatient healthcare network offering primary care, specialist consultations, chronic disease management, and preventive health programmes.",
  "url": "https://www.healthcore.com",
  "foundingDate": "2011",
  "logo": "https://www.healthcore.com/logo.png",
  "availableLanguage": ["English", "Spanish"],
  "areaServed": ["US", "GB"],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Austin",
    "addressRegion": "Texas",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-512-340-8800",
    "contactType": "patient services",
    "availableLanguage": ["English", "Spanish"]
  },
  "sameAs": [
    "https://linkedin.com/company/healthcore",
    "https://facebook.com/healthcore",
    "https://instagram.com/healthcore"
  ]
}
Additionally, include a MedicalClinic entry for each US location listed in the Locations table, with name, telephone, openingHours, and parentOrganization referencing HealthCore.

