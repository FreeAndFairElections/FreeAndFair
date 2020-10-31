import { UserData } from './UserData';
import Screen from '../components/screens/Screen';
import { RefObject } from 'react';
import NavBar from '../components/navbar/NavBar';
import { Dispatch } from '../actions/Actions';

export type Persist = {
  userData?: UserData
}

type AppState = {
  screen: Screen;
  homeBanner?: string;
  navBar: RefObject<NavBar>;

  persist: Persist
  persistStore: {
    getItem(callback?: (error?: Error, result?: string) => void): Promise<string | null>;
    setItem(value: string, callback?: (error?: Error) => void): Promise<void>;
  };
  dispatch?: Dispatch;
}
export default AppState

