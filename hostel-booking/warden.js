// warden.js
// Handles room occupancy table and student detail panel updates.

const occupancyTableBody = document.querySelector("#occupancyTable tbody");
const pendingTableBody = document.querySelector("#pendingTable tbody");
const lastUpdate = document.querySelector("#lastUpdate");
const studentPanel = document.querySelector("#studentPanel");
const selectedRoom = document.querySelector("#selectedRoom");
const roomStudentList = document.querySelector("#roomStudentList");
const rejectModal = document.querySelector("#rejectModal");
const rejectReason = document.querySelector("#rejectReason");
const confirmReject = document.querySelector("#confirmReject");
const cancelReject = document.querySelector("#cancelReject");

let currentRejectId = null;

async function fetchOccupancy() {
  try {
    const response = await fetch("/booking/api/rooms");
    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || "Failed to load occupancy data.");
    }

    renderOccupancy(payload.data);
    lastUpdate.textContent = new Date().toLocaleString();
  } catch (err) {
    console.error("room occupancy fetch error:", err);
    lastUpdate.textContent = "Error loading data";
  }
}

function renderOccupancy(rooms) {
  occupancyTableBody.innerHTML = "";

  rooms.forEach((room) => {
    const row = document.createElement("tr");
    row.classList.add("clickable-row");

    row.innerHTML = `
      <td>${room.roomNumber}</td>
      <td>${room.seaterType}</td>
      <td>${room.occupiedSeats}</td>
      <td>${room.totalSeats}</td>
      <td>${room.seatsLeft}</td>
      <td><span class="badge ${room.status === "Full" ? "badge-danger" : "badge-success"}">${room.status}</span></td>
    `;

    row.addEventListener("click", () => showRoomStudents(room.roomNumber));

    occupancyTableBody.appendChild(row);
  });
}

async function showRoomStudents(roomNumber) {
  try {
    const response = await fetch(`/booking/api/rooms/${roomNumber}/students`);
    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || "Failed to load room students.");
    }

    selectedRoom.textContent = roomNumber;
    roomStudentList.innerHTML = "";

    if (!payload.data.length) {
      roomStudentList.innerHTML = '<li class="empty">No approved students in this room</li>';
    } else {
      payload.data.forEach((student) => {
        const li = document.createElement("li");
        li.textContent = `${student.fullName} (${student.email}, ${student.phone}) - Check-in: ${student.checkIn}`;
        roomStudentList.appendChild(li);
      });
    }

    studentPanel.style.display = "block";
  } catch (err) {
    console.error("student view error:", err);
    roomStudentList.innerHTML = `<li class="empty">Unable to load students for room ${roomNumber}</li>`;
    studentPanel.style.display = "block";
  }
}

fetchOccupancy();
setInterval(fetchOccupancy, 5000); // refresh every 5 seconds

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

function renderPendingBookings(bookings) {
  pendingTableBody.innerHTML = "";

  if (!bookings.length) {
    pendingTableBody.innerHTML = '<tr><td colspan="6">No pending bookings</td></tr>';
    return;
  }

  bookings.forEach((booking) => {
    const row = document.createElement("tr");

    // Check if already actioned by admin
    const isActionedByAdmin = booking.actionedBy === "admin";

    row.innerHTML = `
      <td>${booking.fullName}</td>
      <td>${booking.email}</td>
      <td>${booking.phone}</td>
      <td>${booking.roomNumber}</td>
      <td>${booking.checkIn}</td>
      <td>
        ${isActionedByAdmin ?
          '<span class="btn-disabled">Already actioned by Owner</span>' :
          `<button class="btn-success approve-btn" data-id="${booking.id}">Approve</button>
           <button class="btn-danger reject-btn" data-id="${booking.id}">Reject</button>`
        }
      </td>
    `;

    pendingTableBody.appendChild(row);
  });

  if (!document.querySelector(".btn-disabled")) {
    // Add event listeners only if not disabled
    document.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", (e) => handleApprove(e.target.dataset.id));
    });

    document.querySelectorAll(".reject-btn").forEach(btn => {
      btn.addEventListener("click", (e) => handleReject(e.target.dataset.id));
    });
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
      body: JSON.stringify({ actionedBy: "warden" }),
    });

    const payload = await response.json();

    if (!response.ok) {
      alert(payload.message || "Approval failed");
      return;
    }

    alert("Booking approved successfully!");
    fetchPendingBookings();
    fetchOccupancy();
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
      body: JSON.stringify({ reason, actionedBy: "warden" }),
    });

    const payload = await response.json();

    if (!response.ok) {
      alert(payload.message || "Rejection failed");
      return;
    }

    alert("Booking rejected successfully!");
    rejectModal.style.display = "none";
    fetchPendingBookings();
    fetchOccupancy();
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
setInterval(fetchPendingBookings, 5000); // refresh every 5 seconds
