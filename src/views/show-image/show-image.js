/* @flow */
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import Router from '../../components/router/router';
import Gallery from 'react-native-gallery';

const TOUCH_PADDING = 12;

type Props = {
  allImagesUrls: Array<string>,
  currentImage: string
}

export function ShowImage(props: Props) {

  const currentIndex = props.allImagesUrls.indexOf(props.currentImage);

  return (
    <View style={styles.container}>
      <Gallery
        style={{flex: 1, backgroundColor: 'black'}}
        images={props.allImagesUrls}
        initialPage={currentIndex}
      />

      <TouchableOpacity style={styles.closeButton}
                        onPress={() => Router.pop()}
                        hitSlop={{top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING}}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  closeButton: {
    position: 'absolute',
    backgroundColor: '#FFF7',
    borderRadius: 4,
    padding: 16,
    bottom: 16,
    left: 16
  }
});

export default ShowImage;
