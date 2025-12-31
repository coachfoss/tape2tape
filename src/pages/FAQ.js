import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FAQ() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategory, setOpenCategory] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  const categories = [
    {
      id: 'getting-started',
      icon: '🚀',
      title: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click the "Get Started" button on the homepage, enter your email and create a password. You\'ll get 3 free video reviews to start - no credit card required.'
        },
        {
          q: 'What video formats are supported?',
          a: 'We support all common video formats including MP4, MOV, AVI, and WebM. Videos can be up to 2GB on the Free plan, 10GB on Pro, and 25GB on Team plans.'
        },
        {
          q: 'How do I upload my first video?',
          a: 'From your dashboard, click "Upload Video" or drag and drop a video file. Once uploaded, click on the video to open the editor and start annotating.'
        },
        {
          q: 'Can I use this on my phone or tablet?',
          a: 'Absolutely! Tape2Tape is fully optimized for touch devices including iPads, Android tablets, and smartphones. All drawing tools work perfectly with touch input.'
        }
      ]
    },
    {
      id: 'video-editor',
      icon: '✏️',
      title: 'Using the Video Editor',
      questions: [
        {
          q: 'How do I draw on videos?',
          a: 'Click "Draw Mode" to enable annotation tools. Choose between Line (for straight lines) or Draw (for freehand). Click and drag on the video to draw. Double-tap on mobile to toggle draw mode.'
        },
        {
          q: 'How does the eraser work?',
          a: 'Select the Eraser tool, then click or tap on any annotation to remove it. You can also drag the eraser over multiple annotations to remove them quickly.'
        },
        {
          q: 'Can I zoom in on specific parts of the video?',
          a: 'Yes! Use the +/- buttons to zoom in and out. On touch devices, pinch to zoom. When zoomed, drag to pan around the video. Click "Reset" to return to normal view.'
        },
        {
          q: 'How do I review frame-by-frame?',
          a: 'Use the ◀ and ▶ buttons next to the play button to step backward or forward one frame at a time. Perfect for analyzing technique in detail.'
        },
        {
          q: 'What are the playback speed options?',
          a: 'You can watch at 0.25x (quarter speed), 0.5x (half speed), or 1x (normal speed). Slower speeds are great for catching subtle technique issues.'
        },
        {
          q: 'Can I undo my annotations?',
          a: 'Yes! Click the "Undo" button to remove the last annotation. Use "Clear" to remove all annotations at once.'
        }
      ]
    },
    {
      id: 'recording',
      icon: '🎥',
      title: 'Recording Reviews',
      questions: [
        {
          q: 'How do I record my analysis?',
          a: 'Click the "Record" button. Your browser will ask for camera and microphone permission. Once granted, everything you see on screen (including your annotations) will be recorded along with your voice and facecam.'
        },
        {
          q: 'Where does my facecam appear?',
          a: 'Your facecam appears in the top-right corner of the recording in a small picture-in-picture window. Athletes can see both the video analysis and your reactions.'
        },
        {
          q: 'Can I record without a webcam?',
          a: 'You need a webcam and microphone for the recording feature. However, you can still create annotations and save them without recording.'
        },
        {
          q: 'Where are recordings saved?',
          a: 'Recordings are automatically saved to your cloud storage and appear in your dashboard. You can download or share them with athletes directly.'
        }
      ]
    },
    {
      id: 'sharing',
      icon: '📤',
      title: 'Sharing & Collaboration',
      questions: [
        {
          q: 'How do I share reviews with athletes?',
          a: 'After saving or recording your review, click "Share" to generate a link. Athletes can watch the review without needing a Tape2Tape account.'
        },
        {
          q: 'Can athletes respond or ask questions?',
          a: 'Currently, reviews are one-way. Athletes can watch but not comment. We\'re working on two-way communication features for future updates.'
        },
        {
          q: 'Is there a mobile app?',
          a: 'The web version works great on mobile browsers. A dedicated iOS and Android app is planned for 2025.'
        }
      ]
    },
    {
      id: 'billing',
      icon: '💳',
      title: 'Billing & Subscriptions',
      questions: [
        {
          q: 'What\'s included in the Free plan?',
          a: 'The Free plan includes 3 video reviews per month, basic drawing tools, 1GB of cloud storage, and email support. Perfect for coaches just getting started.'
        },
        {
          q: 'When should I upgrade to Pro?',
          a: 'Upgrade to Pro ($29/month) when you need unlimited reviews, 50GB storage, priority support, and the ability to download your reviews.'
        },
        {
          q: 'What\'s the difference between Pro and Team?',
          a: 'Team ($99/month) includes everything in Pro plus support for up to 10 coaches, 500GB storage, team management tools, advanced analytics, and phone support.'
        },
        {
          q: 'Can I cancel anytime?',
          a: 'Yes! Cancel your subscription anytime from your account settings. You\'ll keep access until the end of your billing period, then automatically move to the Free plan.'
        },
        {
          q: 'Do you offer refunds?',
          a: 'We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, email support@tape2tape.com for a full refund.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor Stripe.'
        }
      ]
    },
    {
      id: 'technical',
      icon: '🔧',
      title: 'Technical Support',
      questions: [
        {
          q: 'What browsers are supported?',
          a: 'We support the latest versions of Chrome, Firefox, Safari, and Edge. Chrome provides the best experience overall.'
        },
        {
          q: 'Why isn\'t my camera/microphone working?',
          a: 'Make sure you\'ve granted browser permissions for camera and microphone access. Check your browser settings and ensure no other app is using your camera.'
        },
        {
          q: 'My video won\'t upload. What should I do?',
          a: 'Ensure your video file is under the size limit for your plan (2GB Free, 10GB Pro, 25GB Team). Try a different browser or compress the video file.'
        },
        {
          q: 'The drawing tools feel laggy on my device.',
          a: 'Close other browser tabs and applications. If using an older device, try reducing the video quality or zoom level. Contact support if issues persist.'
        },
        {
          q: 'How do I report a bug?',
          a: 'Use the Contact form and select "Report a Bug" as the subject. Include details about what happened, your browser/device, and any error messages you saw.'
        }
      ]
    },
    {
      id: 'privacy',
      icon: '🔒',
      title: 'Privacy & Security',
      questions: [
        {
          q: 'Is my data secure?',
          a: 'Yes. All videos and data are encrypted in transit and at rest. We use industry-standard security practices and are hosted on secure Firebase infrastructure.'
        },
        {
          q: 'Who can see my videos?',
          a: 'Only you can see your videos by default. Videos are only visible to others if you explicitly share a link with them.'
        },
        {
          q: 'Do you sell my data?',
          a: 'Never. We do not sell, rent, or share your personal information with third parties for marketing purposes.'
        },
        {
          q: 'Can I delete my account and data?',
          a: 'Yes. Go to Account Settings and click "Delete Account". This permanently removes all your videos, reviews, and personal information.'
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      searchTerm === '' ||
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
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
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        padding: '80px 40px 60px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          Help Center
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#999',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Find answers to common questions and learn how to get the most out of Tape2Tape
        </p>

        {/* Search */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '18px 24px',
              fontSize: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '60px 40px'
      }}>
        {searchTerm === '' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '60px'
          }}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setOpenCategory(category.id);
                  document.getElementById(category.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  padding: '30px 20px',
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.borderColor = '#ff0000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#111';
                  e.currentTarget.style.borderColor = '#333';
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                  {category.icon}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {category.title}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {category.questions.length} articles
                </div>
              </button>
            ))}
          </div>
        )}

        {/* FAQ Accordion */}
        <div>
          {filteredCategories.map(category => (
            <div key={category.id} id={category.id} style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>{category.icon}</span>
                {category.title}
              </h2>

              <div>
                {category.questions.map((item, index) => {
                  const isOpen = openQuestion === `${category.id}-${index}`;
                  return (
                    <div
                      key={index}
                      style={{
                        marginBottom: '15px',
                        backgroundColor: '#111',
                        border: '1px solid #333',
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}
                    >
                      <button
                        onClick={() => setOpenQuestion(isOpen ? null : `${category.id}-${index}`)}
                        style={{
                          width: '100%',
                          padding: '20px 24px',
                          backgroundColor: 'transparent',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '16px',
                          fontWeight: '500'
                        }}
                      >
                        <span>{item.q}</span>
                        <span style={{
                          fontSize: '20px',
                          transition: 'transform 0.3s ease',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{
                          padding: '0 24px 24px',
                          color: '#ccc',
                          lineHeight: '1.6',
                          borderTop: '1px solid #222'
                        }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
            <p style={{ fontSize: '18px' }}>No results found for "{searchTerm}"</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              Try different keywords or <a href="/contact" style={{ color: '#ff0000' }}>contact us</a> directly
            </p>
          </div>
        )}

        {/* Still Need Help */}
        <div style={{
          marginTop: '80px',
          padding: '40px',
          backgroundColor: '#111',
          borderRadius: '12px',
          border: '1px solid #333',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '15px'
          }}>
            Still Need Help?
          </h3>
          <p style={{
            color: '#999',
            marginBottom: '25px',
            fontSize: '16px'
          }}>
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <button
            onClick={() => navigate('/contact')}
            style={{
              padding: '15px 40px',
              backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}