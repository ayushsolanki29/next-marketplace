import express from "express";
import { getPayLoadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { inferAsyncReturnType } from "@trpc/server";
import bodyParser from "body-parser";
import { IncomingMessage } from "http";
import { stripeWebhookHandler } from "./webhooks";
import nextbuild from "next/dist/build";
import path from "path";
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
});
export type ExpressContex = inferAsyncReturnType<typeof createContext>;
export type WebhookRequest = IncomingMessage & { rawBody: Buffer };
const start = async () => {
  const webhookMiddleware = bodyParser.json({
    verify: (req: WebhookRequest, _, buffer) => {
      req.rawBody = buffer;
    },
  });
  app.post("/api/webhooks/stipe", webhookMiddleware, stripeWebhookHandler);
  const payload = await getPayLoadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => cms.logger.info("Admin URL: " + cms.getAdminURL()),
    },
  });
  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      payload.logger.info(`Next js is Builing for production`);
      //@ts-expect-error
      await nextbuild(path.join(__dirname, "../"));
      process.exit();
    });
    return;
  }

  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: createContext,
    })
  );
  app.use((req, res) => {
    nextHandler(req, res);
  });
  nextApp.prepare().then(() => {
    app.listen(PORT, () => {
      payload.logger.info(
        `Next JS App URL :  ${process.env.NEXT_PUBLIC_SERVER_URL}`
      );
    });
  });
};
start();
