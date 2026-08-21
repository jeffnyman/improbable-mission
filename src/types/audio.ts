export interface AudioRequest {
  name: string;
  loop?: boolean;
  // Delay in milliseconds before the sound starts. Requests with an
  // offset bypass the same-frame duplicate check, so the same sound
  // can be scheduled multiple times (e.g. dial tones).
  offset?: number;
}

export interface ActiveSound {
  name: string;
  bufferSource: AudioBufferSourceNode | false;
}
