import { Router, Request, Response } from "express"
import * as fs from 'fs'
import * as path from 'path'
const router = Router()
import { FieldValue, getFirestore, Query, Timestamp } from "firebase-admin/firestore"
import { nanoid } from "nanoid"
import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes"
import { isAuthenticated } from "../middlewares/auth"
import { db } from "../fireabase"
import { exec } from "child_process"
import Docker from "dockerode"

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

router.use(isAuthenticated)

// docker.listContainers().then(containers => {
//   console.log(containers);
// })

const absPath = path.join(__dirname, '..', '..', 'codes')

async function createCodeFile(userUid: string, code: string, extension: string) {
  const dirPath = path.join(absPath, `user-${userUid}`);
  return new Promise((resolve, reject) => {
    fs.mkdir(dirPath, (err) => {
      if (err) {
        console.log(err)
      }
      const filename = `${nanoid(5)}.${extension}`
      const filepath = path.join(dirPath, filename)
      fs.writeFile(filepath, code, { encoding: 'utf-8' }, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve([filepath, filename])
        }
      })
    })
  })
}

async function runJsCode(userUid: string, code: string) {
  const filename: any = await createCodeFile(userUid, code, 'js')
  const codePath = path.join(__dirname, '..', '..', 'codes');
  const ouputPath = path.join(codePath, 'output', `${userUid}.txt`)
  fs.writeFileSync(ouputPath, '', { encoding: 'utf-8' })
  const outStream = fs.createWriteStream(ouputPath, 'utf-8')
  return new Promise((resolve, reject) => {

    docker.run('node:18-alpine3.14', [
      'node',
      `/codes/user-${userUid}/${filename[1]}`
    ], [outStream, outStream], {
      Tty: false,
      name: userUid,
      HostConfig: {
        Binds: [`${codePath}:/codes`]
      },
    }).then((data) => {
      const cont = data[1];
      return cont.remove();
    }).then(data => {
      fs.readFile(ouputPath, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data);
        }
      })
    }).catch((err) => {
      console.log("err", err);
    })
  })
}

router.post('/run', (req: Request, res: Response) => {
  const { code } = req.body;
  try {
    const filename = path.join(__dirname, '..', 'code-submissions', 'newfile.cpp')
    fs.writeFileSync(filename, code, { encoding: 'utf-8' })
    exec(`g++ ${filename} -o ${path.join(__dirname, '..', 'code-submissions', 'a.out')}`, (error, stdout, stderr) => {
      if (error) {
        console.log(stderr);
        res.status(StatusCodes.ACCEPTED).json({ error: stderr })
      } else {
        exec(path.join(__dirname, '..', 'code-submissions', 'a.out'), (error, stdout, stderr) => {
          if (error) {
            res.status(StatusCodes.ACCEPTED).json({ error: stderr })
          } else {
            res.status(StatusCodes.ACCEPTED).json({ out: stdout })
          }
        })
      }
    })
  } catch (err: any) {
    console.log(err);

    res.status(StatusCodes.BAD_REQUEST).json({ 'error': 'Someting went wrong' })
  }
})

router.post('/run/js', async (req: Request, res: Response) => {
  const { code } = req.body;
  const { uid } = req.auth || { uid: '' };
  const result = await runJsCode(uid, code);
  res.status(StatusCodes.ACCEPTED).json({ out: result })
})

export default router
