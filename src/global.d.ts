// src/types/global.d.ts (or similar path)

interface Float32Array {
  // Explicitly state that the buffer property is an ArrayBuffer
  readonly buffer: ArrayBuffer;
  // Ensure subarray also returns a Float32Array backed by ArrayBuffer
  subarray(begin?: number, end?: number): Float32Array;
}