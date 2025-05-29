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
import AddEvent from "./components/AddEvent"; // Create this file if it doesn't exist

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();
const EventsStack = createNativeStackNavigator();

// Temporary debugging component to isolate the issue
// const DebugComponent = ({ route }: { route: any }) => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     <Text>{route.params?.name ?? "Unknown"} - Debug Mode</Text>
//   </View>
// );

function EventsStackScreen({ userType }: { userType: "student" | "organizer" }) {
  return (
    <EventsStack.Navigator>
      <EventsStack.Screen name="EventsMain" options={{ headerShown: false }}>
        {(props) => <EventsPage {...props} userType={userType} />}
      </EventsStack.Screen>
      <EventsStack.Screen
        name="AddEvent"
        component={AddEvent}
        options={{ title: "Add Event" }}
      />
    </EventsStack.Navigator>
  );
}

function AuthenticatedTabs({
  userData,
  onLogout,
}: {
  userData: {
    userType: "student" | "organizer";
    email: string;
    firstName: string;
    userName: string;
  };
  onLogout: () => void;
}) {
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
        children={(props) => <Homepage {...props} userData={userData} />}
        initialParams={{ name: "Home" }}
        options={{
          headerTitle: () => <HeaderTitle text="Home" />,
          tabBarIcon: ({ color }) => (
            <Entypo name="home" color="#000" size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        children={() => <EventsStackScreen userType={userData.userType} />}
        options={{
          headerTitle: () => <HeaderTitle text="Events" />,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="event" color="#000" size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        children={(props) => <Transactions />}
        initialParams={{ name: "Transactions" }}
        options={{
          headerTitle: () => <HeaderTitle text="Transaction" />,
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="published-with-changes"
              color="#000"
              size={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        children={(props) => <Reports />}
        initialParams={{ name: "Reports" }}
        options={{
          headerTitle: () => <HeaderTitle text="Reports" />,
          tabBarIcon: ({ color }) => (
            <Ionicons name="journal" color="#000" size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        children={(props) => (
          <Profile
            onLogout={onLogout}
            onLogin={
              (email, password, userType, firstName, lastName, createdAt) => {}
            }
          />
        )}
        initialParams={{ name: "Profile" }}
        options={{
          headerTitle: () => <HeaderTitle text="Profile" />,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" color="#000" size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootLayout() {
  const [appState, setAppState] = useState<
    "loading" | "login" | "signup" | "authenticated"
  >("loading");
  const [userData, setUserData] = useState<{
    userType: "student" | "organizer";
    email: string;
    firstName: string;
    userName: string;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState("login");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (
    email: string,
    password: string,
    userType: "student" | "organizer",
    firstName: string
  ) => {
    setUserData({
      userType,
      email,
      firstName,
      userName: firstName, // Or keep email.split('@')[0] if you prefer
    });
    setAppState("authenticated");
  };

  const handleSignup = () => {
    setAppState("signup");
  };

  const handleBackToLogin = () => {
    setAppState("login");
  };

  const handleSignupSuccess = (
    email: string,
    userType: "student" | "organizer",
    firstName: string
  ) => {
    setUserData({
      userType,
      email,
      firstName,
      userName: firstName,
    });
    setAppState("authenticated");
  };

  const handleLogout = () => {
    setUserData(null);
    setAppState("login");
  };

  if (appState === "loading") {
    return <SplashScreen />;
  }

  if (appState === "signup") {
    return (
      <SignUpPage
        onBack={handleBackToLogin}
        onSignupSuccess={handleSignupSuccess}
      />
    );
  }

  if (appState === "login") {
    return <LoginPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  if (!userData) return null;
  return <AuthenticatedTabs userData={userData} onLogout={handleLogout} />;
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
