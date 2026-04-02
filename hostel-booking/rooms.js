// rooms.js
// Owner-facing room creation and validation.

const roomForm = document.querySelector("#roomForm");
const roomSuccess = document.querySelector("#roomSuccess");
const roomError = document.querySelector("#roomError");
const existingRoomsTableBody = document.querySelector("#existingRoomsTable tbody");

async function loadExistingRooms() {
  try {
    const response = await fetch("/booking/api/rooms");
    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || "Failed to fetch rooms");
    }

    existingRoomsTableBody.innerHTML = "";

    payload.data.forEach((room) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${room.roomNumber}</td>
        <td>${room.seaterType}</td>
        <td>${room.monthlyFee || room.price || "N/A"}</td>
        <td>${room.status}</td>
        <td>${room.seatsLeft}</td>
      `;
      existingRoomsTableBody.appendChild(row);
    });
  } catch (error) {
    existingRoomsTableBody.innerHTML = '<tr><td colspan="5">Failed to load rooms.</td></tr>';
  }
}


function clearErrors() {
  document.querySelectorAll(".error-msg").forEach((el) => {
    if (el.id !== "roomError") el.textContent = "";
  });
  roomError.style.display = "none";
  roomError.textContent = "";
  roomSuccess.style.display = "none";
}

roomForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const payload = {
    roomNumber: document.getElementById("roomNumber").value.trim(),
    seaterType: Number(document.getElementById("seaterType").value),
    monthlyFee: Number(document.getElementById("monthlyFee").value),
  };

  let hasError = false;

  if (!payload.roomNumber) {
    document.getElementById("err-roomNumber").textContent = "Room number is required.";
    hasError = true;
  }
  if (![2, 3, 4].includes(payload.seaterType)) {
    document.getElementById("err-seaterType").textContent = "Seater type must be 2, 3, or 4.";
    hasError = true;
  }
  if (!payload.monthlyFee || payload.monthlyFee <= 0) {
    document.getElementById("err-monthlyFee").textContent = "Monthly fee must be a positive number.";
    hasError = true;
  }

  if (hasError) {
    return;
  }

  try {
    const response = await fetch("/booking/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      roomError.style.display = "block";
      roomError.textContent = data.message || "Failed to add room.";
      return;
    }

    roomSuccess.style.display = "block";
    roomForm.reset();
    await loadExistingRooms();
  } catch (err) {
    roomError.style.display = "block";
    roomError.textContent = "Unable to create room. Please try again.";
  }
});

// Initial load
loadExistingRooms();
