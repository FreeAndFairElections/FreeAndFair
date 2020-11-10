import React, { FunctionComponent } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';
import { Action, Command } from '../../actions/Actions';

type P = {
  dispatch: (command: Command) => void,
  requireUserSetup: boolean,
  debugOutput?: string,
}

const HomeScreen: FunctionComponent<P> = (p) => {
  return (
    <ScrollView
      style={{
        margin: 10,
        flexDirection: "column",
        flexGrow: 1
      }}
      contentContainerStyle={{
        alignItems: "center",
      }}
    >
      <Text style={styles.text}>What would you like to do?</Text>

      <Button
        mode={p.requireUserSetup ? "contained" : "outlined"}
        onPress={() => p.dispatch({ type: Action.EditUserData })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
      >
        Edit User Info
      </Button>

      <Button
        mode="contained"
        color="#ff2020"
        onPress={() => p.dispatch({ type: Action.StartIntimidationReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >
        Report Voter Intimidation
      </Button>

      <Button
        mode="contained"
        color="#2020ff"
        onPress={() => p.dispatch({ type: Action.StartMisinformationReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >
        Report Misinformation
      </Button>

      <Button
        mode="contained"
        color="#2020ff"
        onPress={() => p.dispatch({ type: Action.StartProblemReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >
        Report Other Election Problems
      </Button>

      <Button
        mode="contained"
        color="#80ff80"
        onPress={() => p.dispatch({ type: Action.StartAwesomeReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >
        Report Awesomeness
      </Button>

      <Button
        mode="contained"
        color="#90ffe8"
        onPress={() => p.dispatch({ type: Action.StartPollTapeReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >
        Poll Tape Report Photos
      </Button>

      <Button
      mode="outlined"
      icon="map-marker"
      onPress={() => Linking.openURL("http://www.seesay2020map.com")}
      contentStyle={styles.buttonInner}
      style={styles.buttonOuter}
      >
        See reports on SeeSay2020Map.com
      </Button>
      {p.children}

      <Button
      mode="outlined"
      icon="phone"
      onPress={() => Linking.openURL("tel://866OURVOTE")}
      contentStyle={styles.buttonInner}
      style={styles.buttonOuter}
      >
        Report via 866-OUR-VOTE
      </Button>

      {p.children}

      {p.debugOutput &&
        <View><Divider /><Text>{p.debugOutput}</Text></View>
      }
    </ScrollView>
  )

}
export default HomeScreen

const styles = StyleSheet.create({
  buttonInner: {
    width: 400,
    marginVertical: 10,
  },

  buttonOuter: {
    margin: 10,
  },

  text: {
    fontSize: 20,
    margin: 10,
  },
})