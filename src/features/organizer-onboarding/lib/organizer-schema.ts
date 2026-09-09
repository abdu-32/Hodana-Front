export interface OrganizerOnboardingData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  workEmail: string;
  countryCode: string;
  phoneNumber: string;
  companyName: string;
  companyWebsite: string;
  teamSize: "1-10" | "11-50" | "51-200" | "201-1000" | "1000+" | "";
  logoUrl?: string;
  planningType: "Hackathon" | "Conference" | "Workshop" | "Hiring Challenge" | "Other" | "";
  targetTimeline: "< 1 month" | "1-3 months" | "3-6 months" | "Flexible" | "";
  estimatedParticipants: "< 100" | "100-500" | "500-2000" | "2000+" | "";
  aboutEventGoals: string;
}

export type FormErrors = Partial<Record<keyof OrganizerOnboardingData | "logoFile", string>>;

// Common public consumer email domains to reject for work email validation
const DISALLOWED_FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "gmx.com",
  "zoho.com",
  "yandex.com",
]);

export function validateWorkEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return "Please complete this required field.";
  }
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return "Please enter a valid email address.";
  }
  const domain = clean.split("@")[1];
  if (domain && DISALLOWED_FREE_EMAIL_DOMAINS.has(domain)) {
    return "Please use a valid work/business email address. Free consumer domains (Gmail, Yahoo, Hotmail, etc.) are not accepted.";
  }
  return null;
}

export function validateWebsiteUrl(url: string): string | null {
  if (!url || !url.trim()) {
    return "Please complete this required field.";
  }
  let target = url.trim();
  if (!/^https?:\/\//i.test(target)) {
    target = "https://" + target;
  }
  try {
    const parsed = new URL(target);
    if (!parsed.hostname.includes(".")) {
      return "Please enter a valid company website URL (e.g. https://example.com).";
    }
    return null;
  } catch {
    return "Please enter a valid company website URL (e.g. https://example.com).";
  }
}

export function validateOrganizerOnboardingForm(
  data: OrganizerOnboardingData,
  logoFile?: File | null
): FormErrors {
  const errors: FormErrors = {};

  // 1. Contact Details
  if (!data.firstName || !data.firstName.trim()) {
    errors.firstName = "Please complete this required field.";
  }
  if (!data.lastName || !data.lastName.trim()) {
    errors.lastName = "Please complete this required field.";
  }
  if (!data.jobTitle || !data.jobTitle.trim()) {
    errors.jobTitle = "Please complete this required field.";
  }
  
  const emailErr = validateWorkEmail(data.workEmail);
  if (emailErr) {
    errors.workEmail = emailErr;
  }

  if (!data.phoneNumber || !data.phoneNumber.trim()) {
    errors.phoneNumber = "Please complete this required field.";
  } else if (data.phoneNumber.replace(/\D/g, "").length < 6) {
    errors.phoneNumber = "Please enter a valid phone number.";
  }

  // 2. Organization Information
  if (!data.companyName || !data.companyName.trim()) {
    errors.companyName = "Please complete this required field.";
  }

  const urlErr = validateWebsiteUrl(data.companyWebsite);
  if (urlErr) {
    errors.companyWebsite = urlErr;
  }

  if (!data.teamSize) {
    errors.teamSize = "Please select your team size.";
  }

  // Logo file validation if uploaded
  if (logoFile) {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (logoFile.size > MAX_SIZE) {
      errors.logoFile = "Logo file exceeds the maximum 2MB size limit.";
    } else {
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
      if (!validTypes.includes(logoFile.type) && !/\.(png|jpg|jpeg|svg)$/i.test(logoFile.name)) {
        errors.logoFile = "Invalid file type. Please upload a .png, .jpg, or .svg image.";
      }
    }
  }

  // 3. Event & Planning Details
  if (!data.planningType) {
    errors.planningType = "Please select what event type you are planning.";
  }
  if (!data.targetTimeline) {
    errors.targetTimeline = "Please select your target launch timeline.";
  }
  if (!data.estimatedParticipants) {
    errors.estimatedParticipants = "Please select your estimated number of participants.";
  }

  if (!data.aboutEventGoals || !data.aboutEventGoals.trim()) {
    errors.aboutEventGoals = "Please complete this required field.";
  } else if (data.aboutEventGoals.trim().length < 50) {
    errors.aboutEventGoals = `Please provide more details (minimum 50 characters required, currently ${data.aboutEventGoals.trim().length}/50).`;
  }

  return errors;
}
