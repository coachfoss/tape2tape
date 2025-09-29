// src/Legal.js
import React from "react";

export function TermsOfService() {
  return (
    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <div className="card" style={{ padding: "2rem" }}>
        <h1>Terms of Service</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Tape2Tape ("the Service"), you accept and agree to be bound by the terms 
          and provision of this agreement.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Tape2Tape is a video analysis platform that connects athletes/clients with coaches for 
          performance feedback. The Service allows users to upload videos, receive annotated feedback, 
          and improve their performance.
        </p>

        <h2>3. User Accounts and Responsibilities</h2>
        <p>
          Users must provide accurate information when creating accounts. You are responsible for 
          maintaining the confidentiality of your account credentials and for all activities that 
          occur under your account.
        </p>

        <h2>4. Content Ownership and Usage Rights</h2>
        <p>
          <strong>Your Content:</strong> You retain ownership of videos and content you upload. 
          By uploading content, you grant Tape2Tape a limited license to store, process, and 
          deliver your content as part of the Service.
        </p>
        <p>
          <strong>Coach Reviews:</strong> Annotations and feedback provided by coaches remain the 
          intellectual property of the coach, but clients receive a perpetual license to use 
          reviews for personal improvement.
        </p>

        <h2>5. Prohibited Uses</h2>
        <p>You may not use the Service to:</p>
        <ul>
          <li>Upload content that violates laws or infringes on others' rights</li>
          <li>Share inappropriate, offensive, or harmful content</li>
          <li>Attempt to gain unauthorized access to other users' accounts</li>
          <li>Use the Service for commercial purposes without permission</li>
          <li>Upload content containing minors without proper consent</li>
        </ul>

        <h2>6. Payment and Subscriptions</h2>
        <p>
          Coach subscriptions are billed monthly or annually. Payments are processed through Stripe. 
          Refunds are available within 7 days of initial subscription. Subscriptions automatically 
          renew unless cancelled.
        </p>

        <h2>7. Privacy and Data Protection</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy to understand how we 
          collect, use, and protect your information.
        </p>

        <h2>8. Content Moderation and Removal</h2>
        <p>
          We reserve the right to review and remove content that violates these terms. Users can 
          report inappropriate content through our support system.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          Tape2Tape provides the platform "as is" without warranties. We are not responsible for 
          the quality of coaching advice or any outcomes from using the Service. Our liability is 
          limited to the amount paid for the Service.
        </p>

        <h2>10. Professional Disclaimer</h2>
        <p>
          Coaching feedback provided through the Service is for educational purposes only. It does 
          not constitute professional medical, therapeutic, or certified coaching advice. Users 
          should consult qualified professionals for specialized guidance.
        </p>

        <h2>11. Data Retention and Deletion</h2>
        <p>
          Videos and user data are retained for the duration of your account plus 30 days. 
          Users can request data deletion at any time through account settings or by contacting support.
        </p>

        <h2>12. Termination</h2>
        <p>
          Either party may terminate this agreement at any time. Upon termination, your access 
          to the Service will cease, and your data will be deleted according to our retention policy.
        </p>

        <h2>13. Governing Law</h2>
        <p>
          These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved 
          through binding arbitration.
        </p>

        <h2>14. Changes to Terms</h2>
        <p>
          We may update these terms from time to time. Users will be notified of significant changes 
          via email or platform notification.
        </p>

        <h2>15. Contact Information</h2>
        <p>
          For questions about these terms, contact us at: support@tape2tape.com
        </p>
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <div className="card" style={{ padding: "2rem" }}>
        <h1>Privacy Policy</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2>1. Information We Collect</h2>
        
        <h3>Account Information</h3>
        <ul>
          <li>Email address and display name</li>
          <li>Profile information and bio</li>
          <li>Account preferences and settings</li>
        </ul>

        <h3>Content Information</h3>
        <ul>
          <li>Videos uploaded to the platform</li>
          <li>Annotations and feedback created by coaches</li>
          <li>Usage data and platform interactions</li>
        </ul>

        <h3>Technical Information</h3>
        <ul>
          <li>IP address and browser information</li>
          <li>Device information and operating system</li>
          <li>Usage patterns and feature interactions</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use collected information to:</p>
        <ul>
          <li>Provide and improve the Service</li>
          <li>Connect clients with appropriate coaches</li>
          <li>Process payments and manage subscriptions</li>
          <li>Send important service notifications</li>
          <li>Ensure platform security and prevent abuse</li>
          <li>Analyze usage patterns to improve features</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>We do not sell personal information. We may share information in these situations:</p>
        <ul>
          <li><strong>With Coaches:</strong> Client videos are shared with assigned coaches for review</li>
          <li><strong>Service Providers:</strong> Third-party services like payment processing and hosting</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect user safety</li>
          <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your data, including:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Secure authentication and access controls</li>
          <li>Regular security audits and monitoring</li>
          <li>Limited access to personal information by employees</li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>
          We retain your information for as long as your account is active plus 30 days after 
          account deletion. Videos and reviews may be retained longer if requested by users 
          for personal use.
        </p>

        <h2>6. Your Rights and Choices</h2>
        
        <h3>Access and Control</h3>
        <ul>
          <li>View and download your personal data</li>
          <li>Update or correct your information</li>
          <li>Delete your account and associated data</li>
          <li>Control notification preferences</li>
        </ul>

        <h3>Cookie Policy</h3>
        <p>
          We use essential cookies for platform functionality and optional cookies for analytics. 
          You can control cookie preferences through your browser settings.
        </p>

        <h2>7. Third-Party Services</h2>
        <p>Our Service integrates with:</p>
        <ul>
          <li><strong>Firebase:</strong> Data storage and authentication</li>
          <li><strong>Stripe:</strong> Payment processing</li>
          <li><strong>Google Services:</strong> Authentication and storage</li>
        </ul>
        <p>
          These services have their own privacy policies that govern their use of your information.
        </p>

        <h2>8. International Data Transfers</h2>
        <p>
          Your information may be processed and stored in countries other than your own. 
          We ensure appropriate safeguards are in place for international data transfers.
        </p>

        <h2>9. Children's Privacy</h2>
        <p>
          Our Service is not intended for children under 13. We do not knowingly collect 
          personal information from children under 13. If you believe we have collected 
          such information, please contact us immediately.
        </p>

        <h2>10. California Privacy Rights</h2>
        <p>
          California residents have additional rights under the CCPA, including the right to 
          know what personal information we collect, the right to delete personal information, 
          and the right to opt-out of the sale of personal information (which we do not engage in).
        </p>

        <h2>11. GDPR Rights (EU Residents)</h2>
        <p>
          EU residents have rights under the GDPR, including data access, rectification, 
          erasure, portability, and the right to object to processing.
        </p>

        <h2>12. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify users of 
          significant changes via email or platform notification.
        </p>

        <h2>13. Contact Us</h2>
        <p>
          For privacy-related questions or to exercise your rights, contact us at:
        </p>
        <ul>
          <li>Email: privacy@tape2tape.com</li>
          <li>Support: support@tape2tape.com</li>
        </ul>

        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px"
        }}>
          <h4>Manage Your Data</h4>
          <p style={{ marginBottom: "0.5rem" }}>
            You can export or delete your personal data at any time through our self-service tools:
          </p>
          <a 
            href="/data-management" 
            className="btn btn-primary btn-sm"
            style={{ textDecoration: "none" }}
          >
            Access Data Management Tools
          </a>
        </div>
      </div>
    </div>
  );
}

// Legal footer component
export function LegalFooter() {
  return (
    <footer style={{
      backgroundColor: "var(--surface)",
      borderTop: "1px solid var(--border-color)",
      padding: "2rem 0",
      marginTop: "4rem"
    }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem"
        }}>
          <div>
            <h4>Tape2Tape</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Professional video analysis platform connecting athletes with expert coaches.
            </p>
          </div>
          <div>
            <h4>Legal</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><a href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Terms of Service</a></li>
              <li><a href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Privacy Policy</a></li>
              <li><a href="/support" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Support</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>support@tape2tape.com</li>
              <li style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Available 9 AM - 5 PM EST</li>
            </ul>
          </div>
        </div>
        <div style={{
          textAlign: "center",
          paddingTop: "2rem",
          borderTop: "1px solid var(--border-color)",
          color: "var(--text-secondary)",
          fontSize: "0.9rem"
        }}>
          © {new Date().getFullYear()} Tape2Tape. All rights reserved.
        </div>
      </div>
    </footer>
  );
}