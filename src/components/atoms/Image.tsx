import React from 'react';
import { Image as RNImage, ImageProps, StyleSheet } from 'react-native';

export const Image: React.FC<ImageProps> = (props) => {
  return <RNImage {...props} style={[styles.default, props.style]} />;
};

const styles = StyleSheet.create({
  default: { resizeMode: 'cover' },
});

export default Image;
