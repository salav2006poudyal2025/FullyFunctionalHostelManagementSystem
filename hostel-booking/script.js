// script.js
// Student booking form behavior for /booking page.
const bookingForm = document.getElementById("bookingForm");
const successBox = document.getElementById("successBox");

function clearErrors() {
  document.querySelectorAll(".error-msg").forEach((el) => (el.textContent = ""));
}

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const formData = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    roomNumber: document.getElementById("room").value,
    checkIn: document.getElementById("checkIn").value,
  };

  try {
    const res = await fetch("/booking/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const json = await res.json();
    if (!res.ok) {
      if (json.errors) {
        Object.keys(json.errors).forEach((key) => {
          const field = document.getElementById(`err-${key}`);
          if (field) field.textContent = json.errors[key];
        });
      } else {
        alert(json.message || "Submission failed");
      }
      return;
    }

    successBox.style.display = "block";
    bookingForm.reset();
    setTimeout(() => {
      successBox.style.display = "none";
    }, 3500);

  } catch (error) {
    console.error("booking submission failed", error);
    alert("Booking submission failed. Please try again later.");
  }
});
