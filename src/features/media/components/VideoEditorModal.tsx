import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import {
  estimateTrimmedSize,
  formatBytes,
  getFileSizeBytes,
  isWithinLimit,
  MEDIA_MAX_BYTES,
} from '../utils/videoSize';
import { processVideoForUpload } from '../utils/processVideo';

type Props = {
  visible: boolean;
  uri: string;
  mime?: string;
  onCancel: () => void;
  /** Called only when output file is verified ≤ 50 MB */
  onContinue: (result: { uri: string; mime?: string; sizeBytes: number; durationSec: number }) => void;
};

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function VideoEditorModal({
  visible,
  uri,
  mime,
  onCancel,
  onContinue,
}: Props) {
  const [duration, setDuration] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [processedUri, setProcessedUri] = useState<string | null>(null);
  const videoRef = React.useRef<Video>(null);

  useEffect(() => {
    if (!visible || !uri) return;
    setError(null);
    setProcessedSize(null);
    setProcessedUri(null);
    setBusy(false);
    getFileSizeBytes(uri)
      .then(setOriginalSize)
      .catch((e) => setError(e?.message || 'Could not read file size'));
  }, [visible, uri]);

  const onPlaybackStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.durationMillis && duration <= 0) {
      const d = status.durationMillis / 1000;
      setDuration(d);
      setStartSec(0);
      setEndSec(d);
    }
  };

  const estimated = useMemo(() => {
    if (duration <= 0 || originalSize <= 0) return originalSize;
    return estimateTrimmedSize(originalSize, duration, startSec, endSec);
  }, [originalSize, duration, startSec, endSec]);

  const trimStart = (delta: number) => {
    setProcessedUri(null);
    setProcessedSize(null);
    setStartSec((s) => {
      const next = Math.min(Math.max(0, s + delta), Math.max(0, endSec - 0.5));
      return next;
    });
  };

  const trimEnd = (delta: number) => {
    setProcessedUri(null);
    setProcessedSize(null);
    setEndSec((e) => {
      const next = Math.max(Math.min(duration, e + delta), startSec + 0.5);
      return next;
    });
  };

  const runProcess = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await processVideoForUpload({
        uri,
        startSec,
        endSec,
      });
      setProcessedUri(result.uri);
      setProcessedSize(result.sizeBytes);
      if (!isWithinLimit(result.sizeBytes)) {
        setError(
          `Still ${formatBytes(result.sizeBytes)}. Trim further or reduce quality. Maximum is 50 MB.`
        );
      }
    } catch (e: any) {
      setProcessedUri(null);
      setProcessedSize(null);
      setError(e?.message || 'Processing failed');
    } finally {
      setBusy(false);
    }
  };

  const canContinue =
    processedUri != null &&
    processedSize != null &&
    isWithinLimit(processedSize) &&
    !busy;

  const handleContinue = () => {
    if (!canContinue || !processedUri || processedSize == null) return;
    onContinue({
      uri: processedUri,
      mime: mime || 'video/mp4',
      sizeBytes: processedSize,
      durationSec: endSec - startSec,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.root}>
        <Text style={styles.title}>Video is too large</Text>
        <Text style={styles.sub}>
          Maximum: {formatBytes(MEDIA_MAX_BYTES)}
          {'\n'}
          Your video: {originalSize ? formatBytes(originalSize) : '…'}
        </Text>
        <Text style={styles.hint}>Trim your video to continue</Text>

        <View style={styles.preview}>
          <Video
            ref={videoRef}
            source={{ uri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={onPlaybackStatus}
            isMuted
          />
        </View>

        <Text style={styles.timeLine}>
          {formatTime(startSec)}  —  {formatTime(endSec)}
          {duration > 0 ? `  (total ${formatTime(duration)})` : ''}
        </Text>

        <View style={styles.controls}>
          <Text style={styles.label}>Start</Text>
          <TouchableOpacity style={styles.chip} onPress={() => trimStart(-1)}>
            <Text style={styles.chipText}>-1s</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => trimStart(1)}>
            <Text style={styles.chipText}>+1s</Text>
          </TouchableOpacity>
          <Text style={styles.label}>End</Text>
          <TouchableOpacity style={styles.chip} onPress={() => trimEnd(-1)}>
            <Text style={styles.chipText}>-1s</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => trimEnd(1)}>
            <Text style={styles.chipText}>+1s</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.estimate}>
          Estimated size after trim: {formatBytes(estimated)}
          {'\n'}
          {processedSize != null
            ? `Actual processed size: ${formatBytes(processedSize)}`
            : 'Actual size is measured only after you tap Trim Video'}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, styles.secondary]}
          onPress={runProcess}
          disabled={busy || duration <= 0}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Trim Video</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, canContinue ? styles.primary : styles.disabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={styles.btnText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancel} onPress={onCancel} disabled={busy}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Continue stays disabled until the processed file is measured at ≤ 50 MB.
          {Platform.OS === 'web' ? ' Web may not support native compression.' : ''}
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: { color: '#F9FAFB', fontSize: 22, fontWeight: '800' },
  sub: { color: '#FBBF24', marginTop: 8, lineHeight: 22 },
  hint: { color: '#A78BFA', marginTop: 8, fontWeight: '600' },
  preview: {
    marginTop: 16,
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#12121A',
  },
  video: { width: '100%', height: '100%' },
  timeLine: { color: '#E5E7EB', marginTop: 12, textAlign: 'center', fontWeight: '600' },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  label: { color: '#9CA3AF', marginRight: 4 },
  chip: {
    backgroundColor: '#1E1E2A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chipText: { color: '#F9FAFB', fontWeight: '600' },
  estimate: { color: '#9CA3AF', marginTop: 16, lineHeight: 20 },
  error: { color: '#EF4444', marginTop: 12 },
  btn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondary: { backgroundColor: '#4C1D95' },
  primary: { backgroundColor: '#7C3AED' },
  disabled: { backgroundColor: '#374151' },
  btnText: { color: '#fff', fontWeight: '700' },
  cancel: { marginTop: 16, alignItems: 'center' },
  cancelText: { color: '#9CA3AF' },
  footnote: { color: '#6B7280', fontSize: 11, marginTop: 16, lineHeight: 16 },
});
