import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
    const { amount, token } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'eur',
            source: token.id,
            payment_method_types: ['card'],
        });

        res.json({ client_secret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const handlePaymentSuccess = async (req, res) => {
    const { paymentIntentId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // TODO Update your MongoDB database here
            // - status paid
            // - orderId to orderitems

            res.json({ message: 'Payment succeeded, database updated' });
        } else {
            res.status(400).json({ error: 'Payment did not succeed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export { createPaymentIntent, handlePaymentSuccess};