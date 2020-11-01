import { LocationObject } from 'expo-location';
import { Formik } from 'formik';
import React, { FunctionComponent, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Input } from 'react-native-elements';
import { TextInputMask, TextInputMaskProps } from 'react-native-masked-text';
import { Button, Headline, RadioButton } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import uuid from 'react-native-uuid';
import { Command } from '../../actions/Actions';
import SeeSay2020Submission, { BaseForm, FormSelectors, IssueTypeDetails, ProblemType } from '../../types/SeeSay2020Submission';
import DateTime from '../DateTime';

type Form = SeeSay2020Submission

type CB = {
  onSubmit: (form: Form) => void,
  onCancel: () => void,
}
type P = {
  dispatch: (command: Command) => void,
  initialValues: Partial<BaseForm & ProblemType>,
  location: LocationObject,
  formStructure: Partial<FormSelectors>,
  display?: <ST>(issueType: IssueTypeDetails<ST>) => boolean,
} & Partial<CB>
type FormErrors = {
  [K in keyof Form]?: String
}
export const emptyFormData: Form = Object.seal({
  issue_type: "intimidation",
  issue_subtype: "polling_place_interference",
  description: "",
  incident_state: "",
  incident_city: "",
  incident_time: `${(new Date()).getTime()}`,  // milliseconds since epoch  
  globalid: `{${uuid.v4()}}`,
})

const ignore = () => { }
const noops: CB = {
  onSubmit: ignore,
  onCancel: ignore,
}

const IncidentReport: FunctionComponent<P> = (props) => {
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
        initialValues={{ ...emptyFormData, ...p.initialValues }}
        validateOnChange={true}
        validateOnMount={true}
        validateOnBlur={true}
        onSubmit={p.onSubmit}
        validate={validate}
      >
        {({ handleChange, handleBlur, handleSubmit, touched, errors, values }) => {
          const radio = (label: string, value: string, extraViewStyle?: ViewStyle) => (
            <View key={`${label} ${value}`} style={{
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
                value={customRender(values[p] || "")}
                key={label}
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

                {/* Primary issue type */}
                {Object
                  .keys(p.formStructure)
                  .filter(k => p.display?.(p.formStructure[k]) ?? true)
                  .length > 1 && <View>
                    <Headline key="maintitle" style={{
                      margin: 5,
                      marginVertical: 10,
                    }}>
                      What happened?
                </Headline>
                    <RadioButton.Group
                      onValueChange={value => {
                        const updateSubtype = value !== values.issue_type
                        handleChange("issue_type")(value)
                        if (updateSubtype) {
                          handleChange("issue_subtype")(p.formStructure[value].subtypes[0].subtype)
                          // TODO(Dave): Select the first option.
                        }
                      }}
                      value={values.issue_type || ""}
                    >
                      {Object
                        .keys(p.formStructure)
                        .filter(k => p.display?.(p.formStructure[k]) ?? true)
                        .flatMap((k, i, a) =>
                          (p.display?.(p.formStructure[k]) ?? true) ?
                            [radio(p.formStructure[k].label, k, {
                              // Alternate background shades
                              ...(i % 2 == 0 ? { backgroundColor: "#f8f8f8" } : {}),
                              // ...(i === 0 ? { borderTopWidth: 1 } : {}),
                              ...(i === a.length - 1 ? { borderBottomWidth: 1 } : {}),
                            })] :
                            []
                        )}
                    </RadioButton.Group></View>
                }

                {/* TODO(Dave): This doesn't seem to actually do anything.  Why? */}
                {/* <Divider key="midborder" style={{ borderBottomWidth: 1 }} /> */}
                <Headline key="subtitle" style={{
                  margin: 5,
                  marginVertical: 10,
                }}>
                  ...more specifically:
                </Headline>

                {/* Secondary issue type */}
                <RadioButton.Group
                  onValueChange={value => handleChange("issue_subtype")(value)}
                  value={values.issue_subtype || ""}
                >
                  {p.formStructure[values.issue_type]
                    .subtypes
                    .map((k, i, a) =>
                      radio(k.label, k.subtype, {
                        //  Alternate background shades
                        ...(i % 2 == 0 ? { backgroundColor: "#f8f8f8" } : {}),
                        // ...(i === 0 ? { borderTopWidth: 1 } : {}),
                        ...(i === a.length - 1 ? { borderBottomWidth: 1 } : {}),
                      })
                    )}
                </RadioButton.Group>

                {/* City & State */}
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

                {/* Date & Time */}
                <TouchableOpacity
                  key="datetime"
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

                {/* Freeform details */}
                {textInput("description", "Details", {
                  props: {
                    multiline: true
                  }
                })}

                {/* Submissions buttons */}
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

export default IncidentReport

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