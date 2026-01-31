const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Pricing plans configuration
const PLANS = {
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
    amount: 1900, // $19.00 in cents
    interval: 'month',
    features: [
      '10 active projects',
      'Unlimited scope items',
      'Email notifications',
      'Remove ScopeGuard branding',
      'Priority support'
    ]
  },
  business: {
    name: 'Business',
    priceId: process.env.STRIPE_PRICE_BUSINESS || 'price_business_placeholder',
    amount: 3900, // $39.00 in cents
    interval: 'month',
    features: [
      'Unlimited projects',
      'Team collaboration',
      'Analytics dashboard',
      'API access',
      'Custom branding',
      'Premium support'
    ]
  }
};

// GET /api/stripe/plans - Get available pricing plans
router.get('/plans', (req, res) => {
  try {
    res.json({ plans: PLANS });
  } catch (err) {
    console.error('Get plans error:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// POST /api/stripe/create-checkout-session - Create Stripe Checkout session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body; // 'pro' or 'business'

    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const user = req.user;

    // If Stripe is not configured, return mock response
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return res.json({
        mock: true,
        message: 'Stripe not configured. In production, this would redirect to checkout.',
        plan: PLANS[plan],
        user: user.email
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id.toString(),
      payment_method_types: ['card'],
      line_items: [
        {
          price: PLANS[plan].priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        plan: plan
      }
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (err) {
    console.error('Create checkout session error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/stripe/webhook - Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.log('Webhook received but no secret configured');
      return res.json({ received: true });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Update user subscription status
        const userId = parseInt(session.client_reference_id);
        const plan = session.metadata.plan;

        if (userId && plan) {
          User.updateSubscription(userId, {
            subscription_status: plan,
            subscription_id: session.subscription,
            stripe_customer_id: session.customer
          });

          console.log(`✅ User ${userId} subscribed to ${plan} plan`);
        }
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        // Handle subscription updates (upgrade/downgrade)
        console.log('Subscription updated:', subscription.id);
        break;

      case 'customer.subscription.deleted':
        const canceledSub = event.data.object;
        // Handle subscription cancellation
        console.log('Subscription canceled:', canceledSub.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// GET /api/stripe/portal - Create customer portal session (manage subscription)
router.get('/portal', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return res.json({
        mock: true,
        message: 'Stripe not configured. In production, this would open customer portal.'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Create portal session error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

module.exports = router;
