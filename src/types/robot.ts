import { robotTypes } from "../data/layout";

export type RobotActionType =
  | "stand"
  | "moving"
  | "turnLeft"
  | "turnRight"
  | "lookingBack"
  | "lookingBackLeft"
  | "lookingBackRight"
  | "zapping";

// The behavior type names come straight from the original's
// droidTypes table (kept verbatim in data/layout.ts so the
// behavior dispatch below can match the original's strings).
export type RobotType = (typeof robotTypes)[number];
