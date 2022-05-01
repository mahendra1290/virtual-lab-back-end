import { Router, Request, Response } from "express"
import * as fs from 'fs'
import * as path from 'path'
const router = Router()
import { nanoid } from "nanoid"
import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes"
import { isAuthenticated } from "../middlewares/auth"
import { db } from "../fireabase"
import { exec } from "child_process"
import Docker from "dockerode"
import { mkdir, readFile, rm, rmdir, writeFile, } from "fs/promises"
import { functions, split } from "lodash"
import { Timestamp } from "firebase-admin/firestore"
import { saveStudentSubmission } from "../lab-sessions-manager"

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

router.use(isAuthenticated)

const absPath = path.join(__dirname, '..', '..', 'codes')
const sourceCodePath = path.join(__dirname, '..', '..', 'shared', 'source-codes')
const expInputsPath = path.join(__dirname, '..', '..', 'shared', 'exp-inputs')
const codeRunScripts = path.join(__dirname, '..', '..', 'shared', 'code-run-scripts')
const testCasesPath = path.join(__dirname, '..', '..', 'shared', 'test-cases')
const testCasesDummyPath = path.join(testCasesPath, 'dummy')
const pythonSourceCodePath = path.join(sourceCodePath, 'python')
const cppSourceCodePath = path.join(sourceCodePath, 'cpp')

const basePath = process.env.RUNNER_BASE_PATH || ''

const dockerSourceCodePath = path.join(basePath, 'shared', 'source-codes')

const dockerTestCases = path.join(basePath, 'shared', 'test-cases')

const dockerRunScripts = path.join(basePath, 'shared', 'code-run-scripts')

const dockerDummy = path.join(dockerTestCases, 'dummy')


interface TestCase {
  totalScore: number,
  inputs: { name: string, content: string, score: number }[]
  outputs: { name: string, content: string, score: number }[]
}

async function creatSourceCodeDirectories() {
  try {

    if (!fs.existsSync(sourceCodePath)) {
      await mkdir(sourceCodePath)
      await mkdir(pythonSourceCodePath)
      await mkdir(cppSourceCodePath)
    }
  } catch (err) {
    console.log(err);

  }
}

async function gradeRunResponse(expId: string, output: string) {
  const testCasesRef = db.doc(`test-cases/${expId}`)
  const testCaseSnap = await testCasesRef.get()
  if (!testCaseSnap.exists) {
    return null
  }
  const tData = testCaseSnap.data() as TestCase
  const outputs = split(output, /output.*\n/).filter(val => val)
  let match = 0;
  let score = 0;
  const result: { testCase: number, score: number, correct: boolean }[] = []
  tData.outputs.map((item, index) => {
    const expectedOut = outputs.at(index) || ''
    const normalizeScore = typeof item.score === 'string' ? Number.parseInt(item.score) : item.score
    if (item.content === expectedOut) {
      match += 1;
      score += normalizeScore
      result.push({ testCase: index + 1, score: normalizeScore, correct: true })
    } else {
      result.push({ testCase: index + 1, score: 0, correct: false })
    }
  })
  let verdict = ''
  let verdictCode = 0
  if (match === tData.outputs.length) {
    verdict = 'Correct'
    verdictCode = 2
  } else if (match > 0 && match < output.length) {
    verdict = 'Partial Correct'
    verdictCode = 1
  } else {
    verdict = 'Incorrect'
  }
  return { verdict, verdictCode, result, totalScore: score };
}

async function loadTestCases(expId: string) {
  const testCasesRef = db.doc(`test-cases/${expId}`)
  const testCaseSnap = await testCasesRef.get()
  try {
    if (testCaseSnap.exists) {
      const testCaseData = testCaseSnap.data() as TestCase
      const testCasePath = path.join(testCasesPath, expId)
      const docketTestCasePath = path.join(dockerTestCases, expId)
      const exist = fs.existsSync(testCasePath)
      const inpPath = path.join(testCasePath, 'inputs')
      const outPath = path.join(testCasePath, 'outputs')
      if (!exist) {
        await mkdir(inpPath, { recursive: true })
        await mkdir(outPath, { recursive: true })
      } else {
        await rm(testCasePath, { recursive: true })
        await mkdir(inpPath, { recursive: true })
        await mkdir(outPath, { recursive: true })
      }
      const promises: Promise<any>[] = []
      testCaseData.inputs.forEach(inp => {
        promises.push(writeFile(path.join(inpPath, inp.name), inp.content, 'utf-8'))
      })
      testCaseData.outputs.forEach(out => {
        promises.push(writeFile(path.join(outPath, out.name), out.content, 'utf-8'))
      })
      await Promise.all(promises)
      return docketTestCasePath
    } else {
      return dockerDummy
    }
  }
  catch (err) {
    console.log(err);
    return testCasesDummyPath
  }
}

async function runCppCode(userUid: string, code: string) {
  await creatSourceCodeDirectories()
  let workingDir = ''
  let dockerDir = ''

  try {
    const userSourceCodePath = path.join(cppSourceCodePath, userUid);
    if (!fs.existsSync(userSourceCodePath)) {
      await mkdir(userSourceCodePath)
    }
    const dirName = nanoid(5);
    await mkdir(path.join(userSourceCodePath, dirName))
    const filename = 'main.cpp'
    await writeFile(path.join(userSourceCodePath, dirName, filename), code, { encoding: 'utf-8' })
    workingDir = path.join(userSourceCodePath, dirName)
    dockerDir = path.join(dockerSourceCodePath, 'cpp', userUid, dirName)
  } catch (err: any) {
    console.log(err)
  }
  return [dockerDir, workingDir]
}

async function runPythonCode(userUid: string, code: string) {
  let workingDir = ''
  let dockerDir = ''
  try {
    await creatSourceCodeDirectories()
    const userSourceCodePath = path.join(pythonSourceCodePath, userUid);
    if (!fs.existsSync(userSourceCodePath)) {
      await mkdir(userSourceCodePath)
    }
    const dirName = nanoid(5);
    await mkdir(path.join(userSourceCodePath, dirName))
    const filename = 'main.py'
    await writeFile(path.join(userSourceCodePath, dirName, filename), code, { encoding: 'utf-8' })
    workingDir = path.join(userSourceCodePath, dirName)
    dockerDir = path.join(dockerSourceCodePath, 'python', userUid, dirName)
  } catch (err: any) {
    console.log(err)
  }
  return [dockerDir, workingDir]
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

async function runCppCodeInDocker(userUid: string, code: string, expId: string) {
  const testCasesPath = await loadTestCases(expId)
  const [dockerDir, workingDir] = await runCppCode(userUid, code);
  const outputFile = path.join(workingDir, 'output.txt')
  const errorFile = path.join(workingDir, 'error.txt')
  writeFile(outputFile, '', { encoding: 'utf-8' })
  writeFile(errorFile, '', { encoding: 'utf-8' })
  const outputStream = fs.createWriteStream(outputFile, 'utf-8')
  const errorStream = fs.createWriteStream(errorFile, 'utf-8')
  const script = testCasesPath === dockerDummy ? '/scripts/run-python.sh' : '/scripts/run-python-with-inputs.sh'
  return new Promise((resolve, reject) => {
    docker.run('frolvlad/alpine-gxx', [
      '/bin/sh',
      script
    ], [outputStream, errorStream], {
      Tty: false,
      name: 'cpp' + userUid,
      HostConfig: {
        Binds: [`${dockerDir}:/source`, `${testCasesPath}:/test-cases`, `${dockerRunScripts}:/scripts`]
      },
    }, {

    }).then((data) => {
      const cont = data[1];
      return cont.remove();
    }).then(async data => {
      const outputPromise = readFile(outputFile, { encoding: 'utf-8' })
      const errorPromise = readFile(errorFile, { encoding: 'utf-8' })
      const [output, error] = await Promise.all([outputPromise, errorPromise])
      const res = await gradeRunResponse(expId, output)
      resolve({ output, error, graderResponse: res })
    }).catch((err) => {
      console.log("err", err);
      reject(err)
    })
  })

}


async function runPythonCodeInDocker(userUid: string, code: string, expId: string) {

  const testCasesPath = await loadTestCases(expId)
  const [dockerDir, workingDir] = await runPythonCode(userUid, code);
  console.log(workingDir, codeRunScripts, testCasesPath, 'paths');
  const outputFile = path.join(workingDir, 'output.txt')
  const errorFile = path.join(workingDir, 'error.txt')
  writeFile(outputFile, '', { encoding: 'utf-8' })
  writeFile(errorFile, '', { encoding: 'utf-8' })
  const outputStream = fs.createWriteStream(outputFile, 'utf-8')
  const errorStream = fs.createWriteStream(errorFile, 'utf-8')
  const script = testCasesPath === dockerDummy ? '/scripts/run-python.sh' : '/scripts/run-python-with-inputs.sh'
  return new Promise((resolve, reject) => {
    docker.run('python:3.10-alpine', [
      '/bin/sh',
      script
    ], [outputStream, errorStream], {
      Tty: false,
      name: userUid,
      HostConfig: {
        Binds: [`${dockerDir}:/source`, `${testCasesPath}:/test-cases`, `${dockerRunScripts}:/scripts`]
      },
    }, {

    }).then((data) => {
      const cont = data[1];
      return cont.remove();
    }).then(async data => {
      const outputPromise = readFile(outputFile, { encoding: 'utf-8' })
      const errorPromise = readFile(errorFile, { encoding: 'utf-8' })
      const [output, error] = await Promise.all([outputPromise, errorPromise])
      const res = await gradeRunResponse(expId, output)
      resolve({ output, error, graderResponse: res })
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
  const { code, expId, sessionId, labId } = req.body;
  const { uid } = req.auth || { uid: '' };
  const result = await runPythonCodeInDocker(uid, code, expId);
  const studentWork: StudentWork = {
    uid: uid,
    expId: expId,
    labId: labId,
    sessionId: sessionId,
    lang: 'python',
    code: code,
    runnedAt: Timestamp.now(),
    graderResult: (result as any).graderResponse as GraderResult || null
  }
  saveStudentSubmission(studentWork)
  res.status(StatusCodes.ACCEPTED).json(result || {})
})


router.post('/run/cpp', async (req: Request, res: Response) => {
  const { code, expId, sessionId, labId } = req.body;
  const { uid } = req.auth || { uid: '' };
  const result = await runCppCodeInDocker(uid, code, expId);
  const studentWork: StudentWork = {
    uid: uid,
    expId: expId,
    labId: labId,
    sessionId: sessionId,
    lang: 'cpp',
    code: code,
    runnedAt: Timestamp.now(),
    graderResult: (result as any).graderResponse as GraderResult || null
  }
  saveStudentSubmission(studentWork)
  res.status(StatusCodes.ACCEPTED).json(result || {})
})


export default router
