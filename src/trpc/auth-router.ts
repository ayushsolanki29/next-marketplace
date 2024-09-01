import { getPayLoadClient } from "../get-payload";
import { publicProcedure, router } from "./trpc";
import { AuthValidator } from "../lib/validators/account-credencials";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = router({
  createPayLoadUser: publicProcedure
    .input(AuthValidator)
    .mutation(async ({ input }) => {
      const { email, password } = input;
      const payload = await getPayLoadClient();
      const { docs: users } = await payload.find({
        collection: "users",
        where: {
          email: {
            equals: email,
          },
        },
      });
      if (users.length !== 0) {
        throw new TRPCError({ code: "CONFLICT" });
      }
      await payload.create({
        collection: "users",
        data: {
          email,
          password,
          role: "user",
        },
      });
      return {
        success: true,
        senToEmail: email,
      };
    }),
  verifyEmail: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { token } = input;
      const payload = await getPayLoadClient();
      const isVerified = await payload.verifyEmail({
        collection: "users",
        token,
      });
      if (!isVerified) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return {
        success: true,
      };
    }),
  signIn: publicProcedure
    .input(AuthValidator)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const { res } = ctx;
      const payload = await getPayLoadClient();
      try {
        await payload.login({
          collection: "users",
          data: {
            email,
            password,
          },
          res,
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),
});
