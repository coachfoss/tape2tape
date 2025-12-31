import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: 'white'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div 
          onClick={() => navigate('/')}
          style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#ff0000',
            cursor: 'pointer'
          }}
        >
          Tape2Tape
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </nav>

      {/* Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 40px'
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#666', marginBottom: '40px' }}>
          Last Updated: January 1, 2025
        </p>

        <div style={{ color: '#ccc', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '30px', fontSize: '16px' }}>
            At Tape2Tape, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our video analysis service.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            1. Information We Collect
          </h2>
          
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '25px', marginBottom: '10px', color: 'white' }}>
            Personal Information
          </h3>
          <p style={{ marginBottom: '10px' }}>
            When you create an account, we collect:
          </p>
          <ul style={{ marginLeft: '30px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>Name and email address</li>
            <li style={{ marginBottom: '10px' }}>Profile information (bio, sport, organization, phone number)</li>
            <li style={{ marginBottom: '10px' }}>Payment information (processed securely through Stripe)</li>
            <li style={{ marginBottom: '10px' }}>Account credentials (encrypted)</li>
          </ul>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '25px', marginBottom: '10px', color: 'white' }}>
            Usage Data
          </h3>
          <p style={{ marginBottom: '10px' }}>
            We automatically collect:
          </p>
          <ul style={{ marginLeft: '30px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>Device information (browser type, operating system, device type)</li>
            <li style={{ marginBottom: '10px' }}>IP address and general location</li>
            <li style={{ marginBottom: '10px' }}>Usage patterns (features used, time spent, pages visited)</li>
            <li style={{ marginBottom: '10px' }}>Performance data (load times, errors)</li>
          </ul>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '25px', marginBottom: '10px', color: 'white' }}>
            Video Content
          </h3>
          <p style={{ marginBottom: '20px' }}>
            We store videos and annotations you upload to provide the Service. This includes the video files themselves, your annotations, recorded analyses, and any metadata associated with them.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            2. How We Use Your Information
          </h2>
          <p style={{ marginBottom: '10px' }}>
            We use the information we collect to:
          </p>
          <ul style={{ marginLeft: '30px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>Provide, maintain, and improve the Service</li>
            <li style={{ marginBottom: '10px' }}>Process your transactions and manage subscriptions</li>
            <li style={{ marginBottom: '10px' }}>Send you important updates about the Service</li>
            <li style={{ marginBottom: '10px' }}>Respond to your support requests and communications</li>
            <li style={{ marginBottom: '10px' }}>Analyze usage patterns to improve user experience</li>
            <li style={{ marginBottom: '10px' }}>Detect and prevent fraud, abuse, and security issues</li>
            <li style={{ marginBottom: '10px' }}>Comply with legal obligations</li>
          </ul>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            3. How We Share Your Information
          </h2>
          <p style={{ marginBottom: '20px' }}>
            We do not sell your personal information. We may share your information only in the following circumstances:
          </p>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '25px', marginBottom: '10px', color: 'white' }}>
            Service Providers
          </h3>
          <p style={{ marginBottom: '10px' }}>
            We work with third-party service providers who help us operate the Service:
          </p>
          <ul style={{ marginLeft: '30px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>Firebase (Google) - hosting, database, and authentication</li>
            <li style={{ marginBottom: '10px' }}>Stripe - payment processing</li>
            <li style={{ marginBottom: '10px' }}>SendGrid - email delivery</li>
            <li style={{ marginBottom: '10px' }}>Google Analytics - usage analytics</li>
          </ul>
          <p style={{ marginBottom: '20px' }}>
            These providers have access only to the information necessary to perform their services and are obligated to protect your data.
          </p>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '25px', marginBottom: '10px', color: 'white' }}>
            Legal Requirements
          </h3>
          <p style={{ marginBottom: '20px' }}>
            We may disclose your information if required by law or in response to valid legal requests from law enforcement or government authorities.
          </p>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '25px', marginBottom: '10px', color: 'white' }}>
            Business Transfers
          </h3>
          <p style={{ marginBottom: '20px' }}>
            If Tape2Tape is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            4. Data Security
          </h2>
          <p style={{ marginBottom: '10px' }}>
            We implement industry-standard security measures to protect your information:
          </p>
          <ul style={{ marginLeft: '30px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>All data is encrypted in transit using TLS/SSL</li>
            <li style={{ marginBottom: '10px' }}>Videos and data are encrypted at rest</li>
            <li style={{ marginBottom: '10px' }}>Regular security audits and updates</li>
            <li style={{ marginBottom: '10px' }}>Secure authentication and password hashing</li>
            <li style={{ marginBottom: '10px' }}>Limited employee access to user data</li>
          </ul>
          <p style={{ marginBottom: '20px' }}>
            However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            5. Data Retention
          </h2>
          <p style={{ marginBottom: '20px' }}>
            We retain your information for as long as your account is active or as needed to provide the Service. When you delete your account, we permanently delete your personal information and videos within 30 days, except where we're required to retain data for legal or regulatory purposes.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            6. Your Rights and Choices
          </h2>
          <p style={{ marginBottom: '10px' }}>
            You have the following rights regarding your information:
          </p>
          <ul style={{ marginLeft: '30px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}><strong>Access:</strong> Request a copy of your personal information</li>
            <li style={{ marginBottom: '10px' }}><strong>Correction:</strong> Update or correct your information from your account settings</li>
            <li style={{ marginBottom: '10px' }}><strong>Deletion:</strong> Delete your account and all associated data</li>
            <li style={{ marginBottom: '10px' }}><strong>Opt-Out:</strong> Unsubscribe from marketing emails (service emails are still required)</li>
            <li style={{ marginBottom: '10px' }}><strong>Data Portability:</strong> Export your data in a common format</li>
          </ul>
          <p style={{ marginBottom: '20px' }}>
            To exercise these rights, contact us at privacy@tape2tape.com or use your account settings.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            7. Cookies and Tracking Technologies
          </h2>
          <p style={{ marginBottom: '20px' }}>
            We use cookies and similar technologies to enhance your experience, analyze usage, and remember your preferences. You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features of the Service.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            8. Children's Privacy
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Tape2Tape is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately at privacy@tape2tape.com.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            9. International Users
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Tape2Tape is based in the United States. If you access the Service from outside the U.S., your information will be transferred to and processed in the United States, where data protection laws may differ from your country.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            10. California Privacy Rights
          </h2>
          <p style={{ marginBottom: '20px' }}>
            If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your information, and the right to opt-out of the sale of your information. Note: We do not sell personal information.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            11. Changes to This Privacy Policy
          </h2>
          <p style={{ marginBottom: '20px' }}>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on the Service. Your continued use after changes are posted constitutes acceptance of the updated policy.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            12. Contact Us
          </h2>
          <p style={{ marginBottom: '20px' }}>
            If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
          </p>
          <p style={{ marginBottom: '5px' }}>
            Email: privacy@tape2tape.com
          </p>
          <p style={{ marginBottom: '5px' }}>
            Support: support@tape2tape.com
          </p>
          <p style={{ marginBottom: '40px' }}>
            Website: www.tape2tape.com/contact
          </p>

          <div style={{
            marginTop: '60px',
            padding: '30px',
            backgroundColor: '#111',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: 'white' }}>
              Your Privacy Matters
            </h3>
            <p style={{ fontSize: '14px', color: '#999' }}>
              We're committed to protecting your privacy and being transparent about how we handle your data. If you have any questions or concerns, please don't hesitate to reach out to our privacy team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}