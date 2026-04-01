// admin.js
// Handles admin booking management dashboard.

const pendingTableBody = document.querySelector("#pendingTable tbody");
const allBookingsTableBody = document.querySelector("#allBookingsTable tbody");
const lastUpdate = document.querySelector("#lastUpdate");
const rejectModal = document.querySelector("#rejectModal");
const rejectReason = document.querySelector("#rejectReason");
const confirmReject = document.querySelector("#confirmReject");
const cancelReject = document.querySelector("#cancelReject");

let currentRejectId = null;

async function fetchPendingBookings() {
  try {
    const response = await fetch("/booking/api/bookings/pending");
    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || "Failed to load pending bookings.");
    }

    renderPendingBookings(payload.data);
  } catch (err) {
    console.error("pending bookings fetch error:", err);
    pendingTableBody.innerHTML = '<tr><td colspan="6">Error loading pending bookings</td></tr>';
  }
}

async function fetchAllBookings() {
  try {
    const response = await fetch("/booking/api/bookings");
    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || "Failed to load all bookings.");
    }

    renderAllBookings(payload.data);
    lastUpdate.textContent = new Date().toLocaleString();
  } catch (err) {
    console.error("all bookings fetch error:", err);
    allBookingsTableBody.innerHTML = '<tr><td colspan="6">Error loading bookings</td></tr>';
  }
}

function renderPendingBookings(bookings) {
  pendingTableBody.innerHTML = "";

  if (!bookings.length) {
    pendingTableBody.innerHTML = '<tr><td colspan="6">No pending bookings</td></tr>';
    return;
  }

  bookings.forEach((booking) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${booking.fullName}</td>
      <td>${booking.email}</td>
      <td>${booking.phone}</td>
      <td>${booking.roomNumber}</td>
      <td>${booking.checkIn}</td>
      <td>
        <button class="btn-success approve-btn" data-id="${booking.id}">Approve</button>
        <button class="btn-danger reject-btn" data-id="${booking.id}">Reject</button>
      </td>
    `;

    pendingTableBody.appendChild(row);
  });

  // Add event listeners
  document.querySelectorAll(".approve-btn").forEach(btn => {
    btn.addEventListener("click", (e) => handleApprove(e.target.dataset.id));
  });

  document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", (e) => handleReject(e.target.dataset.id));
  });
}

function renderAllBookings(bookings) {
  allBookingsTableBody.innerHTML = "";

  bookings.forEach((booking) => {
    const actionedBy = booking.actionedBy ? booking.actionedBy : "-";
    const actionedAt = booking.actionedAt ? new Date(booking.actionedAt).toLocaleString() : "-";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${booking.fullName}</td>
      <td>${booking.email}</td>
      <td>${booking.roomNumber}</td>
      <td><span class="badge ${getStatusClass(booking.status)}">${booking.status}</span></td>
      <td>${actionedBy}</td>
      <td>${actionedAt}</td>
    `;

    allBookingsTableBody.appendChild(row);
  });
}

function getStatusClass(status) {
  switch (status) {
    case "Approved": return "badge-success";
    case "Rejected": return "badge-danger";
    default: return "badge-secondary";
  }
}

async function handleApprove(id) {
  if (!confirm("Are you sure you want to approve this booking?")) {
    return;
  }

  try {
    const response = await fetch(`/booking/api/bookings/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionedBy: "admin" }),
    });

    const payload = await response.json();

    if (!response.ok) {
      alert(payload.message || "Approval failed");
      return;
    }

    alert("Booking approved successfully!");
    fetchPendingBookings();
    fetchAllBookings();
  } catch (err) {
    console.error("approval error:", err);
    alert("Approval failed. Please try again.");
  }
}

function handleReject(id) {
  currentRejectId = id;
  rejectReason.value = "";
  rejectModal.style.display = "flex";
}

confirmReject.addEventListener("click", async () => {
  const reason = rejectReason.value.trim();
  if (!reason) {
    alert("Please provide a rejection reason.");
    return;
  }

  try {
    const response = await fetch(`/booking/api/bookings/${currentRejectId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, actionedBy: "admin" }),
    });

    const payload = await response.json();

    if (!response.ok) {
      alert(payload.message || "Rejection failed");
      return;
    }

    alert("Booking rejected successfully!");
    rejectModal.style.display = "none";
    fetchPendingBookings();
    fetchAllBookings();
  } catch (err) {
    console.error("rejection error:", err);
    alert("Rejection failed. Please try again.");
  }
});

cancelReject.addEventListener("click", () => {
  rejectModal.style.display = "none";
  currentRejectId = null;
});

fetchPendingBookings();
fetchAllBookings();
setInterval(() => {
  fetchPendingBookings();
  fetchAllBookings();
}, 10000); // refresh every 10 seconds
