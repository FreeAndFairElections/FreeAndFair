import * as Location from 'expo-location';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

const Scratch: FunctionComponent<{}> = (props) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<String | null>(null);
  const [dirty, setDirty] = useState(0)
  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      } else {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        mapRef.current?.animateCamera({center: location.coords, zoom: 16})
      }
    })();

    setTimeout(() => {
      setDirty(dirty + 1)
    }, 1000)
  }, [dirty]);

  let text: String = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    let {altitude, latitude, longitude} = location.coords
    text = JSON.stringify({altitude, latitude, longitude}, undefined, '\n');
  }

  return (
    <View style={styles.container}>
      {/* <Image source={logo} style={styles.logo} /> */}
      <Text >
        Hello big girl Lydia!!
        </Text>
        <Text>{dirty}</Text>
      <Text>{text}</Text>
      <Text />
      <MapView 
        style={styles.mapStyle} 
        ref={mapRef}
        scrollEnabled={false} 
        pitchEnabled={false}
        rotateEnabled={false}
        zoomEnabled={false}
        showsMyLocationButton={false}
        showsUserLocation={true}
        followsUserLocation={true}
        showsPointsOfInterest={true}
      />
    </View>
  );
}
export default Scratch;

const styles = StyleSheet.create({
  mapStyle: {
    width: Dimensions.get('window').width / 1.2,
    height: Dimensions.get('window').height / 3,
  },

  container: {
  },
})