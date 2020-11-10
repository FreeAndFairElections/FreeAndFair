import { Persisted } from "../types/AppState"
import { UserData } from "../types/UserData"
import {LocationObject} from 'expo-location';

export enum Action {
  GoHome,
  EditUserData,
  SaveUserData,
  StartProblemReport,
  StartMisinformationReport,
  StartIntimidationReport,
  StartAwesomeReport,
  StartPollTapeReport,
  DismissSnackbar,
  OpenNavBar,
  SnackbarMessage,
  HomeDebugMessage,
  LoadedPersistedData,
  StoreDispatch,
  UpdateLocation,
  UpdateGeocodeHints,
}

export type Command = {
  type: Action.SnackbarMessage,
  message: string,
  timeoutMillis?: number,  // default: 2000ms
} | {
  type: Action.HomeDebugMessage,
  message: string,
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
  type: Action.UpdateGeocodeHints,
  cityHint?: string,
  stateHint?: string,
} | {
  // No-payload actions
  type: Action.GoHome |
        Action.EditUserData | 
        Action.StartProblemReport |
        Action.StartMisinformationReport |
        Action.StartIntimidationReport |
        Action.StartAwesomeReport |
        Action.StartPollTapeReport |
        Action.DismissSnackbar |
        Action.OpenNavBar
}

export type Dispatch = (c: Command) => void