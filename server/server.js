//require everything and set up .env file
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { default: Stripe } = require("stripe");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
//instantiate express
const app = express();
//set up middleware to read form data etc.
app.use(express.json());
//enable cors
app.use(cors({ origin: "http://localhost:5500" }));

const storeItems = new Map([
  [1, { priceInCents: 2000, name: "ebook" }],
  [2, { priceInCents: 1500, name: "epamphlet" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: { name: storeItem.name },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

//have our server listen on PORT
app.listen(process.env.PORT, () => {
  console.log(`Server is Listening on PORT ${process.env.PORT}`);
});
