import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { SERVER_URL } from "../constants/config";

// Schedule a local notification for tomorrow at the given time (e.g. "06:00")
async function scheduleAlarmNotification(alarmTime, isGood, waveData) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const [hours, minutes] = alarmTime.split(":").map(Number);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hours, minutes, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: isGood ? "Waves are good! Time to surf!" : "Waves are flat. Sleep in.",
      body: `Height: ${waveData.waveHeight}m | Period: ${waveData.wavePeriod}s | Wind: ${waveData.windSpeed} km/h`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tomorrow,
    },
  });

  return tomorrow;
}

export default function HomeScreen({ navigation }) {
  const [beach, setBeach]             = useState(null);
  const [waveStatus, setWaveStatus]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState(null);
  const [alarmScheduled, setAlarmScheduled] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadAndFetch);
    return unsubscribe;
  }, [navigation]);

  async function loadAndFetch() {
    const raw = await AsyncStorage.getItem("userSettings");
    if (!raw) return;
    const { beach: savedBeach, waveSettings } = JSON.parse(raw);
    setBeach(savedBeach);
    if (savedBeach) fetchWaveStatus(savedBeach, waveSettings);
  }

  async function fetchWaveStatus(beachData, waveSettings) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: beachData.lat,
        lon: beachData.lon,
        ...(waveSettings || {}),
      });
      const res = await fetch(`${SERVER_URL}/wave-status?${params}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setWaveStatus(data);
    } catch (err) {
      setError("Could not load wave data. Check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleScheduleAlarm() {
    if (!waveStatus) return;
    try {
      const scheduledFor = await scheduleAlarmNotification(
        waveStatus.alarmTime,
        waveStatus.isGood,
        waveStatus
      );
      setAlarmScheduled(true);
      Alert.alert(
        "Alarm Set!",
        `You'll be notified tomorrow at ${waveStatus.alarmTime} (${waveStatus.isGood ? "waves are good!" : "waves are flat"})`,
      );
    } catch (err) {
      Alert.alert("Error", "Could not schedule alarm. Make sure notifications are allowed.");
      console.error(err);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setAlarmScheduled(false);
    await loadAndFetch();
  }, []);

  const isGood = waveStatus?.isGood;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7eb8f7" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>SurfAlarm</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* No beach configured */}
      {!beach && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏄</Text>
          <Text style={styles.emptyTitle}>Welcome to SurfAlarm</Text>
          <Text style={styles.emptyText}>
            Set your beach and we'll check the waves every morning at 05:45.
          </Text>
          <TouchableOpacity
            style={styles.setupBtn}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={styles.setupBtnText}>Set Up My Beach</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Beach configured */}
      {beach && (
        <>
          <Text style={styles.beachLabel}>{beach.name}</Text>

          {loading && !refreshing && (
            <ActivityIndicator color="#7eb8f7" size="large" style={{ marginTop: 40 }} />
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          {waveStatus && !loading && (
            <>
              {/* Status Card */}
              <View style={[styles.statusCard, isGood ? styles.cardGood : styles.cardBad]}>
                <Text style={styles.statusEmoji}>{isGood ? "🤙" : "😴"}</Text>
                <Text style={styles.statusTitle}>
                  {isGood ? "Waves are looking good!" : "Not worth it today."}
                </Text>
                <Text style={styles.alarmLabel}>Tomorrow's alarm:</Text>
                <Text style={styles.alarmTime}>{waveStatus.alarmTime}</Text>
              </View>

              {/* Wave Data */}
              <View style={styles.dataGrid}>
                <DataCard
                  label="Wave Height"
                  value={`${waveStatus.waveHeight}m`}
                  good={
                    waveStatus.waveHeight >= waveStatus.settings.minWaveHeight &&
                    waveStatus.waveHeight <= waveStatus.settings.maxWaveHeight
                  }
                />
                <DataCard
                  label="Wave Period"
                  value={`${waveStatus.wavePeriod}s`}
                  good={waveStatus.wavePeriod >= waveStatus.settings.minWavePeriod}
                />
                <DataCard
                  label="Wind Speed"
                  value={`${waveStatus.windSpeed} km/h`}
                  good={waveStatus.windSpeed <= waveStatus.settings.maxWindSpeed}
                />
              </View>

              {/* Schedule Alarm Button */}
              <TouchableOpacity
                style={[styles.alarmBtn, alarmScheduled && styles.alarmBtnDone]}
                onPress={handleScheduleAlarm}
              >
                <Text style={styles.alarmBtnText}>
                  {alarmScheduled ? "Alarm Scheduled!" : "Set Tomorrow's Alarm"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.updateHint}>Pull down to refresh</Text>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

function DataCard({ label, value, good }) {
  return (
    <View style={[styles.dataCard, good ? styles.dataCardGood : styles.dataCardBad]}>
      <Text style={styles.dataValue}>{value}</Text>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataIndicator}>{good ? "✓" : "✗"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1929" },
  content: { padding: 24, paddingTop: 56, paddingBottom: 48 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  appTitle: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 22, color: "#7eb8f7" },
  beachLabel: { color: "#4a7fa5", fontSize: 14, marginBottom: 24 },
  statusCard: {
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
  },
  cardGood: { backgroundColor: "#0d3d2b", borderWidth: 1, borderColor: "#1a8c5b" },
  cardBad:  { backgroundColor: "#2a1a1a", borderWidth: 1, borderColor: "#8c3a3a" },
  statusEmoji: { fontSize: 48, marginBottom: 8 },
  statusTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  alarmLabel: { color: "#7eb8f7", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 },
  alarmTime:  { color: "#fff", fontSize: 48, fontWeight: "bold", letterSpacing: 2 },
  dataGrid: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 20 },
  dataCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  dataCardGood: { backgroundColor: "#0d2e1f", borderWidth: 1, borderColor: "#1a6b45" },
  dataCardBad:  { backgroundColor: "#2a1010", borderWidth: 1, borderColor: "#6b1a1a" },
  dataValue: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  dataLabel: { color: "#4a7fa5", fontSize: 10, marginTop: 2, textAlign: "center" },
  dataIndicator: { fontSize: 12, marginTop: 4, color: "#7eb8f7" },
  alarmBtn: {
    backgroundColor: "#1a6fc4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  alarmBtnDone: { backgroundColor: "#1a8c5b" },
  alarmBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  updateHint: { color: "#2a4a6b", fontSize: 12, textAlign: "center", marginTop: 8 },
  emptyState: { alignItems: "center", marginTop: 80 },
  emptyIcon:  { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  emptyText: {
    color: "#4a7fa5",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  setupBtn: {
    backgroundColor: "#1a6fc4",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  setupBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  error: { color: "#e07070", textAlign: "center", marginTop: 40, fontSize: 14 },
});
