import express, { Request, Response, NextFunction } from "express";
import { userRouter } from "./routes/user";
import { configureCORS } from "./configCors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorhandler";
import { productRouter } from "./routes/product";

const app = express();
configureCORS(app);
app.use(cookieParser());
app.use(express.json());

app.use('/users', userRouter);
app.use("/products", productRouter);

app.use(errorHandler);

export default app;
