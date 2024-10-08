import { TRPCError } from "@trpc/server";
import { privateProcedure, router } from "./trpc";
import { z } from "zod";
import { getPayLoadClient } from "../get-payload";
import { stripe } from "../lib/stripe";
import type Stripe from "stripe";

export const paymentRouter = router({
  createSession: privateProcedure
    .input(
      z.object({
        productIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { productIds } = input;
      if (productIds.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const payload = await getPayLoadClient();
      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            in: productIds,
          },
        },
      });
      const filteredProducts = products.filter((prod) =>
        Boolean(prod.priceId)
      ) as any;
      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod: any) => prod.id),
          user: user.id,
        },
      });
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      filteredProducts.forEach((product: any) => {
        line_items.push({
          price: product.priceId!,
          quantity: 1,
        });
      });
      line_items.push({
        price: "price_1Pu9c2SIFWGfBHwjinCt5W2j",
        quantity: 1,
        adjustable_quantity: {
          enabled: false,
        },
      });
      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          mode: "payment",
          metadata: {
            userId: user.id,
            orderId: order.id,
          },
          billing_address_collection: "required",
          customer_email: user.email, // or use customer: customerId if you have the ID
          line_items,
        });
        return {
          url: stripeSession.url,
        };
      } catch (error) {
        // Handle error here
        console.error("Error creating Stripe session:", error);
        throw error;
      }
    }),
  pollOrderStatus: privateProcedure
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { orderId } = input;
      const payload = await getPayLoadClient();
      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: {
            equals: orderId,
          },
        },
      });
      if (!orders.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const [order] = orders;
      return {
        isPaid: order._isPaid,
      };
    }),
});
