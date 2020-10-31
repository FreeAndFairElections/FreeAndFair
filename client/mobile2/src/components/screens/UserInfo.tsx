import { Formik } from 'formik';
import { PhoneNumberUtil } from "google-libphonenumber";
import React, { FunctionComponent } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Input } from 'react-native-elements';
import { TextInputMask, TextInputMaskProps } from 'react-native-masked-text';
import { Button, Headline } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { UserData } from '../../types/UserData';

const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();

type CB = {
  onSubmit: (form: UserData) => void,
  onCancel: () => void,
}

type P = {
  initialValues: Partial<UserData>,
} & Partial<CB>;

type FormErrors = {
  [K in keyof UserData]?: String
}

export const emptyFormData: UserData = Object.seal({
  firstName: "",
  lastName: "",
  phoneNumber: "",
  formattedPhoneNumber: "",
})

const ignore = () => { }
const noops: CB = {
  onSubmit: ignore,
  onCancel: ignore,
}

const badValueColor = { backgroundColor: "#ffe0e0" }

const WhoAreYou: FunctionComponent<P> = (props) => {
  // Default to no-op callbacks if they weren't specified.
  const p = { ...noops, ...props }

  // TODO(Dave): Could make the validation function part of the state
  // rather than recreating it each render.
  const validate: (f: UserData) => void | object = (f: UserData) => {
    const errors: FormErrors = {}
    if (!f.firstName)
      errors.firstName = "Missing First Name"

    if (!f.lastName)
      errors.lastName = "Missing Last Name"

    const isValidNumber = (number: string, countryCode: string) => {
      try {
        const parsedNumber = phoneUtil.parse(number, countryCode);
        return phoneUtil.isValidNumber(parsedNumber);
      } catch (err) {
        return false;
      }
    };
    if (!f.phoneNumber)
      errors.phoneNumber = "Missing Phone Number"
    else if (!isValidNumber(f.phoneNumber, "US"))
      errors.phoneNumber = "Invalid phone number"


    if (f.email && !f.email.match(/[^@]+@[^.]+\.[^.]+/))
      errors.email = "Invalid email address"
    return errors
  }

  return (
    <View style={{ flex: 1 }}>
      <Formik<UserData>
        initialValues={{ ...emptyFormData, ...props.initialValues }}
        validateOnChange={true}
        validateOnMount={true}
        validateOnBlur={true}
        onSubmit={p.onSubmit}
        validate={validate}
      >
        {({ handleChange, handleBlur, handleSubmit, touched, errors, values }) => {

          const badValue =
            (f: keyof UserData,
              k: keyof ViewStyle = "backgroundColor",
              ignoreBlur: boolean = false) =>
              ((ignoreBlur || touched[f]) && errors[f]) ? badValueColor : {}

          type CustomInput<P> = {
            component?: React.ComponentType<P>
            props?: P
          }
          const textInput = <P extends {} = TextInputProps>(
            p: keyof UserData,
            label: string,
            customInput?: CustomInput<P>) => (
              <Input
                {...(customInput?.component && { InputComponent: customInput.component })}
                onChangeText={handleChange(p)}
                onBlur={handleBlur(p)}
                value={values[p]}
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
            // keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 84}
            >
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxWidth: 500 }} >
                <Headline style={{ margin: 5, marginVertical: 10 }}>
                  Tell us about yourself
                </Headline>

                {textInput("firstName", "First Name")}
                {textInput("lastName", "Last Name")}

                {textInput<TextInputMaskProps>("phoneNumber", "Phone Number", {
                  component: TextInputMask,
                  props: {
                    onChangeText: (text: string, rawText?: string) => handleChange('phoneNumber')(rawText || text),
                    placeholder: "(   )    -    ",
                    type: "custom",
                    options: {
                      mask: "(999) 999-9999",
                    },
                    keyboardType: "phone-pad"
                  }
                })}

                {textInput("email", "Email address (optional)", {
                  props: {
                    keyboardType: "email-address",
                    // placeholder: "optional",
                  }
                })}

                {textInput("groupCode", "Organization Group Code (if applicable)")}

                {/* Eat up some space.
                    TODO(Dave): Why doesn't this work?*/}
                <View style={{ flex: 1, flexGrow: 1 }} />

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
                  >Save</Button>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          )
        }}
      </Formik >
    </View>
  )
}
export default WhoAreYou

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