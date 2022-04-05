import express, { json, urlencoded } from "express"
import { join } from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"
import cors from "cors"
import 'dotenv/config'
import './fireabase'
import apiRouter from "./routes/api"
const app = express()

const corsOptions = {
  origin: "http://localhost:3000",
}

app.use(cors(corsOptions))
app.use(logger("dev"))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

app.use("/api", apiRouter)

export default app
