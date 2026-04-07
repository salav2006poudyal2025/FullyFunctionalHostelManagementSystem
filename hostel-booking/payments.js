// payments.js
// Owner-facing payment status manager.
// Features:
// - Displays all approved students with payment status
// - Allows updating individual payment statuses
// - Provides bulk reset functionality for monthly cycles
// - Includes loading states and user feedback

const paymentTableBody = document.querySelector("#paymentTable tbody");
const resetPaymentsButton = document.querySelector("#resetPayments");
const searchInput = document.querySelector("#searchInput");

// Store original data for filtering
let allStudents = [];

// Notification system
function showNotification(message, type = "info") {
  // Displays temporary notifications for user feedback
  // Types: success, error, info
  // Removes existing notifications and auto-dismisses after 3 seconds
  // Remove existing notifications
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;

  if (type === "success") {
    notification.style.backgroundColor = "#16a34a";
  } else if (type === "error") {
    notification.style.backgroundColor = "#dc2626";
  } else {
    notification.style.backgroundColor = "#3b82f6";
  }

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

async function fetchPaymentData() {
  // Fetches approved students with payment information from the API
  // Displays loading state and handles errors gracefully
  // Show loading state
  paymentTableBody.innerHTML = '<tr><td colspan="4">Loading payment data...</td></tr>';

  try {
    const response = await fetch("/booking/api/payments");
    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || "Unable to load students for payment.");
    }

    renderPaymentTable(payload.data);
    allStudents = payload.data; // Store for filtering
  } catch (err) {
    console.error("Error loading payment data:", err);
    paymentTableBody.innerHTML = '<tr><td colspan="4">Error loading payment data. <button onclick="fetchPaymentData()">Retry</button></td></tr>';
  }
}

function renderPaymentTable(students) {
  // Renders the payment table with student data
  // Creates dropdowns for payment status with change event listeners
  paymentTableBody.innerHTML = "";

  if (!students.length) {
    paymentTableBody.innerHTML = '<tr><td colspan="4">No approved students found</td></tr>';
    document.getElementById("paymentSummary").style.display = "none";
    return;
  }

  // Update summary statistics
  const totalStudents = students.length;
  const paidCount = students.filter(s => s.paymentStatus === "Complete").length;
  const pendingCount = totalStudents - paidCount;

  document.getElementById("totalStudents").textContent = totalStudents;
  document.getElementById("paidCount").textContent = paidCount;
  document.getElementById("pendingCount").textContent = pendingCount;
  document.getElementById("paymentSummary").style.display = "flex";

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
  // Updates a single student's payment status via API
  // Shows loading state on dropdown and provides user feedback
  const selectElement = document.querySelector(`[data-id="${id}"]`);
  const originalValue = selectElement.value;

  // Disable dropdown during update
  selectElement.disabled = true;
  selectElement.style.opacity = "0.6";

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

    // Show success feedback
    showNotification("Payment status updated successfully!", "success");
    fetchPaymentData();
  } catch (err) {
    console.error("Failed to update payment status:", err);
    showNotification("Payment status update failed. Please try again.", "error");
    // Revert on error
    selectElement.value = originalValue;
    selectElement.disabled = false;
    selectElement.style.opacity = "1";
  }
}

resetPaymentsButton.addEventListener("click", async () => {
  if (!confirm("This will reset all payment statuses to Pending. This cannot be undone. Continue?")) {
    return;
  }

  // Disable button during reset
  resetPaymentsButton.disabled = true;
  const originalText = resetPaymentsButton.textContent;
  resetPaymentsButton.textContent = "Resetting...";

  try {
    const response = await fetch("/booking/api/payments/reset", {
      method: "POST",
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Reset failed.");
    }

    showNotification("All payment statuses have been reset to Pending.", "success");
    fetchPaymentData();
  } catch (err) {
    console.error("Reset payments failed:", err);
    showNotification("Reset failed. Please try again.", "error");
  } finally {
    // Re-enable button
    resetPaymentsButton.disabled = false;
    resetPaymentsButton.textContent = originalText;
  }
});

fetchPaymentData();

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  // Ctrl+R to reset payments
  if (event.ctrlKey && event.key === "r") {
    event.preventDefault();
    resetPaymentsButton.click();
  }

  // Ctrl+L to reload payment data
  if (event.ctrlKey && event.key === "l") {
    event.preventDefault();
    fetchPaymentData();
  }
});

// Search functionality
searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase().trim();
  const filteredStudents = searchTerm
    ? allStudents.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm) ||
        student.roomNumber.toLowerCase().includes(searchTerm)
      )
    : allStudents;

  renderPaymentTable(filteredStudents);
});
