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
import { mkdir, readFile, writeFile } from "fs/promises"

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

router.use(isAuthenticated)

const absPath = path.join(__dirname, '..', '..', 'codes')

const sourceCodePath = path.join(__dirname, '..', '..', 'source-codes')

const expInputsPath = path.join(__dirname, '..', '..', 'exp-inputs')

const pythonSourceCodePath = path.join(sourceCodePath, 'python')

const cppSourceCodePath = path.join(sourceCodePath, 'cpp')

async function runCppCode(userUid: string, code: string) {
  console.log(userUid, code);

  try {
    const userSourceCodePath = path.join(cppSourceCodePath, userUid);
    if (!fs.existsSync(userSourceCodePath)) {
      await mkdir(userSourceCodePath)
    }
    const dirName = nanoid(5);
    await mkdir(path.join(userSourceCodePath, dirName))
    const filename = 'main.cpp'
    await writeFile(path.join(userSourceCodePath, dirName, filename), code, { encoding: 'utf-8' })
  } catch (err: any) {
    console.log(err)
  }
}

async function runPythonCode(userUid: string, code: string) {
  let workingDir = ''
  try {
    const userSourceCodePath = path.join(pythonSourceCodePath, userUid);
    if (!fs.existsSync(userSourceCodePath)) {
      await mkdir(userSourceCodePath)
    }
    const dirName = nanoid(5);
    await mkdir(path.join(userSourceCodePath, dirName))
    const filename = 'main.py'
    await writeFile(path.join(userSourceCodePath, dirName, filename), code, { encoding: 'utf-8' })
    workingDir = path.join(userSourceCodePath, dirName)
  } catch (err: any) {
    console.log(err)
  }
  return workingDir
}

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

async function runCppCodeInDocker(userUid: string, code: string) {
  const workingDir = await runPythonCode(userUid, code);
  const outputFile = path.join(workingDir, 'output.txt')
  const errorFile = path.join(workingDir, 'error.txt')
  writeFile(outputFile, '', { encoding: 'utf-8' })
  writeFile(errorFile, '', { encoding: 'utf-8' })
  const outputStream = fs.createWriteStream(outputFile, 'utf-8')
  const errorStream = fs.createWriteStream(errorFile, 'utf-8')
  return new Promise((resolve, reject) => {
    // docker.createContainer({
    //   Image: 'python:3.10-alpine',
    //   name: userUid,
    //   HostConfig: {
    //     Binds: [`${workingDir}:/source`, `${expInputsPath}:/inputs`]
    //   },
    // })
    docker.run('python:3.10-alpine', [
      'python',
      '/source/main.py',
    ], [outputStream, errorStream], {
      Tty: false,
      name: userUid,
      HostConfig: {
        Binds: [`${workingDir}:/source`, `${expInputsPath}:/inputs`]
      },
    }).then((data) => {
      const cont = data[1];
      return cont.remove();
    }).then(async data => {
      const outputPromise = readFile(outputFile, { encoding: 'utf-8' })
      const errorPromise = readFile(errorFile, { encoding: 'utf-8' })
      const [output, error] = await Promise.all([outputPromise, errorPromise])
      resolve({ output, error })
    }).catch((err) => {
      console.log("err", err);
      reject(err)
    })
  })

}


async function runPythonCodeInDocker(userUid: string, code: string) {
  const workingDir = await runPythonCode(userUid, code);
  const outputFile = path.join(workingDir, 'output.txt')
  const errorFile = path.join(workingDir, 'error.txt')
  writeFile(outputFile, '', { encoding: 'utf-8' })
  writeFile(errorFile, '', { encoding: 'utf-8' })
  const outputStream = fs.createWriteStream(outputFile, 'utf-8')
  const errorStream = fs.createWriteStream(errorFile, 'utf-8')
  return new Promise((resolve, reject) => {
    // docker.createContainer({
    //   Image: 'python:3.10-alpine',
    //   name: userUid,
    //   HostConfig: {
    //     Binds: [`${workingDir}:/source`, `${expInputsPath}:/inputs`]
    //   },
    // })
    docker.run('python:3.10-alpine', [
      'python',
      '/source/main.py',
    ], [outputStream, errorStream], {
      Tty: false,
      name: userUid,
      HostConfig: {
        Binds: [`${workingDir}:/source`, `${expInputsPath}:/inputs`]
      },
    }).then((data) => {
      const cont = data[1];
      return cont.remove();
    }).then(async data => {
      const outputPromise = readFile(outputFile, { encoding: 'utf-8' })
      const errorPromise = readFile(errorFile, { encoding: 'utf-8' })
      const [output, error] = await Promise.all([outputPromise, errorPromise])
      resolve({ output, error })
    }).catch((err) => {
      console.log("err", err);
      reject(err)
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
      let output = ''
      let error = ''
      fs.readFile(ouputPath, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          output = data
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

router.post('/run/python', async (req: Request, res: Response) => {
  const { code } = req.body;
  const { uid } = req.auth || { uid: '' };
  const result = await runPythonCodeInDocker(uid, code);
  res.status(StatusCodes.ACCEPTED).json(result || {})
})


router.post('/run/cpp', async (req: Request, res: Response) => {
  const { code } = req.body;
  const { uid } = req.auth || { uid: '' };
  runCppCode(uid, code);
  res.status(StatusCodes.ACCEPTED).json({ out: 'result' })
})


export default router
