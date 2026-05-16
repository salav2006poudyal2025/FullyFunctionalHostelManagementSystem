import { useState } from "react";

/*
  Dummy Khalti payment modal — frontend only.
  BACKEND later:
    1. POST /api/payments/khalti/initiate  → returns { pidx, payment_url }
    2. Redirect / show QR with that payment_url
    3. Khalti webhook → POST /api/payments/khalti/verify
    4. On verify success, persist booking with paymentStatus="Paid"
*/
const KhaltiPaymentModal = ({ amount, studentName, onSuccess, onClose }) => {
  const [stage, setStage] = useState("qr"); // "qr" | "processing" | "done"

  function simulatePay() {
    setStage("processing");
    setTimeout(() => {
      const txn = {
        transactionId:
          "KHL-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
        method: "Khalti",
        amount,
        status: "Paid",
        paidAt: new Date().toISOString(),
      };
      setStage("done");
      setTimeout(() => onSuccess(txn), 900);
    }, 1400);
  }

  return (
    <div className="khalti-overlay" onClick={onClose}>
      <div className="khalti-modal" onClick={(e) => e.stopPropagation()}>
        <button className="khalti-close" onClick={onClose}>
          ×
        </button>

        <div className="khalti-brand">
          <span className="khalti-dot" />
          <span>Khalti</span>
          <span className="khalti-dummy-tag">DEMO</span>
        </div>

        <h3 className="khalti-title">Pay Rs. {amount.toLocaleString()}</h3>
        <p className="khalti-sub">
          Booking for <strong>{studentName}</strong>
        </p>

        {stage === "qr" && (
          <>
            <div className="khalti-qr">
              {/* purely decorative QR */}
              <div className="khalti-qr-grid">
                {Array.from({ length: 49 }).map((_, i) => (
                  <span
                    key={i}
                    style={{ opacity: Math.random() > 0.4 ? 1 : 0 }}
                  />
                ))}
              </div>
            </div>
            <p className="khalti-hint">Scan with your Khalti app, or:</p>
            <button className="khalti-pay-btn" onClick={simulatePay}>
              Generate QR
            </button>
          </>
        )}

        {stage === "processing" && (
          <div className="khalti-processing">
            <div className="khalti-spinner" />
            <p>Verifying payment…</p>
          </div>
        )}

        {stage === "done" && (
          <div className="khalti-done">
            <div className="khalti-check">✓</div>
            <p>Payment successful</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KhaltiPaymentModal;
