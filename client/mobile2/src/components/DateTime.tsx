import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { Action, Dispatch } from "../actions/Actions";

type CB = {
  onSubmit: (when: Date) => void,
  onCancel: () => void,
}

type P = {
  enabled: boolean,
  dispatch: Dispatch,
} & Partial<CB>

const ignore = () => { }
const noops: CB = {
  onSubmit: ignore,
  onCancel: ignore,
}

const DateTime: FunctionComponent<P> = (props) => {
  const p = { ...noops, ...props }
  p.dispatch({type: Action.SnackbarMessage, message: "TODO: Implement web date time picker"})
  // p.onCancel()
  return (
    <View>
      {p.enabled && <Text>TODO(Dave): Implement me!</Text>}
    </View>
  );
};

export default DateTime;