import React, { FunctionComponent } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
        onPress={() => p.dispatch({ type: Action.StartProblemReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >
        Report Election Problems
      </Button>

      <Button
        mode="contained"
        color="#2020ff"
        onPress={() => p.dispatch({ type: Action.StartAwesomeReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >
        Report Something Awesome
      </Button>

      <Button
        mode="contained"
        color="#80ff80"
        onPress={() => p.dispatch({ type: Action.StartPollTapeReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >
        Poll Tape Report Photos
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
    width: 350,
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