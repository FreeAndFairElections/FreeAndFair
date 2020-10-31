import React, { FunctionComponent } from "react";
import { View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Dispatch } from "../actions/Actions";

type CB = {
  onSubmit: (when: Date) => void,
  onCancel: () => void,
}

type P = {
  enabled: boolean
  dispatch: Dispatch,
} & Partial<CB>

const ignore = () => { }
const noops: CB = {
  onSubmit: ignore,
  onCancel: ignore,
}

const DateTime: FunctionComponent<P> = (props) => {
  const p = { ...noops, ...props }

  return (
    <View>
      <DateTimePickerModal
        isVisible={p.enabled}
        mode="datetime"
        onConfirm={p.onSubmit}
        onCancel={p.onCancel}
      />
    </View>
  );
};

export default DateTime;