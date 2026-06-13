export const EDUCATION_OPTIONS = [
  "Under Graduate (UG)",
  "Post Graduate (PG)",
  "Diploma",
  "PhD / Research",
  "Entrance Exam Preparation",
  "Other",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{10}$/;

export function cleanText(value) {
  return String(value || "").trim();
}

export function cleanEmail(value) {
  return cleanText(value).toLowerCase();
}

export function getAge(dob) {
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

export function maxDobForMinimumAge(minAge = 16) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge);
  return date.toISOString().split("T")[0];
}

export function validateName(name, label = "Full name") {
  const cleaned = cleanText(name);

  if (!cleaned) return `${label} is required`;
  if (cleaned.length < 3) return `${label} must be at least 3 characters`;
  if (!/^[a-zA-Z\s.'-]+$/.test(cleaned)) {
    return `${label} can only contain letters, spaces, apostrophes, dots, and hyphens`;
  }

  return "";
}

export function validateEmail(email) {
  if (!cleanEmail(email)) return "Email is required";
  if (!EMAIL_PATTERN.test(cleanEmail(email))) return "Invalid email format";
  return "";
}

export function validatePassword(password) {
  if (!password) return "Password is required";
  if (String(password).length < 6) {
    return "Password must be at least 6 characters";
  }
  return "";
}

export function validatePhone(phone) {
  if (!cleanText(phone)) return "Phone number is required";
  if (!PHONE_PATTERN.test(cleanText(phone))) {
    return "Phone number must be exactly 10 digits";
  }
  return "";
}

export function validateDob(dob) {
  if (!dob) return "Date of birth is required";

  const age = getAge(dob);
  if (age === null) return "Date of birth is invalid";
  if (age < 16) return "Age must be 16 or above";

  return "";
}

export function validateEducation(educationStatus) {
  if (!cleanText(educationStatus)) return "Education status is required";
  if (!EDUCATION_OPTIONS.includes(educationStatus)) {
    return "Education status is invalid";
  }
  return "";
}

export function validateAddress(address, label) {
  const cleaned = cleanText(address);

  if (!cleaned) return `${label} is required`;
  if (cleaned.length < 5) return `${label} must be at least 5 characters`;

  return "";
}

export function firstValidationError(validations) {
  return validations.find(Boolean) || "";
}
