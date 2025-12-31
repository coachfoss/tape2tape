import { loadStripe } from '@stripe/stripe-js';

let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export async function createCheckoutSession(userId, priceType, successUrl, cancelUrl) {
  try {
    const response = await fetch(`https://createcheckoutsession-k34zqbs5za-uc.a.run.app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, priceType, successUrl, cancelUrl }),
    });
    if (!response.ok) throw new Error('Failed to create checkout session');
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createCustomerPortalSession(userId, returnUrl) {
  try {
    const response = await fetch(`https://createportalsession-k34zqbs5za-uc.a.run.app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, returnUrl }),
    });
    if (!response.ok) throw new Error('Failed to create portal session');
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}