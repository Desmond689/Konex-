/**
 * KONEX React Native WebRTC Mock for Web
 * Production Ready
 */

export const RTCPeerConnection = null;
export const RTCSessionDescription = null;
export const RTCIceCandidate = null;
export const getUserMedia = () => Promise.reject(new Error('WebRTC not supported on web'));
export const mediaDevices = null;

export default {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  getUserMedia,
  mediaDevices,
};