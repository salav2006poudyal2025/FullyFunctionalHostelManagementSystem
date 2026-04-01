// warden.js
// Handles room occupancy table and student detail panel updates.

const occupancyTableBody = document.querySelector("#occupancyTable tbody");
const lastUpdate = document.querySelector("#lastUpdate");
const studentPanel = document.querySelector("#studentPanel");
const selectedRoom = document.querySelector("#selectedRoom");
const roomStudentList = document.querySelector("#roomStudentList");

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
