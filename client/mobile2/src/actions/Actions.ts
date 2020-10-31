import { Persist } from "../types/AppState"
import { UserData } from "../types/UserData"

export enum Action {
  GoHome,
  EditUserData,
  SaveUserData,
  StartProblemReport,
  StartAwesomeReport,
  DismissSnackbar,
  OpenNavBar,
  SnackbarMessage,
  LoadedPersistedData,
  StoreDispatch,
}

export type Command = {
  type: Action.SnackbarMessage,
  message?: string,
} | {
  type: Action.SaveUserData,
  payload?: UserData
} | {
  type: Action.LoadedPersistedData,
  payload: Persist,
} | {
  type: Action.StoreDispatch,
  dispatch: Dispatch,
} | {
  // No-payload actions
  type: Action.GoHome |
        Action.EditUserData | 
        Action.StartProblemReport |
        Action.StartAwesomeReport |
        Action.DismissSnackbar |
        Action.OpenNavBar
}

export type Dispatch = (c: Command) => void