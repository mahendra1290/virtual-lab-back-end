import { Timestamp } from 'firebase-admin/firestore';
import { db } from './fireabase';
import { FireNotification } from './types/FireNotification';


const notificationsRef = (uid: string) => db.collection(`notifications-${uid}`)

const labsRef = db.collection(`labs`)


async function sendNotifications(uids: string[], notification: FireNotification) {
  const promises: any = []
  uids.forEach(uid => {
    const noteRef = notificationsRef(uid)
    promises.push(noteRef.add(notification))
  })
  return Promise.all(promises);
}


export const sendLabSessionStartNotification = async (labId: string, sessionUrl: string) => {
  if (!sessionUrl || !labId) {
    return
  } else {
    try {
      const docSnap = await labsRef.doc(labId).get()
      if (docSnap.exists) {
        const data = docSnap.data() as any
        const students = data.studentUids || []
        const notification: FireNotification = {
          title: `Session started for ${data.name}`,
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
      }
    } catch (err: any) {
      return false
    }
  }
}
