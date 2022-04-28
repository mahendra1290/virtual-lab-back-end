import { FireNotification } from './../types/FireNotification';
import { Router, Request, Response } from "express"
const router = Router()
import { FieldValue, getFirestore, Query, Timestamp } from "firebase-admin/firestore"
import { nanoid } from "nanoid"
import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes"
import { isAuthenticated } from "../middlewares/auth"
import { db } from "../fireabase"

const notificationsRef = (uid: string) => db.collection(`notifications-${uid}`)

const usersRef = db.collection(`users`)

router.use(isAuthenticated)

router.post("/lab-invite", async (req: Request, res: Response) => {
  const { emails, labJoinUrl } = req.body;


  const data = await usersRef.where('email', 'in', emails).get()
  if (!data.empty) {
    const uids = data.docs.map(doc => doc.data().uid)
    const promises: any = []
    console.log(uids);

    uids.forEach(uid => {
      const noteRef = notificationsRef(uid)
      const notification: FireNotification = {
        title: 'Join Lab Invite',
        description: 'Join lab by clicking on this link',
        createdAt: Timestamp.now(),
        actions: [
          {
            name: 'Join',
            action: labJoinUrl
          }
        ]
      }
      promises.push(noteRef.add(notification))
    })
    await Promise.all(promises);
    res.status(StatusCodes.CREATED).json({ emails, labJoinUrl })
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad reqest' })
  }

})

router.post("/lab-session-start", async (req: Request, res: Response) => {
  const { studentUid, sessionUrl } = req.body;
  const noteRef = notificationsRef(studentUid)
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
  await noteRef.add(notification)
  res.status(StatusCodes.CREATED).json(notification)
})


export default router
