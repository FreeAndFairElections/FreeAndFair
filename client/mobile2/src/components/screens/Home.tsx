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
        mode="contained"
        onPress={() => p.dispatch({ type: Action.EditUserData })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
      >Edit User Info</Button>

      <Button
        mode="contained"
        onPress={() => p.dispatch({ type: Action.StartProblemReport })}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >Report Election Problems</Button>

      <Button
        mode="contained"
        onPress={() => { }}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
        {...(p.requireUserSetup && { disabled: true })}
      >Report Something Awesome</Button>
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