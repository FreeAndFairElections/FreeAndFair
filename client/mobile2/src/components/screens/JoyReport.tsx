import { LocationObject } from 'expo-location';
import { Formik } from 'formik';
import React, { FunctionComponent, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Input } from 'react-native-elements';
import { TextInputMask, TextInputMaskProps } from 'react-native-masked-text';
import { Button, Headline, RadioButton, Text } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { Command } from '../../actions/Actions';
import DateTime from '../DateTime'; 
import uuid from 'react-native-uuid'

export const knownDuplicateUUID = "{D2B87037-D429-402D-87AB-DA024D92653C}"

export type Form = {
  issue_type: "joy",
  issue_subtype: "dancing" | "kindness" | "patience" | "other",
  description: string,
  incident_state: string,
  incident_city: string,
  // TODO(Dave): Fix this shit.
  incident_time: string,  // microseconds since epoch
  globalid: string,
}
type CB = {
  onSubmit: (form: Form) => void,
  onCancel: () => void,
}
type P = {
  dispatch: (command: Command) => void,
  initialValues: Partial<Form>,
  location: LocationObject,
} & Partial<CB>
type FormErrors = {
  [K in keyof Form]?: String
}
export const emptyFormData: Form = Object.seal({
  issue_type: "joy",
  issue_subtype: "patience",
  description: "",
  incident_state: "",
  incident_city: "",
  incident_time: `${(new Date()).getTime()}`,  // milliseconds since epoch  
  globalid: `{${uuid.v4()}}`,
  // globalid: knownDuplicateUUID
})

const ignore = () => { }
const noops: CB = {
  onSubmit: ignore,
  onCancel: ignore,
}

const JoyReport: FunctionComponent<P> = (props) => {
  const p = { ...noops, ...props }
  const [dateVisible, setDateVisible] = useState(false)

  const validate: (f: Form) => void | object = (f) => {
    const errors: FormErrors = {}

    if (!f.incident_city)
      errors.incident_city = "Missing City"

    if (!f.incident_state || f.incident_state.length != 2)
      errors.incident_state = "Missing State"

    return errors
  }

  return (
    <View style={{ flex: 1 }}>
      <Formik<Form>
        initialValues={{ ...emptyFormData, ...props.initialValues }}
        validateOnChange={true}
        validateOnMount={true}
        validateOnBlur={true}
        onSubmit={p.onSubmit}
        validate={validate}
      >
        {({ handleChange, handleBlur, handleSubmit, touched, errors, values }) => {
          const radio = (label: string, value: string, extraViewStyle?: ViewStyle) => (
            <View style={{
              ...extraViewStyle,
            }}>
              <RadioButton.Item label={label} value={value} />
            </View>
          )
          type CustomInput<P> = {
            component?: React.ComponentType<P>
            props?: P
          }
          const textInput = <P extends {} = TextInputProps>(
            p: keyof Form,
            label: string,
            customInput?: CustomInput<P>,
            customRender: (input: string) => string = x => x) => (
              <Input
                {...(customInput?.component && { InputComponent: customInput.component })}
                onChangeText={handleChange(p)}
                onBlur={handleBlur(p)}
                value={customRender(values[p])}
                label={label}
                renderErrorMessage={true}
                inputStyle={{
                  ...styles.text,
                  // The red error background seems to cause text fields to scroll within the containing view!  :(
                  // ...(touched[p] && errors[p] && badValue(p))
                }}
                {...(customInput?.props)}
                {...(touched[p] && { errorMessage: errors[p] })}
              />
            )

          return (
            <KeyboardAvoidingView
              behavior={'height'}
              enabled
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 84}
            >
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxWidth: 500 }} >
                <Headline style={{
                  margin: 5,
                  marginVertical: 10
                }}>
                  What did you see?
                </Headline>
                <RadioButton.Group
                  onValueChange={value => handleChange("issue_subtype")(value)}
                  value={values.issue_subtype}
                >
                  {radio("Something Humorous", "patience", { backgroundColor: "#f8f8f8", borderTopWidth: 1 })}
                  {radio("Act of Kindness", "kindness")}
                  {radio("Dancing", "dancing", { backgroundColor: "#f8f8f8" })}
                  {radio("Something Else", "other", { borderBottomWidth: 1 })}
                </RadioButton.Group>

                {textInput("incident_city", "City")}

                {/* TODO(Dave): Replace the STATE picker */}
                {textInput<TextInputMaskProps>("incident_state", "State", {
                  component: TextInputMask,
                  props: {
                    onChangeText: handleChange("incident_state"),
                    // placeholder: "State",
                    type: "custom",
                    options: {
                      mask: "AA",
                    },
                    keyboardType: "default",
                  }
                })}

                <TouchableOpacity
                  onPress={() => setDateVisible(true)}
                >
                  {textInput("incident_time", "When", {
                    props: {
                      disabled: true,
                    }
                  }, (d) => `${new Date(parseInt(d)).toLocaleString()}`)}
                  <DateTime
                    enabled={dateVisible}
                    dispatch={p.dispatch}
                    onCancel={() => setDateVisible(false)}
                    onSubmit={(d) => {
                      console.log(`picked: ${d} ${d.getTime()}`)
                      handleChange("incident_time")(`${d.getTime()}`)
                      setDateVisible(false)
                    }}
                  />
                </TouchableOpacity>

                {textInput("description", "Details", {
                  props: {
                    multiline: true
                  }
                })}

                <View style={styles.footerButtonGroup}>
                  <Button
                    mode="outlined"
                    onPress={p.onCancel}
                    style={styles.buttonOuter}
                    contentStyle={styles.buttonInner}
                  >Cancel</Button>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.buttonOuter}
                    contentStyle={styles.buttonInner}
                  >Submit</Button>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          )
        }}
      </Formik>
    </View>
  )
}

export default JoyReport

const styles = StyleSheet.create({
  footerButtonGroup: {
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },

  buttonInner: {
    marginVertical: 10,
  },

  buttonOuter: {
    margin: 10,
    flex: .3
  },

  text: {
    margin: 10,
    padding: 2,
    fontSize: 24,
  },
})