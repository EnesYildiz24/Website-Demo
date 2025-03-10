import express, { Request, Response, NextFunction } from "express";
import { userRouter } from "./routes/user";
import { configureCORS } from "./configCors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorhandler";
import { productRouter } from "./routes/product";
import { loginRouter } from "./routes/login";
import path from "path";

const app = express();
configureCORS(app);
app.use(cookieParser());
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.send("Hello World from TypeScript Backend + Routen!");
});
app.use("/users", userRouter);
app.use("/product", productRouter);
app.use("/login", loginRouter);
app.use(errorHandler);

export default app;
