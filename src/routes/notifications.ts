import { FireNotification } from './../types/FireNotification';
import { Router, Request, Response } from "express"
const router = Router()
import { FieldValue, getFirestore, Query, Timestamp } from "firebase-admin/firestore"
import { nanoid } from "nanoid"
import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes"
import { isAuthenticated } from "../middlewares/auth"
import { db } from "../fireabase"

const notificationsRef = (uid: string) => db.collection(`notifications-${uid}`)

const expSessionsRef = db.collection("lab-sessions")

const usersRef = db.collection(`users`)

const labsRef = db.collection(`labs`)

router.use(isAuthenticated)

async function sendNotifications(uids: string[], notification: FireNotification) {
  const promises: any = []
  uids.forEach(uid => {
    const noteRef = notificationsRef(uid)
    promises.push(noteRef.add(notification))
  })
  return Promise.all(promises);
}

router.post("/lab-invite", async (req: Request, res: Response) => {
  const { emails, labJoinUrl, labName } = req.body;

  const data = await usersRef.where('email', 'in', emails).get()
  if (!data.empty) {
    const uids = data.docs.map(doc => doc.id)
    if (uids.length == 0) {
      res.status(StatusCodes.NO_CONTENT).send()
      return
    }

    const notification: FireNotification = {
      title: 'Lab Invite',
      description: `You're invited to join ${labName}.`,
      createdAt: Timestamp.now(),
      actions: [
        {
          name: 'Join',
          action: labJoinUrl
        }
      ]
    }
    await sendNotifications(uids, notification);
    res.status(StatusCodes.NO_CONTENT).json({ emails, labJoinUrl })
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad reqest' })
  }

})

router.post("/lab-session-start", async (req: Request, res: Response) => {
  const { sessionUrl, labId } = req.body;
  if (!sessionUrl || !labId) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'session id not provided' })
  } else {
    try {
      const docSnap = await labsRef.doc(labId).get()
      if (docSnap.exists) {
        const data = docSnap.data() as any
        const students = data.studentUids || []
        const notification: FireNotification = {
          title: 'Lab Session started',
          description: 'Your teacher has started new lab session.',
          createdAt: Timestamp.now(),
          actions: [
            {
              name: 'Join',
              action: sessionUrl
            }
          ]
        }
        await sendNotifications(students, notification)
        res.status(StatusCodes.NO_CONTENT).send()
      } else {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Lab session not found" })
      }
    } catch (err: any) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Something went wrong", message: err.message })
    }
  }
})


export default router
