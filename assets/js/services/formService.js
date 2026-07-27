import { getSupabaseClient } from "../config/supabase.js";

const FORM_SELECTOR = "#contact-form";
const SUBMIT_BTN_SELECTOR = "#contact-submit";
const SUCCESS_ALERT_SELECTOR = "#form-success";
const ERROR_ALERT_SELECTOR = "#form-error";

function showAlert(success) {
  const alertId = success ? SUCCESS_ALERT_SELECTOR : ERROR_ALERT_SELECTOR;
  const alertEl = document.querySelector(alertId);
  if (!alertEl) return;
  alertEl.classList.remove("hidden", "opacity-0");
  alertEl.classList.add("opacity-100");
  setTimeout(() => {
    alertEl.classList.add("opacity-0");
    alertEl.classList.remove("opacity-100");
    setTimeout(() => alertEl.classList.add("hidden"), 400);
  }, 5000);
}

function getFormData(form) {
  const data = new FormData(form);
  return {
    name: data.get("name")?.trim() || "",
    email: data.get("email")?.trim() || "",
    subject: data.get("subject")?.trim() || "",
    message: data.get("message")?.trim() || "",
    language: document.documentElement.lang || "ar",
    created_at: new Date().toISOString(),
  };
}

function getValidationMessages() {
  const lang = document.documentElement.lang || "ar";
  if (lang === "en") {
    return {
      name: "Please enter your name",
      email: "Please enter a valid email",
      subject: "Please select a subject",
      message: "Please write a message of at least 10 characters",
    };
  }
  return {
    name: "الرجاء إدخال الاسم",
    email: "الرجاء إدخال بريد إلكتروني صحيح",
    subject: "الرجاء اختيار الموضوع",
    message: "الرجاء كتابة رسالة لا تقل عن 10 أحرف",
  };
}

function validateFormData(data) {
  const msg = getValidationMessages();
  if (!data.name) return msg.name;
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return msg.email;
  if (!data.subject) return msg.subject;
  if (!data.message || data.message.length < 10)
    return msg.message;
  return null;
}

export function initForm() {
  const form = document.querySelector(FORM_SELECTOR);
  if (!form) return;

  const submitBtn = document.querySelector(SUBMIT_BTN_SELECTOR);
  if (!submitBtn) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = getFormData(form);
    const validationError = validateFormData(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent =
      submitBtn.dataset.submitting || "جاري الإرسال...";

    try {
      const client = getSupabaseClient();
      if (!client) {
        console.warn(
          "[FormService] Supabase not connected. Simulating success."
        );
        showAlert(true);
        form.reset();
        return;
      }

      const { error } = await client.from("messages").insert([formData]);

      if (error) {
        console.error("[FormService] Supabase insert error:", error);
        showAlert(false);
      } else {
        showAlert(true);
        form.reset();
      }
    } catch (err) {
      console.error("[FormService] Unexpected error:", err);
      showAlert(false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

export default initForm;
