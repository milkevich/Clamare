// server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import cors from 'cors';
// import jwt from 'jsonwebtoken'; // Uncomment if using JWT for key verification

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = 5001;

app.use(express.json());

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true,
}));

// Debugging: Log environment variables (Remove in production)
console.log(`Shop Name: ${process.env.SHOPIFY_STORE_URL}`);
console.log(`Access Token: ${process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN}`);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.post("/api/order-details", async (req, res) => {
  const { orderId, key, syclid } = req.body;

  console.log("Received POST /api/order-details");
  console.log("Order ID:", orderId);
  console.log("Key:", key);
  console.log("syclid:", syclid);

  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  if (!key) {
    return res.status(400).json({ error: "Invalid or missing key parameter." });
  }

  // Optional: Verify the key parameter (e.g., using JWT)
  /*
  try {
    const decoded = jwt.verify(key, process.env.JWT_SECRET); // Ensure you have a JWT_SECRET in your .env
    console.log("Key verified:", decoded);
  } catch (err) {
    console.error("Invalid key:", err.message);
    return res.status(401).json({ error: "Invalid key parameter." });
  }
  */

  try {
    const shopName = process.env.SHOPIFY_STORE_URL; // e.g., 'clamare'
    const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

    if (!shopName || !accessToken) {
      console.error("Shop name or access token is missing in environment variables.");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Using GraphQL to fetch order by order_number
    const graphqlEndpoint = `https://${shopName}.myshopify.com/admin/api/2023-10/graphql.json`;

    const orderNumber = parseInt(orderId, 10);

    if (isNaN(orderNumber)) {
      return res.status(400).json({ error: "Order ID must be a number corresponding to order_number" });
    }

    const query = `
      query getOrderByOrderNumber {
        orders(first: 1, query: "order_number:${orderNumber}") {
          edges {
            node {
              id
              orderNumber
              email
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;

    const graphqlResponse = await axios.post(
      graphqlEndpoint,
      {
        query,
      },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    const orderData = graphqlResponse.data.data.orders.edges[0]?.node;

    if (!orderData) {
      return res.status(404).json({ error: "Order not found" });
    }

    const formattedOrder = {
      orderNumber: orderData.orderNumber,
      email: orderData.email,
      lineItems: {
        edges: orderData.lineItems.edges.map(item => ({
          node: {
            title: item.node.title,
            quantity: item.node.quantity,
          },
        })),
      },
      totalPrice: {
        amount: orderData.totalPriceSet.shopMoney.amount,
        currencyCode: orderData.totalPriceSet.shopMoney.currencyCode,
      },
    };

    res.json(formattedOrder);
  } catch (error) {
    if (error.response) {
      console.error("Shopify API Error:", error.response.status, error.response.data);
      res.status(error.response.status).json({ error: error.response.data.errors || "Shopify API Error" });
    } else if (error.request) {
      console.error("No response received from Shopify API:", error.request);
      res.status(500).json({ error: "No response from Shopify API" });
    } else {
      console.error("Error setting up request to Shopify API:", error.message);
      res.status(500).json({ error: "Error setting up request to Shopify API" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
