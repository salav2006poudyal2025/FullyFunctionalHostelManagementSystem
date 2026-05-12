// routes/validation.js
// This file contains all our validation rules.
// Each function checks one rule and returns an error message if invalid.

// ─── Helper: check if a value is empty ───────────────────────────────────────
function isEmpty(value) {
  return !value || value.trim() === "";
}

// ─── Main validation function ─────────────────────────────────────────────────
// It receives the form data and returns an object of errors.
// If errors is empty {}, all fields are valid.

function validateBookingForm(data) {
  const errors = {};

  // 1. Full Name — required
  if (isEmpty(data.fullName)) {
    errors.fullName = "Full name is required.";
  }

  // 2. Email — required + valid format
  if (isEmpty(data.email)) {
    errors.email = "The field is required.";
  } else {
    // A simple email format check using a Regular Expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = "Please enter a valid email address.";
    }
  }

  // 3. Phone — required, numeric, at least 10 digits
  if (isEmpty(data.phone)) {
    errors.phone = "The field is required.";
  } else {
    // Remove spaces/dashes so "98 0000 0000" is accepted
    const digitsOnly = data.phone.replace(/[\s\-]/g, "");

    if (!/^\d+$/.test(digitsOnly)) {
      errors.phone = "Phone number must contain only digits.";
    } else if (digitsOnly.length < 10) {
      errors.phone = "Phone number must be at least 10 digits.";
    }
  }

  // 4. Room — required (the dropdown value must not be empty)
  if (isEmpty(data.roomNumber)) {
    errors.roomNumber = "The field is required.";
  }

  // 5. Check-in date — required
  if (isEmpty(data.checkIn)) {
    errors.checkIn = "The field is required.";
  }

  return errors; // {} means no errors = all valid
}

export { validateBookingForm };
