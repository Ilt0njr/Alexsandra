import Stripe from "stripe";

export default async (req, res) => {
  if (req.method == "POST") {
    const { prices, shipping } = req.body;
    const shipping_options = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 0,
            currency: "brl",
          },
          display_name: "Retirar na Loja",
        },
      },

      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: Math.round(parseFloat(shipping.price) * 100),
            currency: "brl",
          },
          display_name: shipping.name,
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: shipping.delivery_range.min,
            },
            maximum: {
              unit: "business_day",
              value: shipping.delivery_range.max,
            },
          },
        },
      },
    ];

    const stripe = new Stripe(process.env.STRIPE_PRIVATEKEY);
    const line_items = prices.map(price => {
      return { price, quantity: 1 };
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      locale: "pt-BR",
      shipping_options,
      mode: "payment",
      allow_promotion_codes: true,
      success_url: `http://localhost:3000?success=true`,
      cancel_url: `http://localhost:3000?canceled=true`,
    });

    console.log(session);

    res.status(200).json({ session });
  }
};
