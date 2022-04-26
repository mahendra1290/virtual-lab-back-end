
interface CustomError {
  code: string,
  message: string,
}

const LAB_NOT_FOUND: CustomError = {
  code: 'labs/lab_not_found',
  message: 'Lab not found'
}

const LAB_JOIN_LINK_EXPIRED: CustomError = {
  code: 'labs/lab_join_link_expired',
  message: 'Join link expired'
}

export { LAB_JOIN_LINK_EXPIRED, LAB_NOT_FOUND }
