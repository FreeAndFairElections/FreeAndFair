import { Persisted } from "../types/AppState"
import { UserData } from "../types/UserData"
import {LocationObject} from 'expo-location';

export enum Action {
  GoHome,
  EditUserData,
  SaveUserData,
  StartProblemReport,
  StartIntimidationReport,
  StartAwesomeReport,
  StartPollTapeReport,
  DismissSnackbar,
  OpenNavBar,
  SnackbarMessage,
  LoadedPersistedData,
  StoreDispatch,
  UpdateLocation,
}

export type Command = {
  type: Action.SnackbarMessage,
  message?: string,
} | {
  type: Action.SaveUserData,
  payload?: UserData
} | {
  type: Action.LoadedPersistedData,
  payload: Persisted,
} | {
  type: Action.StoreDispatch,
  dispatch: Dispatch,
} | {
  type: Action.UpdateLocation,
  location: LocationObject,
} | {
  // No-payload actions
  type: Action.GoHome |
        Action.EditUserData | 
        Action.StartProblemReport |
        Action.StartIntimidationReport |
        Action.StartAwesomeReport |
        Action.StartPollTapeReport |
        Action.DismissSnackbar |
        Action.OpenNavBar
}

export type Dispatch = (c: Command) => void