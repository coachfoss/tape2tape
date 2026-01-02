import React from 'react';

export default function Privacy() {
  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '40px 20px',
      lineHeight: '1.8',
      color: '#333'
    }}>
      <h1 style={{ 
        fontSize: '36px', 
        fontWeight: 'bold', 
        marginBottom: '12px',
        color: '#ff0000'
      }}>
        Privacy Policy
      </h1>
      <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px' }}>
        Last Updated: December 31, 2024
      </p>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '32px',
        borderLeft: '4px solid #ff0000'
      }}>
        <p style={{ margin: 0, fontSize: '16px' }}>
          Tape2Tape ("we," "our," or "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your 
          information when you use our video coaching platform.
        </p>
      </div>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          1. Information We Collect
        </h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>
          Personal Information
        </h3>
        <p>When you create an account, we collect:</p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Name and email address</li>
          <li>Profile information (sport, organization, bio, social media handles)</li>
          <li>Profile photo (optional)</li>
          <li>Phone number (optional)</li>
          <li>Payment information (processed securely through Stripe)</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>
          Usage Information
        </h3>
        <p>We automatically collect:</p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Video uploads and review data</li>
          <li>Coach-athlete connections</li>
          <li>Usage statistics and interactions with our platform</li>
          <li>Device information and IP addresses</li>
          <li>Browser type and operating system</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>
          Video Content
        </h3>
        <p>
          Videos uploaded to Tape2Tape are stored securely using Firebase Storage. 
          Videos are only accessible to the uploading athlete and their connected coaches.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          2. How We Use Your Information
        </h2>
        <p>We use your information to:</p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Provide and maintain our video coaching services</li>
          <li>Process payments and manage subscriptions</li>
          <li>Send email notifications about video uploads and reviews</li>
          <li>Facilitate coach-athlete connections</li>
          <li>Improve and optimize our platform</li>
          <li>Communicate with you about updates and new features</li>
          <li>Comply with legal obligations</li>
          <li>Prevent fraud and enhance security</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          3. Information Sharing and Disclosure
        </h2>
        <p>We do not sell your personal information. We may share your information with:</p>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>
          Service Providers
        </h3>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li><strong>Firebase/Google Cloud:</strong> Hosting, database, and file storage</li>
          <li><strong>Stripe:</strong> Payment processing</li>
          <li><strong>Resend:</strong> Email delivery services</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>
          Connected Users
        </h3>
        <p>
          When you connect with a coach using their coach code, certain profile information 
          (name, email, sport) is shared to facilitate the coaching relationship.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>
          Legal Requirements
        </h3>
        <p>
          We may disclose your information if required by law, court order, or to protect 
          our rights and safety or the rights and safety of others.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          4. Data Security
        </h2>
        <p>
          We implement industry-standard security measures to protect your information:
        </p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Encryption in transit and at rest</li>
          <li>Secure authentication through Firebase Authentication</li>
          <li>PCI-compliant payment processing through Stripe</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and monitoring</li>
        </ul>
        <p style={{ 
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          borderLeft: '4px solid #ffc107'
        }}>
          <strong>Note:</strong> No method of transmission over the internet is 100% secure. 
          While we strive to protect your information, we cannot guarantee absolute security.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          5. Your Rights and Choices
        </h2>
        <p>Under US privacy laws, you have the right to:</p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li><strong>Access:</strong> Request a copy of your personal information</li>
          <li><strong>Correction:</strong> Update or correct your profile information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
          <li><strong>Data Portability:</strong> Export your videos and data</li>
        </ul>
        <p style={{ marginTop: '16px' }}>
          To exercise these rights, please contact us at{' '}
          <a href="mailto:privacy@tape2tape.com" style={{ color: '#ff0000', fontWeight: '600' }}>
            privacy@tape2tape.com
          </a>
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          6. Children's Privacy
        </h2>
        <p>
          Tape2Tape is designed for athletes of all ages, including minors under 13. 
          We comply with the Children's Online Privacy Protection Act (COPPA).
        </p>
        <p style={{ marginTop: '12px' }}>
          <strong>For users under 13:</strong>
        </p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Parental consent is required before account creation</li>
          <li>We collect only necessary information (name, email)</li>
          <li>Parents can review, update, or delete their child's information</li>
          <li>We do not share children's information with third parties for marketing</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          Parents can contact us at{' '}
          <a href="mailto:parents@tape2tape.com" style={{ color: '#ff0000', fontWeight: '600' }}>
            parents@tape2tape.com
          </a>{' '}
          to review or manage their child's account.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          7. Data Retention
        </h2>
        <p>We retain your information for as long as your account is active or as needed to provide services.</p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Account data: Until account deletion</li>
          <li>Video content: Until manually deleted by user</li>
          <li>Payment records: 7 years (legal requirement)</li>
          <li>Email communications: Until you unsubscribe</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          8. State-Specific Privacy Rights
        </h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>
          California Residents (CCPA/CPRA)
        </h3>
        <p>California residents have additional rights:</p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Right to know what personal information is collected</li>
          <li>Right to delete personal information</li>
          <li>Right to opt-out of the sale of personal information (we do not sell data)</li>
          <li>Right to non-discrimination for exercising privacy rights</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>
          Virginia, Colorado, Connecticut, and Utah Residents
        </h3>
        <p>Residents of these states have rights to:</p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Confirm whether we process your personal data</li>
          <li>Access your personal data</li>
          <li>Correct inaccuracies in your personal data</li>
          <li>Delete your personal data</li>
          <li>Obtain a copy of your personal data</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          9. Cookies and Tracking
        </h2>
        <p>We use essential cookies and similar technologies to:</p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Keep you logged in</li>
          <li>Remember your preferences</li>
          <li>Understand how you use our platform</li>
          <li>Improve performance and user experience</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          You can control cookies through your browser settings, but disabling them may 
          affect platform functionality.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          10. Changes to This Privacy Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any 
          changes by:
        </p>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Posting the new Privacy Policy on this page</li>
          <li>Updating the "Last Updated" date</li>
          <li>Sending you an email notification for material changes</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#ff0000'
        }}>
          11. Contact Us
        </h2>
        <p>If you have questions about this Privacy Policy or our privacy practices:</p>
        <div style={{ 
          marginTop: '16px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Email:</strong>{' '}
            <a href="mailto:privacy@tape2tape.com" style={{ color: '#ff0000' }}>
              privacy@tape2tape.com
            </a>
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Mail:</strong> Tape2Tape Privacy Team
          </p>
          <p style={{ margin: 0 }}>
            Minneapolis, Minnesota, United States
          </p>
        </div>
      </section>

      <div style={{ 
        marginTop: '48px',
        padding: '24px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        borderLeft: '4px solid #007bff'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>
          💡 Your Privacy Matters
        </h3>
        <p style={{ margin: 0 }}>
          We're committed to transparency and protecting your data. If you ever have 
          concerns about how we handle your information, please don't hesitate to reach out.
        </p>
      </div>
    </div>
  );
}