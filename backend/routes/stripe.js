const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const User = require('../models/User');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!stripe || !endpointSecret || !FRONTEND_URL) throw new Error('Stripe ENV or FRONTEND variables missing');

// Price IDs from Stripe Dashboard mapping
const PLANS = {
    monthly: 'price_1TEjMv7uCPQGL7bcDgxKbkpS',
    yearly: 'price_1TEjSZ7uCPQGL7bcPyNm6fzO'
};

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    // Basic inline auth middleware logic
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const { plan } = req.body; // 'monthly' or 'yearly'
        const priceId = PLANS[plan];

        if (!priceId) return res.status(400).json({ message: 'Invalid plan selected' });

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            client_reference_id: user._id.toString(),
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/subscribe?canceled=true`,
        });

        res.json({ id: session.id, url: session.url });
    } catch (err) {
        console.error('Error in creating checkout session:', err);
        res.status(500).send('Server Error');
    }
});

// Stripe Webhook Endpoint (Must use raw body)
// We need to parse raw body in index.js for this specific route
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const userId = session.client_reference_id;

            if (userId) {
                await User.findByIdAndUpdate(userId, {
                    subscriptionStatus: 'active',
                    stripeSubscriptionId: session.subscription,
                    role: 'Subscriber' // Upgrade role to Subscriber
                });
                console.log(`User ${userId} successfully subscribed.`);
            }
            break;
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            if (invoice.subscription) {
                 await User.findOneAndUpdate(
                    { stripeSubscriptionId: invoice.subscription },
                    { subscriptionStatus: 'active' }
                 );
            }
            break;
        case 'customer.subscription.deleted':
        case 'invoice.payment_failed':
            const failedSubscription = event.data.object.subscription || event.data.object.id;
            await User.findOneAndUpdate(
                { stripeSubscriptionId: failedSubscription },
                { subscriptionStatus: 'past_due', role: 'Visitor' } // Downgrade back to Visitor on failure
            );
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router;
