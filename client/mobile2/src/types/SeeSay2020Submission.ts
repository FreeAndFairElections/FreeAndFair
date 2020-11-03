
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
      [K2 in IssueKeys[K]]: {
        label: string,
        needsPhoto?: true,
      }
    }
  }
}

export const formSelectors: Readonly<FormSelectors> = {
  registration: {
    label: "Voter Check-in Problems",
    subtypes: {
      not_listed: { label: "Voter not present in voter rolls" },
      name_incorrect: { label: "Incorrect voter name or address" },
      already_voted: { label: "Voter shown as already voted" },
      other: { label: "Some other issue" },
    },
  },
  machine: {
    label: "Problems With Voting Machine",
    subtypes: {
      other: { label: "Some problem (explain below)" },
    },
  },
  intimidation: {
    label: "Voter Intimidation",
    subtypes: {
      polling_place_interference: { label: "Voting interference / Poll obstruction" },
      eligibility_challenged: { label: "ID requested or Eligibility challenged" },
      perusade_voter: { label: "Attempt to persuade voter in line" },
      non_authorized_person: { label: "Unauthorized people present" },
      advertising: { label: "Wrongful electioneering" },
      other: { label: "Some other issue" },
    },
  },
  place: {
    label: "Polling Place Issues",
    subtypes: {
      longlines: { label: "Long waiting lines to vote" },
      closed: { label: "Location closed / moved / inconvenient" },
      poll_worker: { label: "Problems with poll worker" },
      poll_tape: { label: "Problems with poll tape" },
      interfere: { label: "Interference or Obstruction of Voter" },
      other: { label: "Some other issue" },
    },
  },
  ballot: {
    label: "Ballot Issues",
    subtypes: {
      absentee: { label: "Problems with Absentee ballot" },
      provisional_not_offered: { label: "Provisional or affidavit ballot not offered" },
      missing: { label: "Candidate / Race is missing or incorrect" },
      ballot_removal: { label: "Ballot removal" },
      other: { label: "Some other issue" },
    },
  },
  access: {
    label: "Equal Access",
    subtypes: {
      language: { label: "Language access problems" },
      disability: { label: "Disability access problems" },
      other: { label: "Some other issue" },
    },
  },
  misinformation: {
    label: "Misinformation",
    subtypes: {
      news: { label: "News" },
      text: { label: "SMS / Text message" },
      email: { label: "Email" },
      social_media: { label: "Facebook / Social media" },
      other: { label: "Some other venue" },
    },
  },
  law: {
    label: "Problems with Law Enforcement",
    subtypes: {
      assist: { label: "Refusing assistance" },
      response: { label: "Aggressive or inappropriate response" },
      other: { label: "Some other issue" },
    },
  },
  courts: {
    label: "Courts",
    subtypes: {
      other: { label: "Some problem (explain below)" },
    },
  },
  polltape: {
    label: "Record Poll Tape / records",
    subtypes: {
      photo: { label: "Attach a photo of the poll tape", needsPhoto: true },
      photo_missing: { label: "Poll tape not posted or available" },
    },
  },
  joy: {
    label: "Something Awesome",
    goodThing: true,
    subtypes: {
      patience: { label: "Something Funny" },
      kindness: { label: "Act of Kindness" },
      dancing: { label: "Dancing", needsPhoto: true },
      other: { label: "Some Other Awesome Thing" },
    },
  },
  other: {
    label: "Fraud or Other Issues",
    subtypes: {
      other: { label: "Some other issue" },
      fraud: { label: "Fraud allegation" },
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
  photos?: string[],
}

type SeeSay2020Submission = BaseForm & IssueTypes
export default SeeSay2020Submission
