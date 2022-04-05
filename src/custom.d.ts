declare namespace Express {
  export interface Request {
    auth?: {
      uid: string,
      role?: string,
      email?: string
    }
  }
}
