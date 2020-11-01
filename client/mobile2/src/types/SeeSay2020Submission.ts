
export type JoyType = {
  issue_type: "joy",
  issue_subtype: "dancing" | "kindness" | "patience" | "other",
}

type FakeType = {
  issue_type: "fake",
  issue_subtype: "fake_subtype"
}

type AllIssueTypes = 
  JoyType |
  FakeType

export type BaseForm = {
  description: string,
  incident_state: string,
  incident_city: string,
  // TODO(Dave): Fix this shit.
  incident_time: string,  // microseconds since epoch
  globalid: string,
} 

type SeeSay2020Submission = BaseForm & AllIssueTypes
export default SeeSay2020Submission
