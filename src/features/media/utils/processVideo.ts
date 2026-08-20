/**
 * Trim + compress pipeline.
 * Uses react-native-compressor when available (dev/production build).
 * Never reports success without measuring the actual output file size.
 */
import * as FileSystem from 'expo-file-system';
import { getFileSizeBytes } from './videoSize';
import { MEDIA_MAX_BYTES } from '../../../api/media/media.constants';

export type ProcessVideoInput = {
  uri: string;
  startSec: number;
  endSec: number;
  /** 0–1 quality hint for compressor */
  quality?: number;
};

export type ProcessVideoResult = {
  uri: string;
  sizeBytes: number;
  durationSec: number;
};

function loadCompressor(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-compressor');
  } catch {
    return null;
  }
}

/**
 * Attempt trim+compress. Throws with a clear message if native tools are missing
 * or output is still over 50 MB.
 */
export async function processVideoForUpload(
  input: ProcessVideoInput
): Promise<ProcessVideoResult> {
  const durationSec = Math.max(0.1, input.endSec - input.startSec);
  const compressor = loadCompressor();

  if (!compressor?.Video) {
    throw new Error(
      'Video trim/compress requires a development build with react-native-compressor. Expo Go cannot re-encode video. Install react-native-compressor and rebuild, or select a video that is already ≤ 50 MB.'
    );
  }

  const { Video } = compressor;

  // Compress full file first (bitrate reduction), then rely on startTime/endTime if supported
  const options: Record<string, unknown> = {
    compressionMethod: 'auto',
    maxSize: 1280,
    minimumFileSizeForCompress: 0,
  };

  // react-native-compressor supports getVideoMetaData and compress; trim via startTime/endTime on some versions
  if (typeof input.startSec === 'number') {
    options.startTime = input.startSec;
  }
  if (typeof input.endSec === 'number') {
    options.endTime = input.endSec;
  }

  let outUri: string;
  try {
    outUri = await Video.compress(input.uri, options);
  } catch (e: any) {
    // Retry without trim params if unsupported
    try {
      outUri = await Video.compress(input.uri, {
        compressionMethod: 'auto',
        maxSize: 960,
        minimumFileSizeForCompress: 0,
      });
    } catch (e2: any) {
      throw new Error(e2?.message || e?.message || 'Video compression failed');
    }
  }

  if (!outUri) {
    throw new Error('Compression produced no output file');
  }

  const sizeBytes = await getFileSizeBytes(outUri);
  if (sizeBytes <= 0) {
    throw new Error('Could not read processed video size');
  }
  if (sizeBytes > MEDIA_MAX_BYTES) {
    throw new Error(
      `Processed video is still ${ (sizeBytes / (1024 * 1024)).toFixed(1) } MB. Maximum is 50 MB. Trim further or reduce quality.`
    );
  }

  return { uri: outUri, sizeBytes, durationSec };
}
