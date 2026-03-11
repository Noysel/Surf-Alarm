import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen     from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AlarmScreen    from "./screens/AlarmScreen";
import { registerWaveCheckTask } from "./tasks/waveCheckTask";

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const tokenData = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  const token = tokenData.data;
  await AsyncStorage.setItem("expoPushToken", token);
  return token;
}

export default function App() {
  const notificationListener = useRef();
  const responseListener     = useRef();
  const navigationRef        = useRef();

  useEffect(() => {
    registerForPushNotifications();
    registerWaveCheckTask();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        // When notification fires while app is open — go directly to AlarmScreen
        const data = notification.request.content.data;
        navigationRef.current?.navigate("Alarm", {
          isGood:    data?.isGood,
          alarmTime: data?.alarmTime,
          waveData:  data?.waveData,
        });
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // When user taps the notification — go to AlarmScreen
        const data = response.notification.request.content.data;
        navigationRef.current?.navigate("Alarm", {
          isGood:    data?.isGood,
          alarmTime: data?.alarmTime,
          waveData:  data?.waveData,
        });
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home"     component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Alarm"    component={AlarmScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
