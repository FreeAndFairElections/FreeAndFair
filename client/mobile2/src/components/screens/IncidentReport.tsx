import { LocationObject } from 'expo-location';
import { Formik } from 'formik';
import { PhoneNumberFormat } from 'google-libphonenumber';
import React, { FunctionComponent, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Input } from 'react-native-elements';
import { TextInputMask, TextInputMaskProps } from 'react-native-masked-text';
import { Button, Divider, List, RadioButton } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import uuid from 'react-native-uuid';
import { Command } from '../../actions/Actions';
import SeeSay2020Submission, { FormSelectors } from '../../types/SeeSay2020Submission';
import DateTime from '../DateTime';
import TakePhoto, { Photo } from '../TakePhoto';
import Photos from '../Photos';

type Form = SeeSay2020Submission

type PartialExcept<T, K extends keyof T> =
  Partial<Omit<T, K>> &
  Pick<T, K>
type PartialOnly<T, K extends keyof T> =
  Partial<Pick<T, K>> &
  Omit<T, K>
type RequiredExcept<T, K extends keyof T> =
  Required<Omit<T, K>> &
  Pick<T, K>
type RequiredOnly<T, K extends keyof T> =
  Required<Pick<T, K>> &
  Omit<T, K>

type CB = {
  onSubmit: (form: Form) => void,
  onCancel: () => void,
}
type P = {
  dispatch: (command: Command) => void,
  initialValues: PartialExcept<Form, "issue_type" | "issue_subtype">,
  location: LocationObject,
  formStructure: Partial<Readonly<FormSelectors>>,
  display?: (issueType: FormSelectors[keyof FormSelectors]) => boolean,
} & Partial<CB>
type FormErrors = {
  [K in keyof Form]?: String
}
const emptyFormData: Omit<Form, "issue_type" | "issue_subtype"> = Object.seal({
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
const defaults: RequiredOnly<Partial<P>, "display"> = {
  display: x => true,
  ...noops
}

const typedKeys = <T extends Record<string, unknown>>(obj: T): Array<keyof T> => Object.keys(obj);

const IncidentReport: FunctionComponent<P> = (props) => {
  const p: RequiredOnly<P, "display"> = {
    ...defaults,
    ...props,
    display: props.display ?? defaults.display
  }

  const manyTop = Object.keys(p.formStructure).length > 1
  const manyMid: (k: keyof FormSelectors) => boolean =
    k => Object.keys(p.formStructure[k]?.subtypes || {}).length > 1

  const [dateVisible, setDateVisible] = useState(false)
  const [topVisible, setTopVisible] = useState(manyTop)
  const [midVisible, setMidVisible] = useState(manyMid(p.initialValues.issue_type))
  const [photos, setPhotos] = useState<Photo[]>([])

  const validate: (f: Form) => void | object = (f) => {
    const errors: FormErrors = {}

    if (!f.incident_city)
      errors.incident_city = "Missing City"

    if (!f.incident_state || f.incident_state.length != 2)
      errors.incident_state = "Missing State"

    if (!f.description)
      errors.description = "Missing Description"
    return errors
  }

  return (
    <View style={{ flex: 1 }}>
      <Formik<Form>
        // Ugh, this "as any" is soooo janky /facepalm
        initialValues={{ ...emptyFormData, ...p.initialValues } as any}
        validateOnChange={true}
        validateOnMount={true}
        validateOnBlur={true}
        onSubmit={(v) => p.onSubmit?.(v)}
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
                inputContainerStyle={{
                  ...(touched[p] && errors[p] && { backgroundColor: "#ffe0e0" })
                }}
                inputStyle={{
                  ...styles.text,
                  // The red error background seems to cause text fields to scroll within the containing view!  :(
                  // ...(touched[p] && errors[p] && {backgroundColor: "#ffe0e0"})
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
                {typedKeys(p.formStructure)
                  .filter(k => p.display?.(p.formStructure[k]!) ?? true)
                  .length > 1 &&
                  <View>
                    <List.Accordion
                      title="What happened?"
                      expanded={topVisible}
                      {...(!topVisible
                        && { description: p.formStructure[values.issue_type]!.label })}
                      onPress={() => {
                        setTopVisible(v => !v)
                        setMidVisible(manyMid(values.issue_type))
                      }}
                      titleStyle={styles.headline}
                    >
                      <RadioButton.Group
                        onValueChange={value => {
                          const updateSubtype = value !== values.issue_type
                          handleChange("issue_type")(value)
                          setTopVisible(false)
                          setMidVisible(manyMid(value as keyof FormSelectors))

                          if (updateSubtype) {
                            handleChange("issue_subtype")(
                              Object.keys(p.formStructure[value as keyof FormSelectors]!.subtypes)[0])
                          }
                        }}
                        value={values.issue_type || ""}
                      >
                        {typedKeys(p.formStructure)
                          .filter(k => p.display?.(p.formStructure[k]!) ?? true)
                          .flatMap((k, i, a) =>
                            (p.display?.(p.formStructure[k]!) ?? true) ?
                              [radio(p.formStructure[k]!.label, k, {
                                // Alternate background shades
                                ...(i % 2 == 0 ? { backgroundColor: "#f8f8f8" } : {}),
                                // ...(i === 0 ? { borderTopWidth: 1 } : {}),
                                ...(i === a.length - 1 ? { borderBottomWidth: 1 } : {}),
                              })] :
                              []
                          )}
                      </RadioButton.Group>
                    </List.Accordion>
                  </View>
                }

                {/* Secondary issue type */}
                <List.Accordion
                  title="...more specifically:"
                  titleStyle={styles.headline}
                  expanded={midVisible}
                  {...(!midVisible
                    && {
                    // Yuck, this `as any` is shitty.
                    description: (p.formStructure[values.issue_type]!.subtypes as any)[values.issue_subtype]
                  })}
                  onPress={() => {
                    setMidVisible(v => !v)
                  }}
                >
                  <RadioButton.Group
                    onValueChange={value => {
                      setMidVisible(false)
                      handleChange("issue_subtype")(value)
                    }}
                    value={values.issue_subtype || ""}
                  >
                    {Object.entries(p.formStructure[values.issue_type]?.subtypes ?? {})
                      .map(([k, v], i, a) =>
                        radio(v, k, {
                          //  Alternate background shades
                          ...(i % 2 == 0 ? { backgroundColor: "#f8f8f8" } : {}),
                          // ...(i === 0 ? { borderTopWidth: 1 } : {}),
                          ...(i === a.length - 1 ? { borderBottomWidth: 1 } : {}),
                        })
                      )}
                  </RadioButton.Group>
                </List.Accordion>

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

                <TakePhoto addPhoto={photo =>
                  setPhotos((photos) => { photos.push(photo); return photos })
                } />

                <Photos
                  photos={photos}
                  removePhoto={(idx) => setPhotos(photos =>
                    [...photos.slice(undefined, idx), ...photos.slice(idx + 1)]
                  )}
                />

                <Divider />

                {/* Submissions buttons */}
                <View style={styles.footerButtonGroup}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      Alert.alert(
                        'Confirm Cancel',
                        'Are you sure you want to cancel this report?',
                        [
                          { text: 'No', onPress: () => { }, style: 'cancel' },
                          { text: 'Yes', onPress: p.onCancel, style: "destructive" },
                        ]
                      )
                    }}
                    style={styles.buttonOuter}
                    contentStyle={styles.buttonInner}
                  >Cancel</Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      if (validate(values) !== {}) {
                        Alert.alert(
                          'Fix submission',
                          "You are missing some required info",
                          [
                            { text: 'Ok', onPress: () => { }, style: 'cancel' },
                          ]
                        )
                      } else {
                        Alert.alert(
                          'Confirm Submit',
                          'Are you ready to submit this report?',
                          [
                            { text: 'No', onPress: () => { }, style: 'cancel' },
                            { text: 'Yes', onPress: handleSubmit as any, style: "default" },
                          ]
                        )
                      }
                    }}
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
    fontSize: 18,
  },

  headline: {
    fontSize: 18,
    lineHeight: 32,
    marginVertical: 2,
    letterSpacing: 0
  }
})