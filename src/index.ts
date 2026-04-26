import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.listen(config.port, () => {
  console.log(`Order service running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
