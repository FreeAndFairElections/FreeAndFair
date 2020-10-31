import { AppLoading } from 'expo';
import React, { FunctionComponent, useReducer, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, Provider as PaperProvider, Snackbar } from 'react-native-paper';
import { Action, Command } from './src/actions/Actions';
import HomeScreen from './src/components/screens/Home';
import UserInfoScreen from './src/components/screens/UserInfo';
import { cacheFonts, cacheImages } from './src/helpers/AssetsCaching';
import NavBar from './src/components/navbar/NavBar';
import Screen from './src/components/screens/Screen';
import AppState from './src/types/AppState';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

const screenReducer = (state: AppState, command: Command) => {
  switch (command.type) {
    case Action.StoreDispatch:
      return { ...state, dispatch: command.dispatch }
    case Action.SnackbarMessage:
      return { ...state, homeBanner: command.message }
    case Action.SaveUserData:
      // console.log(`Saving user info: ${JSON.stringify(command.payload)}`)
      state.persistStore.setItem(JSON.stringify(state.persist), (error?: Error) => {
        error && state.dispatch?.({
          type: Action.SnackbarMessage,
          message: `Save failed: ${error.message}`,
        })
      })
      return {
        ...state,
        persist: {
          ...state.persist,
          userData: command.payload,
        }
      }
    case Action.LoadedPersistedData:
      // console.log(`Loaded data: ${JSON.stringify(command.payload)}`)
      return {
        ...state,
        persist: command.payload,
      }
    case Action.GoHome:
      return { ...state, screen: Screen.Home }
    case Action.EditUserData:
      return { ...state, screen: Screen.UserInfo }
    case Action.StartProblemReport:
      return { ...state, screen: Screen.Home }
    case Action.StartAwesomeReport:
      // TODO(Dave): Complete me
      alert("IMPLEMENT ME")
      return { ...state }
    case Action.DismissSnackbar:
      return { ...state, homeBanner: undefined }
    case Action.OpenNavBar:
      state.navBar.current?.showNav()
      return { ...state }
  }
}

const App: FunctionComponent<{}> = (props) => {
  const [isReady, setIsReady] = useState(false)
  const navBar = useRef<NavBar>(null)

  const [state, dispatch] = useReducer(screenReducer, {
    screen: Screen.Home,
    navBar: navBar,
    persistStore: useAsyncStorage("persist"),
    persist: {}
  })

  const loadInitialAsync = async () => {
    const loadPersisted = state.persistStore.getItem((error?: Error, result?: string) => {
      if (error)
        dispatch({ type: Action.SnackbarMessage, message: `Load failed: ${error.message}` })
      if (result !== undefined) {
        // dispatch({ type: Action.SnackbarMessage, message: "Loaded app data" })
        dispatch({ type: Action.LoadedPersistedData, payload: JSON.parse(result) })
      }
    })

    const imageAssets = cacheImages([
      // require('./assets/images/bg_screen1.jpg'),
      // require('./assets/images/bg_screen2.jpg'),
      // require('./assets/images/bg_screen3.jpg'),
      // require('./assets/images/bg_screen4.jpg'),
      // require('./assets/images/user-cool.png'),
      // require('./assets/images/user-hp.png'),
      // require('./assets/images/user-student.png'),
      // require('./assets/images/avatar1.jpg'),
    ]);

    const fontAssets = cacheFonts([
      // ...vectorFonts,
      // { georgia: require('./assets/fonts/Georgia.ttf') },
      // { regular: require('./assets/fonts/Montserrat-Regular.ttf') },
      // { light: require('./assets/fonts/Montserrat-Light.ttf') },
      // { bold: require('./assets/fonts/Montserrat-Bold.ttf') },
      // { UbuntuLight: require('./assets/fonts/Ubuntu-Light.ttf') },
      // { UbuntuBold: require('./assets/fonts/Ubuntu-Bold.ttf') },
      // { UbuntuLightItalic: require('./assets/fonts/Ubuntu-Light-Italic.ttf') },
    ]);

    await Promise.all([loadPersisted, ...imageAssets, ...fontAssets]);
  };

  if (!isReady) {
    return (
      <AppLoading
        startAsync={loadInitialAsync}
        onFinish={() => setIsReady(true)}
        onError={console.warn}
      />
    );
  }

  return (
    <PaperProvider>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => dispatch({ type: Action.OpenNavBar })} />
        <Appbar.Content title="Free And Fair Elections" />
        <Appbar.Action icon="home" onPress={() => dispatch({ type: Action.GoHome })} />
      </Appbar.Header>
      <NavBar ref={navBar} appState={state} dispatch={dispatch}>
        {(() => {
          switch (state.screen) {
            case Screen.Home:
              return (
                <HomeScreen
                  dispatch={dispatch}
                  requireUserSetup={!state.persist?.userData}
                  homeBanner={state.homeBanner}
                />
              )
            case Screen.UserInfo:
              return (
                <UserInfoScreen
                  initialValues={state.persist?.userData || {}}
                  onCancel={() => {
                    dispatch({ type: Action.GoHome, })
                    dispatch({ type: Action.SnackbarMessage, message: "Canceled update..." })
                  }}
                  onSubmit={(data) => {
                    if (state.persist?.userData !== data)
                      dispatch({ type: Action.SnackbarMessage, message: "Saved user info" })
                    dispatch({ type: Action.SaveUserData, payload: data })
                    dispatch({ type: Action.GoHome })
                  }}
                />
              )
          }
        })()}
      </NavBar>
      {state.homeBanner &&
        <Snackbar
          visible={state.homeBanner ? true : false}
          duration={2000}
          onDismiss={() => dispatch({ type: Action.DismissSnackbar })}
        >
          {state.homeBanner}
        </Snackbar>
      }
    </PaperProvider>
  )
}
export default App;

const styles = StyleSheet.create({

})