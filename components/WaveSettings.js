import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { DEFAULT_WAVE_SETTINGS } from "../constants/defaults";

// A single labeled input row
function SettingRow({ label, unit, value, onChange, placeholder }) {
  return (
    <View style={styles.row}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#4a7fa5"
      />
    </View>
  );
}

export default function WaveSettings({ settings, onChange }) {
  // settings is an object with the user's overrides (or null to use defaults)
  const current = { ...DEFAULT_WAVE_SETTINGS, ...settings };

  function update(key, value) {
    onChange({ ...current, [key]: parseFloat(value) || 0 });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Wave Conditions</Text>
      <Text style={styles.hint}>Leave at defaults if you are unsure.</Text>

      <SettingRow
        label="Min wave height"
        unit="meters"
        value={String(current.minWaveHeight)}
        onChange={(v) => update("minWaveHeight", v)}
        placeholder={String(DEFAULT_WAVE_SETTINGS.minWaveHeight)}
      />
      <SettingRow
        label="Max wave height"
        unit="meters"
        value={String(current.maxWaveHeight)}
        onChange={(v) => update("maxWaveHeight", v)}
        placeholder={String(DEFAULT_WAVE_SETTINGS.maxWaveHeight)}
      />
      <SettingRow
        label="Min wave period"
        unit="seconds"
        value={String(current.minWavePeriod)}
        onChange={(v) => update("minWavePeriod", v)}
        placeholder={String(DEFAULT_WAVE_SETTINGS.minWavePeriod)}
      />
      <SettingRow
        label="Max wind speed"
        unit="km/h"
        value={String(current.maxWindSpeed)}
        onChange={(v) => update("maxWindSpeed", v)}
        placeholder={String(DEFAULT_WAVE_SETTINGS.maxWindSpeed)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  hint: {
    color: "#4a7fa5",
    fontSize: 12,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    color: "#cde0f7",
    fontSize: 14,
  },
  unit: {
    color: "#4a7fa5",
    fontSize: 11,
  },
  input: {
    backgroundColor: "#1e3a5f",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    width: 80,
    textAlign: "center",
    fontSize: 15,
  },
});
