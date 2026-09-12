import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

import dashboardRoutes from "./routes/dashboard.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import userRoutes from "./routes/user.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import { inngestHandler } from "./inngest/index.js";
import chatRoutes from "./routes/chat.routes.js"
const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://code-review-client-tau.vercel.app",
    ],
    credentials: true,
  })
);


app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));


app.use("/api/webhooks", webhookRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/repositories", repositoryRoutes);

app.use("/api/user", userRoutes);

app.use("/api/review",reviewRoutes)


app.use("/api/inngest", inngestHandler);

app.use("/api/chat",chatRoutes);

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
  });
});

export default app;