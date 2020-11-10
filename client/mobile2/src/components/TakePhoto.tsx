import * as ImagePicker from 'expo-image-picker';
import { ImagePickerResult } from 'expo-image-picker';
import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

export type Photo = ImagePickerResult & { cancelled: false }

type CB = {
  addPhoto: (image: Photo) => void
}
type P = {
  error?: string,
} & Partial<CB>
const ignore = () => { }
const noops: CB = {
  addPhoto: ignore,
}

const TakePhoto: (p: P) => JSX.Element = props => {
  const p = { ...noops, ...props }

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
          }
        }
      }
    })();
  }, []);

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: Platform.OS === "ios" ? 0.4 : 0.69,
      exif: true,
    });

    if (!result.cancelled) {
      p.addPhoto(result)
    }
  };

  const pickImage = async () => {
    {
      const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: Platform.OS === "ios" ? 0.4 : 0.69,
      exif: true,
    });

    if (!result.cancelled) {
      p.addPhoto(result)
    }
  };

  return (
    <View style={{
      flex: 1,
      flexDirection: "column",
      alignItems: 'center',
      justifyContent: 'center',
      margin: 5,
      // ...(p.error ? { backgroundColor: "#ffe0e0" } : {})
    }}
    >
      <View style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-around",
      }}
      >
        <Button
          mode="outlined"
          icon="camera"
          onPress={takePicture}
          contentStyle={styles.buttonInner}
          style={{
            ...styles.buttonOuter,
            ...(p.error && { backgroundColor: "#ffe0e0" }),
          }}
        >
          Add Photo
        </Button>
        <Button
          mode="outlined"
          icon="camera"
          onPress={pickImage}
          contentStyle={styles.buttonInner}
          style={{
            ...styles.buttonOuter,
            ...(p.error && { backgroundColor: "#ffe0e0" }),
          }}
        >
          Add Image
        </Button>
      </View>
      
      {p.error && (
        <View style={{
          flex: 1,
          alignSelf: "stretch",
          // backgroundColor: "#ffe0e0"
        }}>
          <Text style={{
            ...styles.error,
            textAlign: "center"
          }}>
            Add a required photo or image
          </Text>
        </View>
      )}

    </View>
  );
}
export default TakePhoto

const styles = StyleSheet.create({
  buttonInner: {
    width: 175,
    marginVertical: 10,
  },

  buttonOuter: {
    margin: 10,
  },

  error: {
    margin: 5,
    fontSize: 12,
    color: "#ff0000",
  },
})