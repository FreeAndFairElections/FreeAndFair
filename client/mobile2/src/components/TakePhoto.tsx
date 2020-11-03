import * as ImagePicker from 'expo-image-picker';
import { ImagePickerResult } from 'expo-image-picker';
import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export type Photo = ImagePickerResult & { cancelled: false }

type CB = {
  addPhoto: (image: Photo) => void
}
type P = {
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
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
      exif: true,
    });

    console.log(result);

    if (!result.cancelled) {
      //setImage(result);
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
    }}
    >
      <Button
        mode="outlined"
        icon="camera"
        onPress={pickImage}
        contentStyle={styles.buttonInner}
        style={styles.buttonOuter}
      >
        Add Photo
        </Button>
      {/* {image && <Image source={{ uri: image.uri }} style={{ 
        transform: [{scale: 1}],  
        width: 200, 
        height: 200.0 * image.height / image.width,
        }} />} */}
    </View>
  );
}
export default TakePhoto

const styles = StyleSheet.create({
  buttonInner: {
    width: 400,
    marginVertical: 10,
  },

  buttonOuter: {
    margin: 10,
  },
})