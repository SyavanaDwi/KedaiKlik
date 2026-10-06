import express, { Response, Request } from "express";
import indexRoute from "./routes/indexRoute";
import { logMiddleware } from "./middlewares/logMiddleware";
// import { apiKeyMiddleware } from "./middlewares/apiKeyMiddleware";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(logMiddleware);
app.use("/api", indexRoute);
app.use(errorHandler);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server Express berjalan di http://localhost:${port}`);
});
