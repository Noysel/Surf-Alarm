// Default wave conditions considered "good for surfing"
// User can override these in Settings

export const DEFAULT_WAVE_SETTINGS = {
  minWaveHeight: 0.5,   // meters — minimum to have something to surf
  maxWaveHeight: 3.0,   // meters — above this is too dangerous for average surfer
  minWavePeriod: 8,     // seconds — longer period = more organized, cleaner swell
  maxWindSpeed: 20,     // km/h   — above this the surface gets choppy
};

export const ALARM_TIMES = {
  goodWaves: "06:00",   // alarm if waves are good
  badWaves:  "08:00",   // alarm if waves are not good
};
