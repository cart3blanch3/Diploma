import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const getDeviceFingerprint = async (): Promise<string> => {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
};
