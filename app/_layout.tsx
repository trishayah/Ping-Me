import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import EventsPage from "./components/Events";
import Transactions from "./components/Transactions";
import Profile from "./components/Profile";
import Reports from "./components/Reports";
import Homepage from "./components/Homepage";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';


const Tab = createBottomTabNavigator();

// Temporary debugging component to isolate the issue
// const DebugComponent = ({ route }: { route: any }) => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     <Text>{route.params?.name ?? "Unknown"} - Debug Mode</Text>
//   </View>
// );

function AuthenticatedTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTitleAlign: "center",
        tabBarActiveTintColor: "#6200ee",
      }}
    >
      <Tab.Screen
        name="Home"
        component={Homepage}
        initialParams={{ name: "Home" }}
        options={{
          headerTitle: () => <HeaderTitle text="Home" />,
          tabBarIcon: ({ color }) => (
            <Entypo name="home" color="#000" size={24} />
          )
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsPage}
        initialParams={{ name: "Events" }}
        options={{
          headerTitle: () => <HeaderTitle text="Events" />,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="event" color="#000" size={24} />
          )
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={Transactions}
        initialParams={{ name: "Transactions" }}
        options={{
          headerTitle: () => <HeaderTitle text="Transaction" />,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="published-with-changes" color="#000" size={24} />
          )
        }}
      />
      <Tab.Screen
        name="Reports"
        component={Reports}
        initialParams={{ name: "Reports" }}
        options={{
          headerTitle: () => <HeaderTitle text="Reports" />,
          tabBarIcon: ({ color }) => (
            <Ionicons name="journal" color="#000" size={24} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        initialParams={{ name: "Profile" }}
        options={{
          headerTitle: () => <HeaderTitle text="Profile" />,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" color="#000" size={24} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootLayout() {
  const [appState, setAppState] = useState<
    "loading" | "login" | "signup" | "authenticated"
  >("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState("login");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (email: string, password: string) => {
    console.log("Login with:", email, password);
    setAppState("authenticated");
    return true;
  };

  const handleSignup = () => {
    setAppState("signup");
  };

  const handleBackToLogin = () => {
    setAppState("login");
  };

  // Add this handler for successful signup
  const handleSignupSuccess = () => {
    setAppState("authenticated");
  };

  if (appState === "loading") {
    return <SplashScreen />;
  }

  if (appState === "signup") {
    // Pass the success handler to SignUpPage
    return <SignUpPage onBack={handleBackToLogin} onSignupSuccess={handleSignupSuccess} />;
  }

  if (appState === "login") {
    return <LoginPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  // Authenticated views — show tab navigator
  return <AuthenticatedTabs />;
}

// Custom header title with safety check
const HeaderTitle = ({ text }: { text?: string }) => (
  <View style={styles.headerTitleContainer}>
    <Text style={styles.headerTitleText}>{text || "App"}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#6200ee",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});