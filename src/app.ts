import express, { json, urlencoded } from "express"
import { join } from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"
import cors from "cors"
import 'dotenv/config'
import './fireabase'
import apiRouter from "./routes/lab-sessions"
import usersRouter from "./routes/users"
import labsRouter from "./routes/labs"
import codeRunnerRouter from "./routes/code"
import notificationsRouter from "./routes/notifications"
const app = express()

const corsOptions = {
  origin: ["http://localhost:3000", "https://virtul-lab-nit.web.app/"],
}

app.use(cors(corsOptions))
app.use(logger("dev"))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

app.use("/api/users", usersRouter)
app.use("/api/lab-sessions", apiRouter)
app.use("/api/labs", labsRouter)
app.use("/api/code", codeRunnerRouter)
app.use("/api/notifications", notificationsRouter)

export default app
