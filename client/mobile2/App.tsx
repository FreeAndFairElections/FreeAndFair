// import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useBackHandler } from '@react-native-community/hooks';
import ReverseGeocode from "bigdatacloud-reverse-geocoding";
import { AppLoading } from 'expo';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import React, { FunctionComponent, useReducer, useRef, useState } from 'react';
import { AsyncStorage, StyleSheet, Text, View } from 'react-native';
import { Appbar, Provider as PaperProvider, Snackbar } from 'react-native-paper';
import { Action, Command } from './src/actions/Actions';
import NavBar from './src/components/navbar/NavBar';
import HomeScreen from './src/components/screens/Home';
import IncidentReport from './src/components/screens/IncidentReport';
import UserInfoScreen from './src/components/screens/UserInfo';
import { cacheFonts, cacheImages } from './src/helpers/AssetsCaching';
import { submitToSeeSay2020 } from './src/helpers/SeeSaySubmit';
import { drop, pick } from './src/helpers/TypeFunctions';
import { default as AppScreen, default as Screen } from './src/types/AppScreen';
import AppState, { Persisted } from './src/types/AppState';
import SeeSay2020Submission, { FormSelectors, formSelectors } from './src/types/SeeSay2020Submission';

export const knownDuplicateUUID = "{D2B87037-D429-402D-87AB-DA024D92653C}"

const useAsyncStorage = (key: string)/*: AsyncStorageHook*/ => {
  return {
    getItem: (cb: any) => AsyncStorage.getItem(key, cb),
    setItem: (val: string, cb: any) => AsyncStorage.setItem(key, val, cb),
    mergeItem: (val: string, cb: any) => AsyncStorage.mergeItem(key, val, cb),
    removeItem: (cb: any) => AsyncStorage.removeItem(key, cb),
  };
}

const screenReducer: (s: AppState, c: Command) => AppState = (state, command) => {
  const save = (newPersisted: Persisted) => {
    const toSave = JSON.stringify(newPersisted)
    state.log(`Saving user info: ${toSave}`)

    state.persistStore.setItem(toSave, (error?: Error) => {
      error && state.dispatch?.({
        type: Action.SnackbarMessage,
        message: `App data save failed: ${error.message}`,
      })
    })
    return {
      ...state,
      persisted: newPersisted
    }
  }
  switch (command.type) {
    case Action.StoreDispatch:
      return { ...state, dispatch: command.dispatch }
    case Action.SnackbarMessage:
      return {
        ...state,
        snackbarMessage: command.message,
        snackbarTimeoutMillis: command.timeoutMillis
      }
    case Action.HomeDebugMessage:
      return { ...state, homeDebugMessage: state.devBuild ? command.message : undefined, }
    case Action.SaveUserData:
      return save({ ...state.persisted, userData: command.payload })
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
    case Action.StartPollTapeReport:
      return { ...state, screen: AppScreen.PollTapeReport }
    case Action.DismissSnackbar:
      return { ...state, snackbarMessage: undefined, snackbarTimeoutMillis: undefined }
    case Action.OpenNavBar:
      state.navBar.current?.openNav()
      return { ...state }
    case Action.UpdateLocation:
      return { ...state, location: command.location }
    case Action.UpdateGeocodeHints:
      return save({
        ...state.persisted,
        cityHint: command.cityHint,
        stateHint: command.stateHint
      })
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

  useBackHandler(() => {
    if (state.screen !== Screen.Home) {
      // handle it
      dispatch({ type: Action.GoHome })
      return true
    }
    // let the default thing happen
    return false
  })

  const loadInitialAsync = async () => {
    const loadPersisted = state.persistStore.getItem((error?: Error, result?: string) => {
      if (error) {
        dispatch({ type: Action.SnackbarMessage, message: `Load failed: ${error.message}` })
        state.log(`Load failed: ${JSON.stringify(error)}`)
      }
      if (result) {
        // dispatch({ type: Action.SnackbarMessage, message: "Loaded app data" })
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
        setTimeout(startLocation, 5000)
      } else {
        const locationEndWatch = await Location.watchPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 1000,
          mayShowUserSettingsDialog: true,
        }, (location: LocationObject) => {
          // dispatch({ type: Action.SnackbarMessage, message: "location update", timeoutMillis: 250 })
          dispatch({ type: Action.UpdateLocation, location: location })
          // dispatch({
          //   type: Action.SnackbarMessage,
          //   message: `Got location: ${location.coords.latitude} ${location.coords.longitude}`,
          //   timeoutMillis: 500,
          // })
          const geocode = new ReverseGeocode
          const place = geocode.locate({
            lat: location.coords.latitude,
            long: location.coords.longitude
          })
          place.then(v => {
            state.log(`Geocoded to ${JSON.stringify(v, null, 2)}`)
            var city = (v as any).city
            if (!city) {
              for (const level of (((v as any).localityInfo.administrative) as { name: string, adminLevel: number }[]).reverse())
                if (level.adminLevel < 9 && level.adminLevel >= 6) {
                  city = level.name
                  break
                }
            }
            const stateAbbrev = ((v as any).principalSubdivisionCode as string | undefined)?.slice(3)

            // Debug stuff
            if (state.devBuild) {
              // dispatch({
              //   type: Action.HomeDebugMessage,
              //   // message: `Geocoded to: ${JSON.stringify(v, null, 2)}`
              //   message: `Got location: ${city}, ${stateAbbrev}`
              // })

              // if (city !== state.persisted.cityHint || stateAbbrev !== state.persisted.stateHint) {
              //   dispatch({
              //     type: Action.SnackbarMessage,
              //     message: `Got location: ${city}, ${stateAbbrev}`
              //   })
              // }
              state.log(`Got location: ${city}, ${stateAbbrev}`)
            }

            dispatch({
              type: Action.UpdateGeocodeHints,
              cityHint: city,
              stateHint: stateAbbrev,
            })
          }, (e) => { state.log(`Failed to geocode: ${JSON.stringify(e, null, 2)}`) })
        })

        // mapRef.current?.animateCamera({center: location.coords, zoom: 16})
      }
    })

    setTimeout(startLocation, 500)

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

  const report = (
    type: string,
    what: Partial<Readonly<FormSelectors>>,
    initial: Pick<SeeSay2020Submission, "issue_type" | "issue_subtype">) => {
    if (state.location) {
      return (
        <IncidentReport
          initialValues={{
            incident_city: state.persisted.cityHint,
            incident_state: state.persisted.stateHint,
            ...initial,
            ...(state.devBuild && { globalid: knownDuplicateUUID }),
          }}
          dispatch={dispatch}
          location={state.location}
          formStructure={what}
          onCancel={() => dispatch({ type: Action.GoHome })}
          onSubmit={(f) => {
            state.log(`Created ${type} report ${JSON.stringify(f, null, 2)}`)
            submitToSeeSay2020(
              state.persisted.userData!,
              f,
              state.location!,
              dispatch,
              state.log)
            dispatch({ type: Action.GoHome })
            dispatch({ type: Action.SnackbarMessage, message: `Submitting ${type} report` })
          }}
        />
      )
    } else {
      dispatch({ type: Action.GoHome })
      return <View><Text>Location permissions are required</Text></View>
    }
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
                  debugOutput={state.homeDebugMessage}
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
              return report(
                "intimidation",
                pick(formSelectors, "intimidation"),
                {
                  issue_type: "intimidation",
                  issue_subtype: "polling_place_interference",
                })
            case AppScreen.ProblemReport:
              return report(
                "problem",
                drop(formSelectors, "joy", "intimidation", "polltape"),
                {
                  issue_type: "registration",
                  issue_subtype: "not_listed",
                })
            case AppScreen.JoyReport:
              return report(
                "joy",
                pick(formSelectors, "joy"),
                {
                  issue_type: "joy",
                  issue_subtype: "patience",
                })
            case AppScreen.PollTapeReport:
              return report(
                "poll tape",
                pick(formSelectors, "polltape"),
                {
                  issue_type: "polltape",
                  issue_subtype: "photo",
                })
          }
        })()}
      </NavBar>
      {state.snackbarMessage &&
        <Snackbar
          visible={state.snackbarMessage ? true : false}
          duration={state.snackbarMessage ? (state.snackbarTimeoutMillis ?? 2000) : undefined}
          onDismiss={() => dispatch({ type: Action.DismissSnackbar })}
        >
          {state.snackbarMessage}
        </Snackbar>
      }
    </PaperProvider>
  )
}
export default App;

const styles = StyleSheet.create({

})