import { UserData } from './UserData';
import AppScreen from './AppScreen';
import { RefObject } from 'react';
import NavBar from '../components/navbar/NavBar';
import { Dispatch } from '../actions/Actions';
import Location from 'expo-location';

export type Persisted = {
  userData?: UserData
}

export type PersistStore = {
  getItem(callback?: (error?: Error, result?: string) => void): Promise<string | null>;
  setItem(value: string, callback?: (error?: Error) => void): Promise<void>;
}

export interface Log {
  (message?: any, ...optionalParams: any[]): void;
}

type AppState = {
  screen: AppScreen;
  homeBanner?: string;
  navBar: RefObject<NavBar>;
  navBarOpen: boolean;
  location?: Location.LocationObject;
  log: Log;

  persisted: Persisted
  persistStore: PersistStore;
  dispatch?: Dispatch;
}
export default AppState

