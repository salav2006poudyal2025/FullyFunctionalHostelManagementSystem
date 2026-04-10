// rooms.js
// Owner-facing room management interface.
// Features:
// - Displays all rooms with occupancy information
// - Allows deleting rooms (with validation)
// - Provides confirmation dialogs and user feedback

const roomsTable = document.getElementById("roomsTable");
const roomsTableBody = document.getElementById("roomsTableBody");
const loading = document.getElementById("loading");
const noRooms = document.getElementById("noRooms");
const deleteModal = document.getElementById("deleteModal");
const deleteMessage = document.getElementById("deleteMessage");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const refreshBtn = document.getElementById("refreshBtn");

// Store current rooms data
let currentRooms = [];

// Toast notification system
function showToast(message, type = "success") {
  toastMessage.textContent = message;
  toast.className = `toast toast-${type}`;
  toast.style.display = "block";

  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// Modal functions
function showDeleteModal(roomNumber, roomId) {
  deleteMessage.textContent = `Are you sure you want to delete Room ${roomNumber}? This cannot be undone.`;
  deleteModal.style.display = "flex";
  deleteModal.dataset.roomId = roomId;
  deleteModal.dataset.roomNumber = roomNumber;
}

function hideDeleteModal() {
  deleteModal.style.display = "none";
  delete deleteModal.dataset.roomId;
  delete deleteModal.dataset.roomNumber;
}

// Load rooms data
async function loadRooms() {
  loading.style.display = "block";
  roomsTable.style.display = "none";
  noRooms.style.display = "none";

  try {
    const response = await fetch("/booking/api/rooms");
    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || "Unable to load rooms.");
    }

    currentRooms = payload.data;
    renderRoomsTable(currentRooms);
  } catch (err) {
    console.error("Error loading rooms:", err);
    showToast("Error loading rooms. Please try again.", "error");
    loading.style.display = "none";
  }
}

// Render rooms table
function renderRoomsTable(rooms) {
  loading.style.display = "none";

  if (!rooms.length) {
    noRooms.style.display = "block";
    return;
  }

  roomsTable.style.display = "table";
  roomsTableBody.innerHTML = "";

  rooms.forEach((room) => {
    const row = document.createElement("tr");

    const statusClass = room.status === "Available" ? "badge-success" : "badge-danger";

    row.innerHTML = `
      <td>${room.roomNumber}</td>
      <td>${room.seaterType} Seater</td>
      <td>${room.totalSeats}</td>
      <td>${room.occupiedSeats}</td>
      <td>${room.seatsLeft}</td>
      <td>₹${room.monthlyFee}</td>
      <td><span class="badge ${statusClass}">${room.status}</span></td>
      <td>
        <button class="btn-danger delete-room-btn" data-room-id="${room._id}" data-room-number="${room.roomNumber}">
          Delete
        </button>
      </td>
    `;

    roomsTableBody.appendChild(row);
  });

  // Add event listeners to delete buttons
  document.querySelectorAll(".delete-room-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const roomId = e.target.dataset.roomId;
      const roomNumber = e.target.dataset.roomNumber;
      showDeleteModal(roomNumber, roomId);
    });
  });
}

// Delete room
async function deleteRoom(roomId, roomNumber) {
  try {
    const response = await fetch(`/booking/api/rooms/${roomId}`, {
      method: "DELETE",
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      // Show specific error message from backend
      showToast(payload.message || "Failed to delete room.", "error");
      return;
    }

    // Success - remove from table and show toast
    showToast("Room deleted.");
    loadRooms(); // Refresh the table

  } catch (err) {
    console.error("Error deleting room:", err);
    showToast("Error deleting room. Please try again.", "error");
  }
}

// Event listeners
refreshBtn.addEventListener("click", loadRooms);

cancelDelete.addEventListener("click", hideDeleteModal);

confirmDelete.addEventListener("click", () => {
  const roomId = deleteModal.dataset.roomId;
  const roomNumber = deleteModal.dataset.roomNumber;

  if (roomId && roomNumber) {
    deleteRoom(roomId, roomNumber);
    hideDeleteModal();
  }
});

// Close modal when clicking outside
deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) {
    hideDeleteModal();
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", loadRooms);