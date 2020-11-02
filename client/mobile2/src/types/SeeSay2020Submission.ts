
type IssueKeys = {
  registration: "not_listed" | "name_incorrect" | "already_voted" | "other"
  machine: "other"
  intimidation: "polling_place_interference" | "eligibility_challenged" | "perusade_voter" | "non_authorized_person" | "advertising" | "other"
  place: "longlines" | "closed" | "poll_worker" | "poll_tape" | "interfere" | "other"
  ballot: "absentee" | "provisional_not_offered" | "missing" | "ballot_removal" | "other"
  access: "language" | "disability" | "other"
  misinformation: "news" | "text" | "email" | "social_media" | "other"
  law: "assist" | "response" | "other"
  courts: "other"
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
  [K in keyof IssueKeys]: {
    label: string,
    goodThing?: true,
    subtypes: {
      [K2 in IssueKeys[K]]: string
    }
  }
}

export const formSelectors: Readonly<FormSelectors> = {
  registration: {
    label: "Voter Check-in Problems",
    subtypes: {
      not_listed: "Voter not present in voter rolls",
      name_incorrect: "Incorrect voter name or address",
      already_voted: "Voter shown as already voted",
      other: "Some other issue",
    },
  },
  machine: {
    label: "Problems With Voting Machine",
    subtypes: {
      other: "Some problem (explain below)"
    },
  },
  intimidation: {
    label: "Voter Intimidation",
    subtypes: {
      polling_place_interference: "Voting interference / Poll obstruction",
      eligibility_challenged: "ID requested or Eligibility challenged",
      perusade_voter: "Attempt to persuade voter in line",
      non_authorized_person: "Unauthorized people present",
      advertising: "Wrongful electioneering",
      other: "Some other issue",
    },
  },
  place: {
    label: "Polling Place Issues",
    subtypes: {
      longlines: "Long waiting lines to vote",
      closed: "Location closed / moved / inconvenient",
      poll_worker: "Problems with poll worker",
      poll_tape: "Problems with poll tape",
      interfere: "Interference or Obstruction of Voter",
      other: "Some other issue",
    },
  },
  ballot: {
    label: "Ballot Issues",
    subtypes: {
      absentee: "Problems with Absentee ballot",
      provisional_not_offered: "Provisional or affidavit ballot not offered",
      missing: "Candidate / Race is missing or incorrect",
      ballot_removal: "Ballot removal",
      other: "Some other issue",
    },
  },
  access: {
    label: "Equal Access",
    subtypes: {
      language: "Language access problems",
      disability: "Disability access problems",
      other: "Some other issue",
    },
  },
  misinformation: {
    label: "Misinformation",
    subtypes: {
      news: "News",
      text: "SMS / Text message",
      email: "Email",
      social_media: "Facebook / Social media",
      other: "Some other venue",
    },
  },
  law: {
    label: "Problems with Law Enforcement",
    subtypes: {
      assist: "Refusing assistance",
      response: "Aggressive or inappropriate response",
      other: "Some other issue",
    },
  },
  courts: {
    label: "Courts",
    subtypes: {
      other: "Some problem (explain below)",
    },
  },
  polltape: {
    label: "Record Poll Tape / records",
    subtypes: {
      photo: "Attach a photo of the poll tape",
      photo_missing: "Poll tape not posted or available",
    },
  },
  joy: {
    label: "Something Awesome",
    goodThing: true,
    subtypes: {
      patience: "Something Funny",
      kindness: "Act of Kindness",
      dancing: "Dancing",
      other: "Some Other Awesome Thing",
    },
  },
  other: {
    label: "Fraud or Other Issues",
    subtypes: {
      other: "Some other issue",
      fraud: "Fraud allegation",
    },
  },
} as const

type Munge<T> =
  { [K in keyof T]: { issue_type: K, issue_subtype: T[K] } }[keyof T];
export type IssueTypes = Munge<IssueKeys>

export type BaseForm = {
  description: string,
  incident_state: string,
  incident_city: string,
  // TODO(Dave): Fix this shit.
  incident_time: string,  // microseconds since epoch
  globalid: string,
}

type SeeSay2020Submission = BaseForm & IssueTypes
export default SeeSay2020Submission
