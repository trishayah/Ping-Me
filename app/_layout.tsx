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

function EventsStackScreen({
  userType,
  userData,
}: {
  userType: "student" | "organizer";
  userData: { email: string; firstName: string };
}) {
  return (
    <EventsStack.Navigator
      screenOptions={{
        headerShown: false, // Hide all headers in this stack
      }}
    >
      <EventsStack.Screen
        name="EventsMain"
        options={{ headerShown: false, title: "" }} // Hide header and title
      >
        {(props) => (
          <EventsPage {...props} userType={userType} userData={userData} />
        )}
      </EventsStack.Screen>
      <EventsStack.Screen
        name="AddEvent"
        component={AddEvent}
        options={{ headerTitle: "" }} // Hide title for AddEvent as well
      />
    </EventsStack.Navigator>
  );
}

function AuthenticatedTabs({
  userData,
  onLogout,
}: {
  userData: {
    userId: string; // Added userId
    userType: "student" | "organizer";
    email: string;
    firstName: string;
    userName: string;
  };
  onLogout: () => void;
}) {
  const isOrganizer = userData.userType === "organizer";
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
        children={() => (
          <EventsStackScreen userType={userData.userType} userData={userData} />
        )}
        options={{
          headerTitle: () => <HeaderTitle text="Events" />,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="event" color="#000" size={24} />
          ),
        }}
      />
      {isOrganizer && (
        <Tab.Screen
          name="Transactions"
          children={(props) => <Transactions {...props} userData={userData} />}
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
      )}
      {isOrganizer && (
        <Tab.Screen
          name="Reports"
          children={(props) => <Reports {...props} userType={userData.userType} userData={userData} />}
          initialParams={{ name: "Reports" }}
          options={{
            headerTitle: () => <HeaderTitle text="Reports" />,
            tabBarIcon: ({ color }) => (
              <Ionicons name="journal" color="#000" size={24} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        children={(props) => (
          <Profile
            userId={userData.userId} // Pass userId prop
            onLogout={onLogout}
            onLogin={(
              email,
              password,
              userType,
              firstName,
              lastName,
              createdAt
            ) => {}}
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
    userId: string; // Added userId
    userType: "student" | "organizer";
    email: string;
    firstName: string;
    userName: string;
  } | null>(null);
  const [loginKey, setLoginKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState("login");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (
    userId: string,
    email: string,
    password: string,
    userType: "student" | "organizer",
    firstName: string
  ) => {
    setUserData({
      userId, // Store userId
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
    userId: string, // Added userId parameter
    email: string,
    userType: "student" | "organizer",
    firstName: string
  ) => {
    setUserData({
      userId, // Store userId
      userType,
      email,
      firstName,
      userName: firstName,
    });
    setAppState("authenticated");
  };

  const handleLogout = () => {
    setUserData(null);
    setLoginKey(prev => prev + 1);
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
    return <LoginPage key={loginKey} onLogin={handleLogin} onSignup={handleSignup} />;
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