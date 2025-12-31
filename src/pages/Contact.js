import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save contact form submission to Firestore
      await addDoc(collection(db, 'contact-submissions'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'new'
      });

      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: 'general', message: '' });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to submit. Please try again or email us directly at support@tape2tape.com');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
        padding: '80px 40px'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Get in Touch
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#999',
          marginBottom: '60px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto 60px'
        }}>
          Have a question, feedback, or need help? We're here for you. Send us a message and we'll respond within 24 hours.
        </p>

        {submitted ? (
          <div style={{
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            border: '2px solid #00ff00',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
              Message Sent!
            </h2>
            <p style={{ color: '#999' }}>
              We'll get back to you within 24 hours at {formData.email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              backgroundColor: '#111',
              padding: '40px',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              {/* Name */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#ccc'
                }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#ccc'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="john@example.com"
                />
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#ccc'
                }}>
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Report a Bug</option>
                  <option value="partnership">Partnership Opportunity</option>
                </select>
              </div>

              {/* Message */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#ccc'
                }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Tell us how we can help..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '18px',
                  backgroundColor: submitting ? '#666' : '#ff0000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  transition: 'background-color 0.3s ease'
                }}
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        )}

        {/* Additional Contact Info */}
        <div style={{
          marginTop: '60px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '15px' }}>📧</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
              Email Us
            </h3>
            <a 
              href="mailto:support@tape2tape.com"
              style={{ color: '#999', textDecoration: 'none' }}
            >
              support@tape2tape.com
            </a>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '15px' }}>📚</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
              Help Center
            </h3>
            <a 
              href="/faq"
              style={{ color: '#ff0000', textDecoration: 'none' }}
            >
              Visit FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}