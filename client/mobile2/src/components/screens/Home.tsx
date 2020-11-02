import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Action, Command } from '../../actions/Actions';

type P = {
  dispatch: (command: Command) => void,
  homeBanner?: string,
  requireUserSetup: boolean,
}

const HomeScreen: FunctionComponent<P> = (p) => {
  return (
    <View style={{
      alignItems: "center",
      margin: 10,
      flexDirection: "column",
      flexGrow: 1
    }}>
      <Text style={styles.text}>What would you like to do?</Text>

      <Button
        mode={p.requireUserSetup ? "contained" : "outlined"}
        onPress={() => p.dispatch({ type: Action.EditUserData })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
      >Edit User Info</Button>

      <Button
        mode="contained"
        color="#ff2020"
        onPress={() => p.dispatch({ type: Action.StartIntimidationReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >Voter Intimidation</Button>

      <Button
        mode="contained"
        color="#2020ff"
        onPress={() => p.dispatch({ type: Action.StartProblemReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >Election Problems</Button>

      <Button
        mode="contained"
        color="#2020ff"
        onPress={() => p.dispatch({ type: Action.StartAwesomeReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >Something Awesome</Button>
      {p.children}

      <Button
        mode="contained"
        color="#80ff80"
        onPress={() => p.dispatch({ type: Action.StartPollTapeReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >Poll Tape Report Photos</Button>
      {p.children}
    </View>
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