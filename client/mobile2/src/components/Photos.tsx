import * as ImagePicker from 'expo-image-picker';
import { ImagePickerResult } from 'expo-image-picker';
import React, { useEffect } from 'react';
import { Platform, View, Image, StyleSheet } from 'react-native';
import { Button, List } from 'react-native-paper';

export type Photo = ImagePickerResult & { cancelled: false }

type CB = {
  removePhoto: (index: number) => void
}

type P = {
  photos: Photo[],
} & Partial<CB>

const ignore = () => { }
const noops: CB = {
  removePhoto: ignore,
}

const Photos: (p: P) => JSX.Element = props => {
  const p = { ...noops, ...props }

  return (
    <List.Section>
      {p.photos.map((photo, i, a) => {
        return (
          <View key={photo.uri} style={{
            flexDirection: "row",
            flex: 1,
            alignItems: "center",
            margin: 5,
          }}>
            <Button
              contentStyle={styles.buttonInner}
              style={styles.buttonOuter}
              icon="delete"
              // mode="outlined"
              onPress={() => p.removePhoto(i)}
            >
              Delete
            </Button>
            <Image source={{ uri: photo.uri }} style={{
              flex: .7,
              width: 200,
              height: 200 * photo.height / photo.width,
            }}
            />
          </View>
        )
      })}
    </List.Section>
  )
}
export default Photos

const styles = StyleSheet.create({
  buttonInner: {
    // width: 400,
    marginVertical: 10,
  },

  buttonOuter: {
    margin: 10,
    flex: .3,
  },
})