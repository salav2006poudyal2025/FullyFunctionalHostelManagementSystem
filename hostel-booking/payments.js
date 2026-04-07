// payments.js
// Owner-facing payment status manager.

const paymentTableBody = document.querySelector("#paymentTable tbody");
const resetPaymentsButton = document.querySelector("#resetPayments");

async function fetchPaymentData() {
  try {
    const response = await fetch("/booking/api/payments");
    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || "Unable to load students for payment.");
    }

    renderPaymentTable(payload.data);
  } catch (err) {
    console.error("Error loading payment data:", err);
    paymentTableBody.innerHTML = '<tr><td colspan="4">Error loading payment data</td></tr>';
  }
}

function renderPaymentTable(students) {
  paymentTableBody.innerHTML = "";

  if (!students.length) {
    paymentTableBody.innerHTML = '<tr><td colspan="4">No approved students found</td></tr>';
    return;
  }

  students.forEach((student) => {
    const row = document.createElement("tr");

    const statusClass = student.paymentStatus === "Complete" ? "payment-status-complete" : "payment-status-pending";

    row.innerHTML = `
      <td>${student.fullName}</td>
      <td>${student.roomNumber}</td>
      <td>₹${student.monthlyFee}</td>
      <td>
        <select class="payment-select" data-id="${student.id}">
          <option value="Pending" ${student.paymentStatus === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Complete" ${student.paymentStatus === "Complete" ? "selected" : ""}>Complete</option>
        </select>
      </td>
    `;

    paymentTableBody.appendChild(row);
  });

  document.querySelectorAll(".payment-select").forEach((dropdown) => {
    dropdown.addEventListener("change", async (event) => {
      const id = event.target.dataset.id;
      const status = event.target.value;
      await updatePaymentStatus(id, status);
    });
  });
}

async function updatePaymentStatus(id, status) {
  try {
    const response = await fetch(`/booking/api/payments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: status }),
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Failed to save payment status.");
    }

    // Compare and update UI if needed
    fetchPaymentData();
  } catch (err) {
    console.error("Failed to update payment status:", err);
    alert("Payment status update failed. Please try again.");
    fetchPaymentData();
  }
}

resetPaymentsButton.addEventListener("click", async () => {
  if (!confirm("This will reset all payment statuses to Pending. This cannot be undone. Continue?")) {
    return;
  }

  try {
    const response = await fetch("/booking/api/payments/reset", {
      method: "POST",
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Reset failed.");
    }

    fetchPaymentData();
  } catch (err) {
    console.error("Reset payments failed:", err);
    alert("Reset failed. Please try again.");
  }
});

fetchPaymentData();
