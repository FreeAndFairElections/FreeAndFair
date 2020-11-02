import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { AppLoading } from 'expo';
import * as Location from 'expo-location';
import React, { FunctionComponent, useReducer, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Appbar, Provider as PaperProvider, Snackbar } from 'react-native-paper';
import { Action, Command } from './src/actions/Actions';
import NavBar from './src/components/navbar/NavBar';
import HomeScreen from './src/components/screens/Home';
import IncidentReport from './src/components/screens/IncidentReport';
import UserInfoScreen from './src/components/screens/UserInfo';
import { cacheFonts, cacheImages } from './src/helpers/AssetsCaching';
import { submitToSeeSay2020 } from './src/helpers/SeeSaySubmit';
import AppScreen from './src/types/AppScreen';
import AppState from './src/types/AppState';
import { drop, formSelectors, pick } from './src/types/SeeSay2020Submission';

export const knownDuplicateUUID = "{D2B87037-D429-402D-87AB-DA024D92653C}"

const screenReducer: (s: AppState, c: Command) => AppState = (state, command) => {
  switch (command.type) {
    case Action.StoreDispatch:
      return { ...state, dispatch: command.dispatch }
    case Action.SnackbarMessage:
      return { ...state, homeBanner: command.message }
    case Action.SaveUserData:
      const newPersisted = { ...state.persisted, userData: command.payload }
      const toSave = JSON.stringify(newPersisted)
      state.log(`Saving user info: ${toSave}`)

      state.persistStore.setItem(toSave, (error?: Error) => {
        error && state.dispatch?.({
          type: Action.SnackbarMessage,
          message: `Save failed: ${error.message}`,
        })
      })
      return {
        ...state,
        persisted: newPersisted
      }
    case Action.LoadedPersistedData:
      state.log(`Loaded data: ${JSON.stringify(command.payload)}`)
      return {
        ...state,
        persisted: command.payload,
      }
    case Action.GoHome:
      return { ...state, screen: AppScreen.Home }
    case Action.EditUserData:
      return { ...state, screen: AppScreen.UserInfo }
    case Action.StartProblemReport:
      return { ...state, screen: AppScreen.ProblemReport }
    case Action.StartIntimidationReport:
      return { ...state, screen: AppScreen.IntimidationReport }
    case Action.StartAwesomeReport:
      return { ...state, screen: AppScreen.JoyReport }
    case Action.DismissSnackbar:
      return { ...state, homeBanner: undefined }
    case Action.OpenNavBar:
      state.navBar.current?.openNav()
      return { ...state }
    case Action.UpdateLocation:
      return { ...state, location: command.location }
  }
}

type Props = {
  exp?: {
    manifest?: {
      packagerOpts?: {
        dev?: boolean
      }
    }
  }
}

const App: FunctionComponent<Props> = (props) => {
  const navBar = useRef<NavBar>(null)
  const initialState: AppState = {
    screen: AppScreen.Home,
    navBar: navBar,
    navBarOpen: false,
    log: (m, ...p) =>
      (props.exp?.manifest?.packagerOpts?.dev ? console.log(m, p) : undefined),
    devBuild: props.exp?.manifest?.packagerOpts?.dev ? true : false,
    persistStore: useAsyncStorage("persisted"),
    persisted: {}
  }
  const [state, dispatch] = useReducer(screenReducer, initialState)
  const [isReady, setIsReady] = useState(false)

  const loadInitialAsync = async () => {
    const loadPersisted = state.persistStore.getItem((error?: Error, result?: string) => {
      if (error) {
        dispatch({ type: Action.SnackbarMessage, message: `Load failed: ${error.message}` })
        state.log(`Load failed: ${JSON.stringify(error)}`)
      }
      if (result) {
        dispatch({ type: Action.SnackbarMessage, message: "Loaded app data" })
        dispatch({ type: Action.LoadedPersistedData, payload: JSON.parse(result) || {} })
        state.log(`Loaded: ${result}`)
      }
    })

    const startLocation = (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        // TODO(Dave): Make this a modal failure
        dispatch({
          type: Action.SnackbarMessage,
          message: "Required Location Permission Denied"
        })
      } else {
        let location = await Location.getCurrentPositionAsync({});
        dispatch({ type: Action.UpdateLocation, location: location })
        // dispatch({
        //   type: Action.SnackbarMessage,
        //   message: `Got location: ${location.coords.latitude} ${location.coords.longitude}`
        // })

        // mapRef.current?.animateCamera({center: location.coords, zoom: 16})
      }
    })

    // Update the location every few seconds
    setTimeout(startLocation, 1000)
    setInterval(startLocation, 30000)

    const imageAssets = cacheImages([
      require('./assets/FreeAndFair2020-splash2.png'),
      require('./assets/FreeAndFair2020-icon4.png'),
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

    await Promise.all([loadPersisted, /*startLocation(),*/ ...imageAssets, ...fontAssets]);
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
      <NavBar
        ref={navBar}
        dispatch={dispatch}
        screen={state.screen}
        userDataSet={
          state.persisted.userData ? true : false
        }
      >
        {(() => {
          switch (state.screen) {
            case AppScreen.Home:
              return (
                <HomeScreen
                  dispatch={dispatch}
                  requireUserSetup={!state.persisted.userData}
                  homeBanner={state.homeBanner}
                />
              )
            case AppScreen.UserInfo:
              return (
                <UserInfoScreen
                  initialValues={state.persisted.userData || {}}
                  onCancel={() => {
                    dispatch({ type: Action.GoHome, })
                    // dispatch({ type: Action.SnackbarMessage, message: "Canceled update..." })
                  }}
                  onSubmit={(data) => {
                    if (state.persisted.userData !== data)
                      dispatch({ type: Action.SnackbarMessage, message: "Saved user info" })
                    dispatch({ type: Action.SaveUserData, payload: data })
                    dispatch({ type: Action.GoHome })
                  }}
                />
              )
            case AppScreen.IntimidationReport:
              if (state.location) {
                return (
                  <IncidentReport
                    initialValues={{
                      issue_type: "intimidation",
                      issue_subtype: "polling_place_interference",
                      ...(state.devBuild && { globalid: knownDuplicateUUID }),
                    }}
                    dispatch={dispatch}
                    location={state.location}
                    formStructure={pick(formSelectors, "intimidation")}
                    // display={x => x.goodThing ?? false}
                    onCancel={() => dispatch({ type: Action.GoHome })}
                    onSubmit={(f) => {
                      state.log(`Created joy report ${JSON.stringify(f, null, 2)}`)
                      submitToSeeSay2020(
                        state.persisted.userData!,
                        f,
                        state.location!,
                        dispatch,
                        state.log)
                      dispatch({ type: Action.GoHome })
                      dispatch({ type: Action.SnackbarMessage, message: "Submitting joy report" })
                    }}
                  />
                )
              } else {
                dispatch({ type: Action.GoHome })
                return <View><Text>Location permissions are required</Text></View>
              }
            case AppScreen.ProblemReport:
              if (state.location) {
                return (
                  <IncidentReport
                    initialValues={{
                      issue_type: "registration",
                      issue_subtype: "not_listed",
                      ...(state.devBuild && { globalid: knownDuplicateUUID }),
                    }}
                    dispatch={dispatch}
                    location={state.location}
                    formStructure={drop(formSelectors, "joy")}
                    // display={x => !x.goodThing ?? false}
                    onCancel={() => dispatch({ type: Action.GoHome })}
                    onSubmit={(f) => {
                      state.log(`Created problem report ${JSON.stringify(f, null, 2)}`)
                      submitToSeeSay2020(
                        state.persisted.userData!,
                        f,
                        state.location!,
                        dispatch,
                        state.log)
                      dispatch({ type: Action.GoHome })
                      dispatch({ type: Action.SnackbarMessage, message: "Submitting problem report" })
                    }}
                  />
                )
              } else {
                dispatch({ type: Action.GoHome })
                return <View><Text>Location permissions are required</Text></View>
              }
            case AppScreen.JoyReport:
              if (state.location) {
                return (
                  <IncidentReport
                    initialValues={{
                      issue_type: "joy",
                      issue_subtype: "patience",
                      ...(state.devBuild && { globalid: knownDuplicateUUID }),
                    }}
                    dispatch={dispatch}
                    location={state.location}
                    formStructure={pick(formSelectors, "joy")}
                    // display={x => x.goodThing ?? false}
                    onCancel={() => dispatch({ type: Action.GoHome })}
                    onSubmit={(f) => {
                      state.log(`Created joy report ${JSON.stringify(f, null, 2)}`)
                      submitToSeeSay2020(
                        state.persisted.userData!,
                        f,
                        state.location!,
                        dispatch,
                        state.log)
                      dispatch({ type: Action.GoHome })
                      dispatch({ type: Action.SnackbarMessage, message: "Submitting joy report" })
                    }}
                  />
                  // <JoyReport
                  //   initialValues={{
                  //     ...(state.devBuild && { globalid: knownDuplicateUUID })
                  //   }}
                  //   dispatch={dispatch}
                  //   location={state.location}
                  //   onCancel={() => dispatch({ type: Action.GoHome })}
                  //   onSubmit={(f) => {
                  //     state.log(`Created joy report ${JSON.stringify(f, null, 2)}`)
                  //     submitToSeeSay2020(
                  //       state.persisted.userData!,
                  //       f,
                  //       state.location!,
                  //       dispatch,
                  //       state.log)
                  //     dispatch({ type: Action.GoHome })
                  //     dispatch({ type: Action.SnackbarMessage, message: "Submitting awesomeness report" })
                  //   }}
                  // />
                )
              } else {
                dispatch({ type: Action.GoHome })
                return <View><Text>Location permissions are required</Text></View>
              }
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