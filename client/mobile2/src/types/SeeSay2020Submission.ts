
export type NullKey = "<<NullKey>>"
const nullKey: NullKey = "<<NullKey>>"

type IssueKeys = {
  registration: "not_listed" | "name_incorrect" | "already_voted" | "other"
  machine: NullKey 
  intimidation: "polling_place_interference" | "eligibility_challenged" | "perusade_voter" | "non_authorized_person" | "advertising" | "other"
  place: "longlines" | "closed" | "poll_worker" | "poll_tape" | "interfere" | "other"
  ballot: "absentee" | "provisional_not_offered" | "missing" | "ballot_removal" | "other"
  access: "language" | "disability" | "other"
  misinformation: "news" | "text" | "email" | "social_media" | "other"
  law: "assist" | "response" | "other"
  courts: NullKey
  joy: "dancing" | "kindness" | "patience" | "other"
  polltape: "photo" | "photo_missing"
  other: "fraud" | "other"
}

export type IssueTypeDetails<ST> = {
  label: string,
  goodThing?: true,
  subtypes: {
    subtype: ST,
    label: string,
  }[],
}

export type FormSelectors = {
  [K in keyof IssueKeys]: IssueTypeDetails<IssueKeys[K]>
}

export const formSelectors: FormSelectors = {
  registration: {
    label: "Voter Check-in Problems",
    subtypes: [
      { subtype: "not_listed", label: "Voter not present in voter rolls" },
      { subtype: "name_incorrect", label: "Incorrect voter name or address" },
      { subtype: "already_voted", label: "Voter shown as already voted" },
      { subtype: "other", label: "Some other issue" },
    ]
  },
  machine: {
    label: "Problems With Voting Machine",
    subtypes: [
      { subtype: nullKey, label: "Some problem (explain below)" }
    ],
  },
  intimidation: {
    label: "Voter Intimidation",
    subtypes: [
      { subtype: "polling_place_interference", label: "Voting interference / Poll obstruction" },
      { subtype: "eligibility_challenged", label: "ID requested or Eligibility challenged" },
      { subtype: "perusade_voter", label: "Attempt to persuade voter in line" },
      { subtype: "non_authorized_person", label: "Unauthorized people present" },
      { subtype: "advertising", label: "Wrongful electioneering" },
      { subtype: "other", label: "Some other issue" },
    ]
  },
  place: {
    label: "Polling Place Issues",
    subtypes: [
      { subtype: "longlines", label: "Long waiting lines to vote" },
      { subtype: "closed", label: "Location closed / moved / inconvenient" },
      { subtype: "poll_worker", label: "Problems with poll worker" },
      { subtype: "poll_tape", label: "Problems with poll tape" },
      { subtype: "interfere", label: "Interference or Obstruction of Voter" },
      { subtype: "other", label: "Some other issue" },
    ]
  },
  ballot: {
    label: "Ballot Issues",
    subtypes: [
      { subtype: "absentee", label: "Problems with Absentee ballot" },
      { subtype: "provisional_not_offered", label: "Provisional or affidavit ballot not offered" },
      { subtype: "missing", label: "Candidate / Race is missing or incorrect" },
      { subtype: "ballot_removal", label: "Ballot removal" },
      { subtype: "other", label: "Some other issue" },
    ]
  },
  access: {
    label: "Equal Access",
    subtypes: [
      { subtype: "language", label: "Language access problems" },
      { subtype: "disability", label: "Disability access problems" },
      { subtype: "other", label: "Some other issue" },
    ]
  },
  misinformation: {
    label: "Misinformation",
    subtypes: [
      { subtype: "news", label: "News" },
      { subtype: "text", label: "SMS / Text message" },
      { subtype: "email", label: "Email" },
      { subtype: "social_media", label: "Facebook / Social media" },
      { subtype: "other", label: "Some other venue" },
    ]
  },
  law: {
    label: "Problems with Law Enforcement",
    subtypes: [
      { subtype: "assist", label: "Refusing assistance" },
      { subtype: "response", label: "Aggressive or inappropriate response" },
      { subtype: "other", label: "Some other issue" },
    ]
  },
  courts: {
    label: "Courts",
    subtypes: [
      { subtype: nullKey, label: "Some problem (explain below)" },
    ]
  },
  polltape: {
    label: "Record Poll Tape / records",
    subtypes: [
      { subtype: "photo", label: "Attach a photo of the poll tape" },
      { subtype: "photo_missing", label: "Poll tape not posted or available" },
    ]
  },
  joy: {
    label: "Something Awesome",
    goodThing: true,
    subtypes: [
      { subtype: "patience", label: "Something Funny" },
      { subtype: "kindness", label: "Act of Kindness" },
      { subtype: "dancing", label: "Dancing" },
      { subtype: "other", label: "Some Other Awesome Thing" },
      // TODO(Dave): Implement these maybe?
    ]
  },
  other: {
    label: "Fraud or Other Issues",
    subtypes: [
      { subtype: "other", label: "Some other issue" },
      { subtype: "fraud", label: "Fraud allegation" },
    ]
  },
}


export type JoyType = {
  issue_type: "joy",
  issue_subtype: "dancing" | "kindness" | "patience" | "other",
}

// TODO(Dave): This is a really fast&loose type for expedience...
export type ProblemType = {
  issue_type: keyof IssueKeys,
  issue_subtype: string,
}

type AllIssueTypes =
  JoyType |
  ProblemType

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
