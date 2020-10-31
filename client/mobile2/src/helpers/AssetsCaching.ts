import { Asset } from 'expo-asset';
import { FontSource, loadAsync } from 'expo-font';
import { Image } from 'react-native';

export const cacheFonts = (fonts: (string | {
  [fontFamily: string]: FontSource;
})[]) => {
  return fonts.map((font) => loadAsync(font));
};

export const cacheImages = (images: (string | number)[]) => {
  return images.map((image) => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
};