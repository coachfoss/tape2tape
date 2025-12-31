import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
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
          Terms of Service
        </h1>
        <p style={{ color: '#666', marginBottom: '40px' }}>
          Last Updated: January 1, 2025
        </p>

        <div style={{ color: '#ccc', lineHeight: '1.8' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            1. Acceptance of Terms
          </h2>
          <p style={{ marginBottom: '20px' }}>
            By accessing and using Tape2Tape ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            2. Description of Service
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Tape2Tape provides video analysis and annotation tools for coaches, trainers, and educators. The Service allows users to upload videos, add annotations, record analysis, and share reviews with athletes or students.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            3. User Accounts
          </h2>
          <p style={{ marginBottom: '10px' }}>
            You must create an account to use certain features of the Service. You agree to:
          </p>
          <ul style={{ marginLeft: '30px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>Provide accurate, current, and complete information during registration</li>
            <li style={{ marginBottom: '10px' }}>Maintain and promptly update your account information</li>
            <li style={{ marginBottom: '10px' }}>Maintain the security of your account credentials</li>
            <li style={{ marginBottom: '10px' }}>Accept responsibility for all activities that occur under your account</li>
            <li style={{ marginBottom: '10px' }}>Notify us immediately of any unauthorized use of your account</li>
          </ul>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            4. Subscription Plans and Billing
          </h2>
          <p style={{ marginBottom: '10px' }}>
            <strong>Free Plan:</strong> Limited to 3 video reviews per month with 1GB storage.
          </p>
          <p style={{ marginBottom: '10px' }}>
            <strong>Pro Plan:</strong> $29/month for unlimited reviews and 50GB storage.
          </p>
          <p style={{ marginBottom: '10px' }}>
            <strong>Team Plan:</strong> $99/month for up to 10 coaches and 500GB storage.
          </p>
          <p style={{ marginBottom: '20px' }}>
            Subscriptions are billed monthly and automatically renew unless cancelled. You may cancel at any time from your account settings. Cancellations take effect at the end of the current billing period.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            5. Refund Policy
          </h2>
          <p style={{ marginBottom: '20px' }}>
            We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied with the Service, contact support@tape2tape.com within 14 days of purchase for a full refund. After 14 days, subscriptions are non-refundable.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            6. User Content
          </h2>
          <p style={{ marginBottom: '10px' }}>
            You retain all rights to the videos and content you upload to the Service. By uploading content, you grant Tape2Tape a limited license to:
          </p>
          <ul style={{ marginLeft: '30px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>Store and process your content to provide the Service</li>
            <li style={{ marginBottom: '10px' }}>Display your content back to you and anyone you choose to share it with</li>
            <li style={{ marginBottom: '10px' }}>Create backups and derivatives necessary for Service operation</li>
          </ul>
          <p style={{ marginBottom: '20px' }}>
            We will never share, sell, or use your content for any purpose other than providing the Service to you.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            7. Prohibited Uses
          </h2>
          <p style={{ marginBottom: '10px' }}>
            You agree not to use the Service to:
          </p>
          <ul style={{ marginLeft: '30px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>Upload illegal, harmful, threatening, abusive, or offensive content</li>
            <li style={{ marginBottom: '10px' }}>Violate any applicable laws or regulations</li>
            <li style={{ marginBottom: '10px' }}>Infringe on intellectual property rights of others</li>
            <li style={{ marginBottom: '10px' }}>Transmit viruses, malware, or harmful code</li>
            <li style={{ marginBottom: '10px' }}>Attempt to gain unauthorized access to the Service or other users' accounts</li>
            <li style={{ marginBottom: '10px' }}>Use the Service for any commercial purpose without authorization</li>
            <li style={{ marginBottom: '10px' }}>Interfere with or disrupt the Service or servers</li>
          </ul>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            8. Content Ownership and Copyright
          </h2>
          <p style={{ marginBottom: '20px' }}>
            You are solely responsible for ensuring you have the right to upload and share any videos you submit to the Service. You must have consent from all individuals appearing in videos, especially minors. Tape2Tape is not liable for copyright infringement or privacy violations resulting from your uploaded content.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            9. Service Availability
          </h2>
          <p style={{ marginBottom: '20px' }}>
            We strive to maintain 99.9% uptime but do not guarantee uninterrupted access to the Service. We may temporarily suspend the Service for maintenance, updates, or unforeseen technical issues. We will not be liable for any losses resulting from Service downtime.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            10. Data and Privacy
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand how we collect, use, and protect your information.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            11. Termination
          </h2>
          <p style={{ marginBottom: '20px' }}>
            We reserve the right to terminate or suspend your account at any time for violation of these Terms or for any other reason at our sole discretion. Upon termination, your right to use the Service will immediately cease. You may terminate your account at any time from your account settings.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            12. Limitation of Liability
          </h2>
          <p style={{ marginBottom: '20px' }}>
            To the maximum extent permitted by law, Tape2Tape shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            13. Disclaimers
          </h2>
          <p style={{ marginBottom: '20px' }}>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            14. Changes to Terms
          </h2>
          <p style={{ marginBottom: '20px' }}>
            We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            15. Governing Law
          </h2>
          <p style={{ marginBottom: '20px' }}>
            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved in the courts of the United States.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '15px', color: 'white' }}>
            16. Contact Information
          </h2>
          <p style={{ marginBottom: '20px' }}>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p style={{ marginBottom: '5px' }}>
            Email: legal@tape2tape.com
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
            <p style={{ fontSize: '14px', color: '#999' }}>
              By using Tape2Tape, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}