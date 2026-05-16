import React from 'react';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: "1rem", color: "var(--text-main, #333)", fontSize: "1.5rem", fontWeight: "bold" }}>Terms and Conditions</h2>
        <div style={contentStyle}>
          <h4 style={{marginTop: "0"}}>Hostel Management System</h4>
          <p><strong>Last Updated:</strong> 16 May 2026</p>
          <p>Welcome to the Hostel Management System. By accessing or using this system, users agree to comply with and be bound by the following terms and conditions.</p>
          
          <h5 style={headingStyle}>1. Acceptance of Terms</h5>
          <p>By registering, logging in, or using this Hostel Management System, users acknowledge that they have read, understood, and agreed to these Terms and Conditions.</p>

          <h5 style={headingStyle}>2. User Accounts</h5>
          <ul style={listStyle}>
            <li>Users must provide accurate and complete information during registration.</li>
            <li>Students are responsible for maintaining the confidentiality of their login credentials.</li>
            <li>Users must not share their username or password with others.</li>
            <li>The hostel administration reserves the right to suspend or terminate accounts involved in unauthorized activities.</li>
          </ul>

          <h5 style={headingStyle}>3. Room Booking</h5>
          <ul style={listStyle}>
            <li>Room bookings are subject to availability.</li>
            <li>Booking confirmation is only valid after successful payment or approval by hostel administration.</li>
            <li>Users must provide valid personal and academic details while booking rooms.</li>
          </ul>

          <h5 style={headingStyle}>4. Payment Policy</h5>
          <ul style={listStyle}>
            <li>Payments made through integrated payment gateways (such as Khalti) must be completed successfully for booking confirmation.</li>
            <li>Partial payments or token payments may be accepted as per hostel rules.</li>
            <li>Refunds, if applicable, are subject to hostel management approval and policies.</li>
          </ul>

          <h5 style={headingStyle}>5. User Responsibilities</h5>
          <p>Users agree to:</p>
          <ul style={listStyle}>
            <li>Use the system only for lawful purposes.</li>
            <li>Not attempt to hack, damage, or disrupt system functionality.</li>
            <li>Not upload false, harmful, or misleading information.</li>
          </ul>

          <h5 style={headingStyle}>6. Data Privacy</h5>
          <ul style={listStyle}>
            <li>User information collected through the system is used solely for hostel management purposes.</li>
            <li>Personal data will not be shared with third parties without user consent unless required by law.</li>
          </ul>

          <h5 style={headingStyle}>7. Admin Rights</h5>
          <p>The hostel administration has the right to:</p>
          <ul style={listStyle}>
            <li>Approve or reject room applications.</li>
            <li>Update room availability and pricing.</li>
            <li>Remove users violating hostel policies or system rules.</li>
          </ul>

          <h5 style={headingStyle}>8. System Availability</h5>
          <p>While we aim to maintain uninterrupted service, the system may occasionally be unavailable due to maintenance, updates, or technical issues.</p>

          <h5 style={headingStyle}>9. Limitation of Liability</h5>
          <p>The Hostel Management System is developed for management convenience. The system owners are not liable for losses caused by technical failures, incorrect user data, or payment gateway issues.</p>

          <h5 style={headingStyle}>10. Changes to Terms</h5>
          <p>These terms may be updated or modified at any time. Continued use of the system after changes indicates acceptance of updated terms.</p>

          <h5 style={headingStyle}>11. Contact Information</h5>
          <p>For support or queries regarding the Hostel Management System, contact hostel administration.</p>
          <p style={{marginBottom: "0"}}>Email: owner@gmail.com<br/>Phone: +977-XXXXXXXXXX</p>
        </div>
        <div style={footerStyle}>
          <button onClick={onClose} className="ul-submit-btn" style={{ padding: "0.5rem 1rem", fontSize: "14px", width: "auto" }}>Close</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '600px',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};

const contentStyle = {
  overflowY: 'auto',
  marginBottom: '1rem',
  paddingRight: '15px',
  lineHeight: '1.6',
  color: '#444',
  fontSize: '14px'
};

const headingStyle = {
  marginTop: '1.5rem',
  marginBottom: '0.5rem',
  color: '#222',
  fontSize: '1.1rem',
  fontWeight: '600'
};

const listStyle = {
  paddingLeft: '1.5rem',
  marginBottom: '1rem'
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: 'auto',
  paddingTop: '1rem',
  borderTop: '1px solid #eee'
};

export default TermsModal;
