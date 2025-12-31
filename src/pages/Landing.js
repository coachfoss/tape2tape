import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function Landing() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth', { state: { email } });
    }
  };

  const features = [
    {
      icon: '✏️',
      title: 'Simple Drawing Tools',
      description: 'Draw lines and freehand annotations directly on video. One color, no complexity - just what coaches need.'
    },
    {
      icon: '📱',
      title: 'Works Everywhere',
      description: 'Touch-optimized for iPads, tablets, and phones. Pinch to zoom, drag to pan - feels native on every device.'
    },
    {
      icon: '🎥',
      title: 'Record Your Analysis',
      description: 'Record your screen with voice and facecam while you review. Athletes see exactly what you mean.'
    },
    {
      icon: '⚡',
      title: 'Frame-by-Frame Control',
      description: 'Step through video frame by frame. Variable speed playback (0.25x, 0.5x, 1x) for detailed technique analysis.'
    },
    {
      icon: '🔍',
      title: 'Zoom & Pan',
      description: 'Zoom up to 300% to focus on specific details. Smooth pinch-to-zoom and pan controls make it effortless.'
    },
    {
      icon: '💾',
      title: 'Cloud Storage',
      description: 'All videos and reviews saved automatically. Access from any device, share with athletes instantly.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      features: [
        '3 free video trials',
        'Unlimited video reviews after trial',
        'All drawing tools',
        'Cloud storage (50GB)',
        'Priority email support',
        'Download reviews',
        'Custom branding'
      ],
      cta: 'Start Free Trial',
      highlighted: true,
      badge: 'Most Popular'
    },
    {
      name: 'Team',
      price: '$99',
      period: 'per month',
      features: [
        'Everything in Pro',
        'Up to 10 coaches',
        'Cloud storage (500GB)',
        'Team management',
        'Advanced analytics',
        'Phone support',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  const testimonials = [
    {
      name: 'Mike Johnson',
      role: 'Youth Soccer Coach',
      text: 'Tape2Tape completely changed how I coach. My players understand exactly what to improve because they can see my annotations frame by frame.',
      avatar: '⚽'
    },
    {
      name: 'Sarah Martinez',
      role: 'Basketball Skills Trainer',
      text: 'The frame-by-frame analysis is incredible. I can show players the exact moment their form breaks down. Worth every penny.',
      avatar: '🏀'
    },
    {
      name: 'Coach Williams',
      role: 'High School Football',
      text: 'Touch controls on my iPad make reviewing game film so much faster. I used to spend hours on desktop software - now it takes minutes.',
      avatar: '🏈'
    }
  ];

  return (
    <div style={{ backgroundColor: '#000', color: 'white', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 100
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff0000' }}>
          Tape2Tape
        </div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'white', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ color: 'white', textDecoration: 'none' }}>Pricing</a>
          <a href="/faq" style={{ color: 'white', textDecoration: 'none' }}>FAQ</a>
          <a href="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
          <button
            onClick={() => user ? navigate('/dashboard') : navigate('/auth')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {user ? 'Dashboard' : 'Log In'}
          </button>
          {!user && (
            <button
              onClick={() => navigate('/auth')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff0000',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '100px 40px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: 'bold',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          Video Analysis for Coaches<br />
          <span style={{ color: '#ff0000' }}>Made Simple</span>
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#999',
          marginBottom: '40px',
          maxWidth: '700px',
          margin: '0 auto 40px'
        }}>
          Draw on video, record your analysis, and help athletes improve faster. 
          Works perfectly on iPad, tablet, and desktop.
        </p>
        
        {/* Email Capture */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '15px 20px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              width: '300px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleGetStarted}
            style={{
              padding: '15px 40px',
              fontSize: '16px',
              backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Start Free Trial
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#666' }}>
          No credit card required • 3 free reviews to start
        </p>

        {/* Demo Video Placeholder */}
        <div style={{
          marginTop: '60px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.1)',
          backgroundColor: '#111',
          aspectRatio: '16/9',
          maxWidth: '900px',
          margin: '60px auto 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎥</div>
            <p style={{ fontSize: '18px', color: '#999' }}>
              Demo Video Coming Soon
            </p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Watch a 60-second walkthrough of Tape2Tape in action
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '100px 40px',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            Everything You Need to Coach Better
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px'
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                padding: '30px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '15px' }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#999', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Guide */}
      <section style={{
        padding: '100px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '42px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          Get Started in 3 Simple Steps
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#ff0000',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0 auto 20px'
            }}>
              1
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '10px' }}>
              Upload Video
            </h3>
            <p style={{ color: '#999', lineHeight: '1.6' }}>
              Drag and drop or select video files from your device. Supports all common formats.
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#ff0000',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0 auto 20px'
            }}>
              2
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '10px' }}>
              Analyze & Annotate
            </h3>
            <p style={{ color: '#999', lineHeight: '1.6' }}>
              Use drawing tools to highlight technique. Record your voice while you analyze.
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#ff0000',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0 auto 20px'
            }}>
              3
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '10px' }}>
              Share with Athletes
            </h3>
            <p style={{ color: '#999', lineHeight: '1.6' }}>
              Send review links instantly. Athletes can watch on any device, anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: '100px 40px',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            Loved by Coaches
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} style={{
                padding: '30px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>
                  {testimonial.avatar}
                </div>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  color: '#ccc'
                }}>
                  "{testimonial.text}"
                </p>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{testimonial.name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '100px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '42px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Simple, Transparent Pricing
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: '18px',
          color: '#999',
          marginBottom: '60px'
        }}>
          Start free, upgrade when you're ready
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          {pricingPlans.map((plan, index) => (
            <div key={index} style={{
              padding: '40px',
              backgroundColor: plan.highlighted ? 'rgba(255,0,0,0.05)' : 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: plan.highlighted ? '2px solid #ff0000' : '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#ff0000',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {plan.badge}
                </div>
              )}
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                {plan.name}
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '42px', fontWeight: 'bold' }}>
                  {plan.price}
                </span>
                <span style={{ color: '#666', marginLeft: '8px' }}>
                  {plan.period}
                </span>
              </div>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '30px'
              }}>
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} style={{
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: '#ccc'
                  }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (plan.cta === 'Contact Sales') {
                    navigate('/contact');
                  } else if (user) {
                    navigate('/subscription');
                  } else {
                    navigate('/auth');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: plan.highlighted ? '#ff0000' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: plan.highlighted ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '100px 40px',
        textAlign: 'center',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{
          fontSize: '42px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          Ready to Transform Your Coaching?
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#999',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Join hundreds of coaches using Tape2Tape to help athletes reach their potential
        </p>
        <button
          onClick={() => user ? navigate('/subscription') : navigate('/auth')}
          style={{
            padding: '20px 50px',
            fontSize: '18px',
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Start Your Free Trial
        </button>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
          No credit card required
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '60px 40px 40px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: '#000'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#ff0000',
              marginBottom: '15px'
            }}>
              Tape2Tape
            </div>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Video analysis tools built for coaches who want to make a real impact.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="#features" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>Features</a>
              <a href="#pricing" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>Pricing</a>
              <a href="/faq" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>FAQ</a>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="/contact" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>Contact</a>
              <a href="/terms" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</a>
              <a href="/privacy" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Connect</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="https://twitter.com/tape2tape" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>Twitter</a>
              <a href="https://instagram.com/tape2tape" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>Instagram</a>
              <a href="mailto:support@tape2tape.com" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>Email</a>
            </div>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          paddingTop: '40px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          color: '#666',
          fontSize: '14px'
        }}>
          © 2025 Tape2Tape. All rights reserved.
        </div>
      </footer>
    </div>
  );
}