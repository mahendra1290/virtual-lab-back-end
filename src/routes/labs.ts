import { Router, Request, Response } from "express"
const router = Router()
import { FieldValue, getFirestore, Query, Timestamp } from "firebase-admin/firestore"
import { nanoid } from "nanoid"
import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes"
import { isAuthenticated } from "../middlewares/auth"
import { db } from "../fireabase"

const labCollectionRef = db.collection("labs")

router.use(isAuthenticated)

router.get("/:labId/lab-joining-links", async (req: Request, res: Response) => {
  const { labId } = req.params;
  const lab = await db.collection('labs').doc(labId).get()
  if (lab.exists) {
    const labLink = lab.data()?.joiningLink
    res.status(StatusCodes.ACCEPTED).json(labLink)
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ code: 'Lab not found', message: 'Lab not found' })
  }
})

/**
 * Router for creating lab joining links
 */
router.post("/:labId/lab-joining-links", async (req: Request, res: Response) => {
  try {
    const { labId } = req.params
    const { expiryDate } = req.body
    const labRef = labCollectionRef.doc(labId)
    const lab = await labRef.get()
    const code = nanoid(10)
    const link = `join-lab?code=${code}`
    if (!lab.exists) {
      res.status(StatusCodes.BAD_REQUEST).json({
        code: 'Lab not found',
        message: 'Lab not found'
      })
    } else {
      await labRef.update({
        joiningLink: {
          url: link,
          code,
          expiryTimestamp: expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null
        }
      })
      res.status(StatusCodes.CREATED).json({ link })
    }
  } catch (err: any) {
    console.log(err);
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message })
  }
})

/**
 * Route for joining lab
 */
router.post('/students', async (req: Request, res: Response) => {
  const { uid, name, email, code } = req.body;
  console.log(uid, name, email, code, 'bodu');
  try {
    const query = labCollectionRef.where('joiningLink.code', '==', code)
    const queryRes = await query.get()
    console.log(queryRes.docs);

    if (!queryRes.empty) {
      const labRef = queryRes.docs.at(0)?.ref
      const labData = queryRes.docs.at(0)?.data()
      const labStudents = labData?.students?.filter((student: any) => student.uid === uid) || []
      if (labStudents.length == 0) {
        await labRef?.update({
          students: FieldValue.arrayUnion({
            uid, email, name, joinedAt: Timestamp.now()
          })
        })
        res.status(StatusCodes.ACCEPTED).json({ labId: labData?.id })
      } else {
        res.status(StatusCodes.ACCEPTED).json({ labId: labData?.id })
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ code: 'lab not found', message: 'lab not found' })
    }
  } catch (err) {
    console.log(err);

  }
})

export default router
