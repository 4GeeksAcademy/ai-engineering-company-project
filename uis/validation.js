document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('patient-enquiry-form');
  if (!form) return;

  const successDiv = document.getElementById('form-success-message');
  const healthConcern = document.getElementById('health_concern');
  const healthConcernCounter = document.getElementById('health_concern_counter');
  const newPatientRadios = document.getElementsByName('new_patient');
  const insuranceRadios = document.getElementsByName('has_insurance');
  const patientIdField = document.getElementById('patient-id-field');
  const insuranceFields = document.getElementById('insurance-fields');
  const warningEvening = document.getElementById('warning-evening-availability');

  const messages = {
    first_name: 'First name must contain only letters and be at least 2 characters',
    last_name: 'Last name must contain only letters and be at least 2 characters',
    date_of_birth: 'Enter a valid date of birth. Patient must be between 0 and 120 years old',
    email: 'Enter a valid email address (example: name@provider.com)',
    phone: 'Phone must include a country code (example: +1 305 555 0191)',
    preferred_language: 'Select your preferred language',
    preferred_clinic: 'Select the clinic you would like to visit',
    preferred_date: 'Select a date at least 1 business day from today and no more than 60 days ahead',
    preferred_time: 'Select your preferred time of day',
    service_type: 'Select the type of care you are looking for',
    service_type_ped: 'Paediatric Care is available for patients under 18. Please check the date of birth or select a different service.',
    new_patient: 'Please indicate whether this is your first visit to HealthCore',
    has_insurance: 'Please indicate whether you have health insurance',
    insurance_provider: 'Please enter your insurance provider name',
    insurance_member_id: 'Member ID must be between 6 and 20 alphanumeric characters',
    consent: 'You must consent to being contacted before submitting this form',
    success: 'Thank you for reaching out to HealthCore.\nWe have received your enquiry. A member of our front desk team will contact you within 1 business day to confirm your appointment details and answer any questions.\nIf you need urgent assistance, please call your preferred clinic directly using the numbers listed on our website.\nWe look forward to caring for you.'
  };

  const clinicEveningCloseHour = {
    'HealthCore Austin Central': 20,
    'HealthCore Austin North': 19,
    'HealthCore San Antonio': 18,
    'HealthCore Miami': 20,
    'HealthCore Orlando': 18,
    'HealthCore Atlanta': 19
  };

  function showError(field, message) {
    const el = document.getElementById(`error-${field}`);
    if (el) {
      el.textContent = message;
      el.setAttribute('aria-live', 'polite');
    }
  }

  function clearError(field) {
    const el = document.getElementById(`error-${field}`);
    if (el) el.textContent = '';
  }

  function addBusinessDays(startDate, days) {
    const result = new Date(startDate);
    let remaining = days;
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      const d = result.getDay();
      if (d !== 0 && d !== 6) remaining -= 1;
    }
    return result;
  }

  function updateEveningWarning() {
    const preferredTime = form.elements.preferred_time.value;
    const clinic = form.elements.preferred_clinic.value;
    const closeHour = clinicEveningCloseHour[clinic];
    const show = preferredTime === 'Evening' && closeHour && closeHour < 20;
    if (warningEvening) warningEvening.classList.toggle('hidden', !show);
  }

  function updateConditionalFields() {
    const newPatientIsNo = Array.from(newPatientRadios).some((r) => r.checked && r.value === 'No');
    if (patientIdField) patientIdField.classList.toggle('hidden', !newPatientIsNo);

    const hasInsuranceYes = Array.from(insuranceRadios).some((r) => r.checked && r.value === 'Yes');
    if (insuranceFields) insuranceFields.classList.toggle('hidden', !hasInsuranceYes);
  }

  function validateField(field) {
    const input = form.elements[field];
    const value = input && typeof input.value === 'string' ? input.value.trim() : '';

    switch (field) {
      case 'first_name':
        if (!/^[A-Za-zÁÉÍÓÚÑÜáéíóúñü ]{2,50}$/.test(value)) {
          showError(field, messages.first_name);
          return false;
        }
        break;

      case 'last_name':
        if (!/^[A-Za-zÁÉÍÓÚÑÜáéíóúñü ]{2,50}$/.test(value)) {
          showError(field, messages.last_name);
          return false;
        }
        break;

      case 'date_of_birth': {
        if (!value) {
          showError(field, messages.date_of_birth);
          return false;
        }
        const dob = new Date(value);
        const today = new Date();
        if (dob > today) {
          showError(field, messages.date_of_birth);
          return false;
        }
        let age = today.getFullYear() - dob.getFullYear();
        const birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (today < birthdayThisYear) age -= 1;
        if (age < 0 || age > 120) {
          showError(field, messages.date_of_birth);
          return false;
        }
        break;
      }

      case 'email':
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          showError(field, messages.email);
          return false;
        }
        break;

      case 'phone':
        if (!/^\+\d[\d\s\-()]{7,}$/.test(value)) {
          showError(field, messages.phone);
          return false;
        }
        break;

      case 'preferred_language':
        if (!value) {
          showError(field, messages.preferred_language);
          return false;
        }
        break;

      case 'preferred_clinic':
        if (!value) {
          showError(field, messages.preferred_clinic);
          return false;
        }
        break;

      case 'preferred_date': {
        if (!value) {
          showError(field, messages.preferred_date);
          return false;
        }
        const selected = new Date(value);
        selected.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDate = addBusinessDays(today, 1);
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 60);

        if (selected < minDate || selected > maxDate) {
          showError(field, messages.preferred_date);
          return false;
        }
        break;
      }

      case 'preferred_time':
        if (!value) {
          showError(field, messages.preferred_time);
          return false;
        }
        break;

      case 'service_type':
        if (!value) {
          showError(field, messages.service_type);
          return false;
        }
        if (value === 'Paediatric Care') {
          const dobVal = form.elements.date_of_birth.value;
          if (dobVal) {
            const dob = new Date(dobVal);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            if (today < birthdayThisYear) age -= 1;
            if (age >= 18) {
              showError(field, messages.service_type_ped);
              return false;
            }
          }
        }
        break;

      case 'new_patient': {
        const checked = Array.from(newPatientRadios).some((r) => r.checked);
        if (!checked) {
          showError(field, messages.new_patient);
          return false;
        }
        break;
      }

      case 'has_insurance': {
        const checked = Array.from(insuranceRadios).some((r) => r.checked);
        if (!checked) {
          showError(field, messages.has_insurance);
          return false;
        }
        break;
      }

      case 'insurance_provider': {
        const hasInsurance = Array.from(insuranceRadios).some((r) => r.checked && r.value === 'Yes');
        if (hasInsurance && !value) {
          showError(field, messages.insurance_provider);
          return false;
        }
        break;
      }

      case 'insurance_member_id': {
        const hasInsurance = Array.from(insuranceRadios).some((r) => r.checked && r.value === 'Yes');
        if (hasInsurance && !/^[A-Za-z0-9]{6,20}$/.test(value)) {
          showError(field, messages.insurance_member_id);
          return false;
        }
        break;
      }

      case 'patient_id': {
        const returning = Array.from(newPatientRadios).some((r) => r.checked && r.value === 'No');
        if (returning && value && !/^HC\-[A-Za-z0-9]{6}$/.test(value)) {
          showError(field, 'Format: HC- followed by 6 alphanumeric characters');
          return false;
        }
        break;
      }

      case 'health_concern': {
        if (value.length < 20) {
          showError(field, `Please describe your health concern in at least 20 characters (${20 - value.length} characters remaining)`);
          return false;
        }
        break;
      }

      case 'contact_consent':
        if (!form.elements.contact_consent.checked) {
          showError(field, messages.consent);
          return false;
        }
        break;

      default:
        break;
    }

    clearError(field);
    return true;
  }

  function validateForm() {
    let valid = true;
    const baseFields = [
      'first_name',
      'last_name',
      'date_of_birth',
      'email',
      'phone',
      'preferred_language',
      'preferred_clinic',
      'preferred_date',
      'preferred_time',
      'service_type',
      'new_patient',
      'has_insurance',
      'health_concern',
      'contact_consent'
    ];

    baseFields.forEach((field) => {
      if (!validateField(field)) valid = false;
    });

    const hasInsurance = Array.from(insuranceRadios).some((r) => r.checked && r.value === 'Yes');
    if (hasInsurance) {
      if (!validateField('insurance_provider')) valid = false;
      if (!validateField('insurance_member_id')) valid = false;
    }

    const returning = Array.from(newPatientRadios).some((r) => r.checked && r.value === 'No');
    if (returning) {
      if (!validateField('patient_id')) valid = false;
    }

    return valid;
  }

  function resetFormState() {
    document.querySelectorAll('.text-red-600').forEach((el) => {
      if (el.id && el.id.startsWith('error-')) el.textContent = '';
    });
    if (successDiv) {
      successDiv.classList.add('hidden');
      successDiv.textContent = '';
    }
    if (healthConcernCounter) healthConcernCounter.textContent = '0/500';
    if (warningEvening) warningEvening.classList.add('hidden');
    if (patientIdField) patientIdField.classList.add('hidden');
    if (insuranceFields) insuranceFields.classList.add('hidden');
  }

  healthConcern?.addEventListener('input', () => {
    const len = healthConcern.value.length;
    if (healthConcernCounter) healthConcernCounter.textContent = `${len}/500`;
    validateField('health_concern');
  });

  ['first_name', 'last_name', 'email', 'phone'].forEach((field) => {
    form.elements[field]?.addEventListener('input', () => validateField(field));
  });

  [
    'first_name',
    'last_name',
    'date_of_birth',
    'email',
    'phone',
    'preferred_language',
    'preferred_clinic',
    'preferred_date',
    'preferred_time',
    'service_type',
    'insurance_provider',
    'insurance_member_id',
    'patient_id'
  ].forEach((field) => {
    form.elements[field]?.addEventListener('blur', () => validateField(field));
  });

  Array.from(newPatientRadios).forEach((radio) => {
    radio.addEventListener('change', () => {
      updateConditionalFields();
      validateField('new_patient');
    });
  });

  Array.from(insuranceRadios).forEach((radio) => {
    radio.addEventListener('change', () => {
      updateConditionalFields();
      validateField('has_insurance');
    });
  });

  form.elements.preferred_time?.addEventListener('change', () => {
    validateField('preferred_time');
    updateEveningWarning();
  });

  form.elements.preferred_clinic?.addEventListener('change', () => {
    validateField('preferred_clinic');
    updateEveningWarning();
  });

  form.elements.service_type?.addEventListener('change', () => validateField('service_type'));
  form.elements.date_of_birth?.addEventListener('change', () => {
    validateField('date_of_birth');
    validateField('service_type');
  });
  form.elements.contact_consent?.addEventListener('change', () => validateField('contact_consent'));

  form.addEventListener('reset', () => {
    setTimeout(() => {
      resetFormState();
    }, 0);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateForm()) {
      if (successDiv) {
        successDiv.textContent = messages.success;
        successDiv.classList.remove('hidden');
      }
      form.reset();
      resetFormState();
      if (successDiv) {
        successDiv.textContent = messages.success;
        successDiv.classList.remove('hidden');
      }
    } else {
      const firstError = document.querySelector('[id^="error-"]:not(:empty)');
      if (firstError) {
        const field = firstError.id.replace('error-', '');
        const target = document.getElementById(field) || form.querySelector(`[name="${field}"]`);
        target?.focus();
      }
    }
  });

  updateConditionalFields();
  updateEveningWarning();
});
