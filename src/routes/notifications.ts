import { Router, Request, Response } from "express"
const router = Router()
import { FieldValue, getFirestore, Query, Timestamp } from "firebase-admin/firestore"
import { nanoid } from "nanoid"
import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes"
import { isAuthenticated } from "../middlewares/auth"
import { db } from "../fireabase"

const notificationsRef = db.collection("notifications")

router.use(isAuthenticated)

router.post("/lab-invite", async (req: Request, res: Response) => {
  const { studentUid } = req.body;

})

router.post("/lab-session-start", async (req: Request, res: Response) => {
  const { studentUid } = req.body;
})


export default router
