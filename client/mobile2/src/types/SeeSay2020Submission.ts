

export type FormSelectors = {
  types: {
    type: string,
    label: string,
    subtypes: {
      subtype: string,
      label: string,
    }[],
  }[],
}
export const formSelectors: FormSelectors = {
  types: [
    {
      type: "registration",
      label: "Check-in problems",
      subtypes: [
        {subtype: "not_listed", label: "Voter not present in voter rolls"},
        {subtype: "name_incorrect", label: "Incorrect voter name or address"},
        {subtype: "already_voted", label: "Voter shown as already voted"},
        {subtype: "other", label: "Some other issue"},
      ]
    },
    {
      type: "machine",
      label: "Problems with voting machine",
      subtypes: [
        // {subtype: "", label: "Some other issue"}
      ],
    },
    {
      type: "intimidation",
      label: "Voter intimidation",
      subtypes: [
        {subtype: "polling_place_interference", label: "Interference or Obstruction to polls"},
        {subtype: "eligibility_challenged", label: "ID requested or Eligibility challenged"},
        {subtype: "perusade_voter", label: "Attempt to persuade voter in line"},
        {subtype: "non_authorized_person", label: "Unauthorized people present"},
        {subtype: "advertising", label: "Wrongful electioneering"},
        {subtype: "other", label: "Some other issue"},
      ]
    },
    {
      type: "place",
      label: "Polling place issues",
      subtypes: [
        {subtype: "longlines", label: "Long waiting lines to vote"},
        {subtype: "closed", label: "Location closed / moved / inconvenient"},
        {subtype: "poll_worker", label: "Problems with poll worker"},
        {subtype: "poll_tape", label: "Problems with poll tape"},
        {subtype: "interfere", label: "Interference or Obstruction of Voter"},
        {subtype: "other", label: "Some other issue"},
      ]
    },
    {
      type: "ballot",
      label: "Ballot issues",
      subtypes: [
        {subtype: "absentee", label: "Problems with Absentee ballot"},
        {subtype: "provisional_not_offered", label: "Provisional or affidavit ballot not offered"},
        {subtype: "missing", label: "Candidate / Race is missing or incorrect"},
        {subtype: "ballot_removal", label: "Ballot removal"},
        {subtype: "other", label: "Some other issue"},
      ]
    },
    {
      type: "access",
      label: "Equal Access",
      subtypes: [
        {subtype: "language", label: "Language access problems"},
        {subtype: "disability", label: "Disability access problems"},
        {subtype: "other", label: "Some other issue"},
      ]
    },
    {
      type: "misinformation",
      label: "Misinformation",
      subtypes: [
        {subtype: "news", label: "News"},
        {subtype: "text", label: "SMS / Text message"},
        {subtype: "email", label: "Email"},
        {subtype: "social_media", label: "Facebook / Social media"},
        {subtype: "other", label: "Some other venue"},
      ]
    },
    {
      type: "law",
      label: "Problems with Law enforcement",
      subtypes: [
        {subtype: "assist", label: "Refusing assistance"},
        {subtype: "response", label: "Aggressive or inappropriate response"},
        {subtype: "other", label: "Some other issue"},
      ]
    },
    {
      type: "courts",
      label: "Courts",
      subtypes: [
        // {subtype: "other", label: "Some other issue"},
      ]
    },
    {
      type: "polltape",
      label: "Poll tape / records",
      subtypes: [
        {subtype: "photo", label: "Attach a photo of the poll tape"},
        {subtype: "photo_missing", label: "Poll tape not posted or available"},
      ]
    },
    {
      type: "other",
      label: "Other issues",
      subtypes: [
        {subtype: "fraud", label: "Fraud allegation"},
        {subtype: "other", label: "Some other issue"},
      ]
    },
  ]
}


export type JoyType = {
  issue_type: "joy",
  issue_subtype: "dancing" | "kindness" | "patience" | "other",
}

type OtherType = {
  issue_type: string,
  issue_subtype?: string
}

type AllIssueTypes =
  JoyType |
  OtherType

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
