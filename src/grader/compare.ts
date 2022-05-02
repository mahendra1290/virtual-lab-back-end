import { isEqual } from "lodash";

export function checkResult(output: string, expectedOutput: string) {
  if (!output || !expectedOutput) {
    return false
  }
  const outToken = output.trim().split("\n").filter(val => !!val)
  const expOutToken = expectedOutput.trim().split("\n").filter(val => !!val);
  return isEqual(outToken, expOutToken)
}
