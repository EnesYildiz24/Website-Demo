import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import { userRouter } from "./routes/user";
import { configureCORS } from "./configCors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorhandler";
import { productRouter } from "./routes/product";
import { loginRouter } from "./routes/login";
import path from "path";
import { categoryRouter } from "./routes/category";
import { reviewRouter } from "./routes/review";
import { cartRouter } from "./routes/cart";
import { orderRouter } from "./routes/order";

const app = express();
configureCORS(app);
app.use(cookieParser());
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.send("Hello World from TypeScript Backend + Routen!");
});
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/login", loginRouter);
app.use("/categories", categoryRouter);
app.use("/reviews", reviewRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
app.use(errorHandler);

export default app;
