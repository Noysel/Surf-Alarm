import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";

export default function AlarmScreen({ route, navigation }) {
  const soundRef = useRef(null);
  const { isGood, alarmTime, waveData } = route.params || {};

  useEffect(() => {
    playAlarm();
    return () => stopAlarm();
  }, []);

  async function playAlarm() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/alarm.mp3"),
        { isLooping: true, volume: 1.0 }
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (err) {
      console.error("Error playing alarm:", err);
    }
  }

  async function stopAlarm() {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }

  async function handleDismiss() {
    await stopAlarm();
    navigation.replace("Home");
  }

  return (
    <View style={[styles.container, isGood ? styles.bgGood : styles.bgBad]}>
      <Text style={styles.emoji}>{isGood ? "🤙" : "😴"}</Text>
      <Text style={styles.time}>{alarmTime}</Text>
      <Text style={styles.title}>
        {isGood ? "Waves are good!\nTime to surf!" : "Waves are flat.\nSleep in."}
      </Text>

      {waveData && (
        <View style={styles.dataRow}>
          <Text style={styles.dataItem}>{waveData.waveHeight}m</Text>
          <Text style={styles.dataSep}>·</Text>
          <Text style={styles.dataItem}>{waveData.wavePeriod}s</Text>
          <Text style={styles.dataSep}>·</Text>
          <Text style={styles.dataItem}>{waveData.windSpeed} km/h</Text>
        </View>
      )}

      <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  bgGood: { backgroundColor: "#0d3d2b" },
  bgBad:  { backgroundColor: "#1a0a0a" },
  emoji: { fontSize: 80, marginBottom: 16 },
  time:  { color: "#fff", fontSize: 72, fontWeight: "bold", letterSpacing: 4 },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 34,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 48,
    gap: 8,
  },
  dataItem: { color: "#7eb8f7", fontSize: 16 },
  dataSep:  { color: "#4a7fa5", fontSize: 16 },
  dismissBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  dismissText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
