import { Router, Request, Response } from "express"
const router = Router()
import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes"
import { isAuthenticated } from "../middlewares/auth"
import { db, auth } from "../fireabase"

const usersRef = db.collection('users')


router.use(isAuthenticated)

router.get('/', (req: Request, res: Response) => {
  res.send("hello")
})

router.post('/:id', async (req: Request, res: Response) => {
  const { role, displayName } = req.body;
  const { id } = req.params;
  if (req.auth?.uid === id) {
    const user = await auth.getUser(id)
    const { uid } = req.auth
    if (user) {
      const promises = []
      promises.push(auth.updateUser(uid, {
        displayName,
      }))
      const claim = { role }
      if (role !== 'teacher' && role !== 'student' && role !== 'admin') {
        claim.role = ''
      }
      promises.push(auth.setCustomUserClaims(uid, claim))

      promises.push(usersRef.doc(uid).set({
        email: user.email,
        role,
        name: displayName,
        photoURL: user.photoURL || ''
      }))
      try {
        await Promise.all(promises)
        res.status(StatusCodes.CREATED).send(ReasonPhrases.CREATED)
      } catch (err: any) {
        res.status(StatusCodes.BAD_REQUEST).send({ message: err.message })
      }
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" })
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" })

  }
})

export default router
