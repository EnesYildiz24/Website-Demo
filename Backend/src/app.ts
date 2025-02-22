import express from "express";
import userRouter from "./routes/user";
import { configureCORS } from "./configCors";
import cookieParser from "cookie-parser";

const app = express();
configureCORS(app);
app.use(cookieParser());
app.use(express.json());

app.use("/api/user", userRouter);

export default app;
