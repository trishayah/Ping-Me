import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6200ee",
        },
        headerTitleAlign: "center",
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#6200ee",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: () => <Text style={{ color: "#fff", fontSize: 20 }}>PingMe</Text>,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
        }}
      />
    </Tabs>
  );
}
