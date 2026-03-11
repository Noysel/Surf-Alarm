import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BeachPicker from "../components/BeachPicker";
import WaveSettings from "../components/WaveSettings";
import { DEFAULT_WAVE_SETTINGS } from "../constants/defaults";
import { SERVER_URL } from "../constants/config";

export default function SettingsScreen({ navigation }) {
  const [selectedBeach, setSelectedBeach]   = useState(null);
  const [waveSettings, setWaveSettings]     = useState(DEFAULT_WAVE_SETTINGS);
  const [useDefaults, setUseDefaults]       = useState(true);
  const [saving, setSaving]                 = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    AsyncStorage.getItem("userSettings").then((raw) => {
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.beach) setSelectedBeach(saved.beach);
        if (saved.waveSettings) {
          setWaveSettings(saved.waveSettings);
          setUseDefaults(false);
        }
      }
    });
  }, []);

  async function handleSave() {
    if (!selectedBeach) {
      Alert.alert("Missing beach", "Please select a beach first.");
      return;
    }

    setSaving(true);
    try {
      let expoPushToken = await AsyncStorage.getItem("expoPushToken");
    console.log("Push token on save:", expoPushToken);
      const settingsToSend = useDefaults ? null : waveSettings;

      // Register / update user on the server
      const response = await fetch(`${SERVER_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expoPushToken,
          beach: selectedBeach,
          waveSettings: settingsToSend,
        }),
      });

      if (!response.ok) throw new Error("Server error");

      // Persist locally
      await AsyncStorage.setItem(
        "userSettings",
        JSON.stringify({ beach: selectedBeach, waveSettings: settingsToSend })
      );

      Alert.alert("Saved!", "Your settings have been updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Could not save settings. Check your connection.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Settings</Text>

      {/* Beach Picker */}
      <Text style={styles.label}>Your Beach</Text>
      <BeachPicker selectedBeach={selectedBeach} onSelect={setSelectedBeach} />

      {/* Wave Settings Toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.label}>Use default wave thresholds</Text>
        <TouchableOpacity
          style={[styles.toggle, useDefaults && styles.toggleOn]}
          onPress={() => setUseDefaults(!useDefaults)}
        >
          <Text style={styles.toggleText}>{useDefaults ? "ON" : "OFF"}</Text>
        </TouchableOpacity>
      </View>

      {useDefaults ? (
        <View style={styles.defaultsBox}>
          <Text style={styles.defaultsTitle}>Default thresholds:</Text>
          <Text style={styles.defaultsText}>Wave height: {DEFAULT_WAVE_SETTINGS.minWaveHeight}m – {DEFAULT_WAVE_SETTINGS.maxWaveHeight}m</Text>
          <Text style={styles.defaultsText}>Wave period: ≥ {DEFAULT_WAVE_SETTINGS.minWavePeriod}s</Text>
          <Text style={styles.defaultsText}>Wind speed: ≤ {DEFAULT_WAVE_SETTINGS.maxWindSpeed} km/h</Text>
        </View>
      ) : (
        <WaveSettings settings={waveSettings} onChange={setWaveSettings} />
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Save Settings</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1929",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  heading: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 28,
  },
  label: {
    color: "#7eb8f7",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  toggle: {
    backgroundColor: "#1e3a5f",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toggleOn: {
    backgroundColor: "#1a6fc4",
  },
  toggleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  defaultsBox: {
    backgroundColor: "#1e3a5f",
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  defaultsTitle: {
    color: "#7eb8f7",
    fontWeight: "bold",
    marginBottom: 6,
  },
  defaultsText: {
    color: "#cde0f7",
    fontSize: 13,
    marginBottom: 3,
  },
  saveBtn: {
    backgroundColor: "#1a6fc4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 36,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
