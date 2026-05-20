import { useEffect, useState } from "react";
import { getRooms, queryRoomsByAI } from "../../services/api";
import twoseater from "../img/2-seater.jpeg";
import threeseater from "../img/3-seater.jpeg";
import fourseater from "../img/4-seater.jpeg";
import hostel from "../img/hostel.jpeg";

const seaterImgs = { 2: twoseater, 3: threeseater, 4: fourseater };

const amenities = [
  { icon: "🔒", label: "24/7 Security" },
  { icon: "📶", label: "High-Speed Wi-Fi" },
  { icon: "🍽️", label: "Daily Meals" },
  { icon: "🛁", label: "Hot Water" },
  { icon: "🧺", label: "Laundry" },
  { icon: "📚", label: "Study Room" },
  { icon: "🚌", label: "Transport" },
  { icon: "💡", label: "Power Backup" },
];

const LandingPage = () => {
  const [rooms, setRooms] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    getRooms()
      .then(setRooms)
      .catch(() => {});
  }, []);

  async function handleChatSubmit(event) {
    event.preventDefault();
    if (!chatInput.trim()) {
      setChatError("Please type your question first.");
      return;
    }

    setChatLoading(true);
    setChatError("");
    const userMessage = { sender: "user", text: chatInput.trim() };
    setChatMessages((current) => [...current, userMessage]);

    try {
      const result = await queryRoomsByAI(chatInput.trim());
      const aiText = result.aiMessage || result.message || "Here are the best room suggestions for your request.";
      const assistantMessage = {
        sender: "assistant",
        text: `${aiText} ${result.summary ? `(${result.summary})` : ""}`.trim(),
        rooms: result.rooms || [],
      };
      setChatMessages((current) => [...current, assistantMessage]);
      setChatInput("");
    } catch (err) {
      setChatError(err.message || "Unable to process your request.");
      setChatMessages((current) => [
        ...current,
        { sender: "assistant", text: "Sorry, I couldn't get suggestions right now." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <>
      {/* NAVBAR */}
      <nav className="sg-nav">
        <div className="sg-logo">
          Shikha <span>Girls</span> Hostel
        </div>
        <div className="sg-nav-actions">
          <a href="/login" className="sg-btn sg-btn-ghost">
            Login
          </a>
          <a href="/signup" className="sg-btn sg-btn-solid">
            Signup
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="sg-hero">
        <img className="sg-hero-img" src={hostel} alt="Shikha Girls Hostel" />
        <div className="sg-hero-overlay" />
        <div className="sg-hero-content">
          <span className="sg-hero-tag">Girls-Only · Safe &amp; Verified</span>
          <h1 className="sg-hero-title">
            Your <em>home</em> away
            <br />
            from home.
          </h1>
          <p className="sg-hero-sub">
            A warm, secure, and student-friendly hostel built for young women
            who deserve more than just a bed.
          </p>
        </div>
        <div className="sg-scroll">
          <div className="sg-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* AI ROOM ADVISOR */}
      <section className="sg-rooms" style={{ paddingTop: 40 }}>
        <div className="sg-section-label">AI Room Advisor</div>
        <h2 className="sg-section-title">Ask about room availability and recommendations</h2>
        <p className="sg-section-sub">
          Ask the AI about rooms, pricing, or recommendations.
        </p>
        <div className="sg-ai-card" style={{ marginBottom: 32, padding: 24, background: "#fff", borderRadius: 20, boxShadow: "0 20px 45px rgba(28, 40, 70, 0.08)" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
            {[
              "How many 2-seater rooms are available?",
              "Show me rooms under 15000",
              "Suggest best room for me",
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="br-submit-btn"
                style={{ padding: "10px 14px", fontSize: 13, background: "var(--sand)", border: "1px solid #ddd", color: "#111" }}
                onClick={() => setChatInput(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleChatSubmit}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="br-input"
                placeholder="Ask the AI about rooms, pricing, or recommendations"
                style={{ flex: 1, minWidth: 220 }}
              />
              <button type="submit" className="br-submit-btn" disabled={chatLoading}>
                {chatLoading ? "Thinking…" : "Send"}
              </button>
            </div>
          </form>

          {chatError && (
            <div className="lp-error" style={{ marginBottom: 16 }}>
              {chatError}
            </div>
          )}

          <div style={{ padding: 16, borderRadius: 16, border: "1px solid #eee", background: "#fafafa", minHeight: 120 }}>
            {chatMessages.length === 0 ? (
              <p style={{ color: "var(--muted)", margin: 0 }}>
                Start the chat to get room suggestions and prices.
              </p>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  key={`${message.sender}-${index}`}
                  style={{ display: "flex", justifyContent: message.sender === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}
                >
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "12px 14px",
                      borderRadius: 16,
                      background: message.sender === "user" ? "var(--rose)" : "#f1f5f9",
                      color: message.sender === "user" ? "white" : "#111",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {message.text}
                    {message.rooms?.length > 0 && (
                      <div style={{ marginTop: 12, fontSize: 13 }}>
                        <strong>Top matching rooms:</strong>
                        <ul style={{ paddingLeft: 18, margin: 8 }}>
                          {message.rooms.slice(0, 3).map((room) => (
                            <li key={room._id}>
                              #{room.roomNumber} — {room.seaterType}-Seater · Rs.{room.monthlyFee?.toLocaleString()} ({room.status})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ROOMS */}
      <section className="sg-rooms">
        <div className="sg-section-label">Accommodations</div>
        <h2 className="sg-section-title">Choose your perfect room</h2>
        <p className="sg-section-sub">
          Every room is thoughtfully designed for safety, comfort and that
          little touch of warmth.
        </p>

        <div className="sg-room-grid">
          {rooms.length === 0 ? (
            <p style={{ color: "var(--muted)", textAlign: "center" }}>
              Loading rooms…
            </p>
          ) : (
            rooms.map((room) => (
              <div className="sg-room-card" key={room._id}>
                <div className="sg-room-img-wrap">
                  <img
                    src={seaterImgs[room.seaterType] || twoseater}
                    alt={`${room.seaterType}-Seater`}
                  />
                  <span
                    className={`sg-room-status-dot ${room.status === "Available" ? "green" : "red"}`}
                  />
                </div>
                <div className="sg-room-body">
                  <h3 className="sg-room-title">
                    {room.seaterType}-Seater Room
                  </h3>

                  <div className="sg-room-footer">
                    <div className="sg-room-price">
                      <strong>Rs.{room.monthlyFee.toLocaleString()}</strong>{" "}
                      /month
                    </div>
                    <span
                      className={`sg-status-badge ${room.status === "Available" ? "green" : "red"}`}
                    >
                      {room.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* AMENITIES */}
      <section className="sg-amenities">
        <h2 className="sg-amenities-title">Everything you need, included</h2>
        <div className="sg-amenities-grid">
          {amenities.map((a) => (
            <div className="sg-amenity" key={a.label}>
              <span className="sg-amenity-icon">{a.icon}</span>
              {a.label}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sg-footer">
        © {new Date().getFullYear()} <strong>Shikha Girls Hostel</strong> · All
        rights reserved
      </footer>
    </>
  );
};
export default LandingPage;
