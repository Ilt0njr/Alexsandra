import Stripe from "stripe";

export default async (req, res) => {
  if (req.method === "POST") {
    try {
      const stripe = new Stripe(process.env.STRIPE_PRIVATEKEY);
      const { images, info } = req.body;
      const price = await stripe.prices.create({
        unit_amount: parseFloat(info.price) * 100,
        currency: "brl",
        product_data: {
          name: info.name,
        },
      });
      const product = await stripe.products.update(price.product, {
        default_price: price.id,
        images,
        metadata: { ...info, chips: info.chips.join(" ") },
      });
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(200).json({ success: false, error: e });
    }
  }
};
