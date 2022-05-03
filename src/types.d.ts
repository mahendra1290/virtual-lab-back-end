interface GraderResult {
  verdict: string
  verdictCode: number
  totalScore: number
  result: {
    testCase: string
    score: string
    correct: boolean
  }[]
}

interface StudentWork {
  uid: string,
  code: string,
  lang: string,
  sessionId: string,
  expId: string,
  labId: string,
  runnedAt: Timestamp,
  session: any,
  graderResult: GraderResult
}
