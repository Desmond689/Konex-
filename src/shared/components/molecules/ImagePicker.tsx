/**
 * Device-only image picker. Never accepts pasted URLs.
 */
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import { promptPickImageFromDevice, DeviceImageResult } from '../../utils/pickFromDevice';

interface ImagePickerProps {
  /** Preferred: receives local device URI */
  onPick?: (uri: string) => void;
  /** Called with full device file meta */
  onPickFile?: (file: DeviceImageResult) => void;
  /** Legacy forms */
  onImagesChange?: (uris: string[]) => void;
  onPickImage?: () => void | Promise<void>;
  images?: string[];
  maxCount?: number;
  isLoading?: boolean;
  label?: string;
  style?: ViewStyle;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  onPick,
  onPickFile,
  onImagesChange,
  onPickImage,
  images,
  isLoading,
  label = 'Choose from device',
  style,
}) => {
  const [busy, setBusy] = useState(false);
  const preview = images?.[0];

  const openDevicePicker = () => {
    promptPickImageFromDevice(async (file) => {
      setBusy(true);
      try {
        onPick?.(file.uri);
        onPickFile?.(file);
        onImagesChange?.([file.uri]);
        await onPickImage?.();
      } finally {
        setBusy(false);
      }
    });
  };

  return (
    <View style={style}>
      {preview ? (
        <Image source={{ uri: preview }} style={styles.preview} />
      ) : null}
      <TouchableOpacity
        style={styles.btn}
        onPress={openDevicePicker}
        disabled={busy || isLoading}
      >
        {busy || isLoading ? (
          <ActivityIndicator color="#A78BFA" />
        ) : (
          <>
            <Text style={styles.text}>{label}</Text>
            <Text style={styles.sub}>Photo library or camera · no URL paste</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  preview: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 10,
    alignSelf: 'center',
  },
  btn: {
    backgroundColor: '#1E1E2A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D3A',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
  },
  text: { color: '#E5E7EB', fontWeight: '700' },
  sub: { color: '#9CA3AF', fontSize: 11, marginTop: 6 },
});

export default ImagePicker;
