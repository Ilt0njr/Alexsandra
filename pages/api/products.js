import Stripe from "stripe";

export default async (req, res) => {
  if (req.method == "GET") {
    const stripe = new Stripe(process.env.STRIPE_PRIVATEKEY);
    const response = await stripe.products.search({ query: "active:'true'" });
    const products = response.data;
    const categorys = products.map(x => x.metadata.type);

    const productsByType = {};
    products.forEach(i => {
      productsByType[i.metadata.type] =
        productsByType[i.metadata.type] == undefined
          ? [i]
          : [...productsByType[i.metadata.type], i];
    });

    res.status(200).json({ products, categorys, productsByType });
  }
};
