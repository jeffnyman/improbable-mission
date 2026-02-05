export interface AudioRequest {
  name: string;
}

export interface ActiveSound {
  name: string;
  bufferSource: AudioBufferSourceNode | false;
}
