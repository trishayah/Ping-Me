// // import { Stack } from "expo-router";
// // import { View, Text, StyleSheet } from "react-native";
// // import { useEffect, useState } from 'react';
// // import SplashScreen from './components/SplashScreen';
// // import LoginPage from './components/LoginPage';
// // import SignUpPage from './components/SignUpPage';
// // import EventsPage from './components/Events';

// // export default function RootLayout() {
// //   const [appState, setAppState] = useState<'loading' | 'login' | 'signup' | 'authenticated'>('loading');

// //   useEffect(() => {
// //     // Simulate app loading process
// //     const timer = setTimeout(() => {
// //       setAppState('login');
// //     }, 2500);

// //     return () => clearTimeout(timer);
// //   }, []);

// //   const handleLogin = (email: string, password: string) => {
// //     // Add your real authentication logic here
// //     console.log('Login with:', email, password);
// //     setAppState('authenticated');
// //     return true;
// //   };

// //   const handleSignup = () => {
// //     setAppState('signup');
// //   };

// //   const handleBackToLogin = () => {
// //     setAppState('login');
// //   };

// //   if (appState === 'loading') {
// //     return <SplashScreen />;
// //   }

// //   if (appState === 'signup') {
// //     return <SignUpPage onBack={handleBackToLogin} />;
// //   }

// //   if (appState === 'login') {
// //     return (
// //       <LoginPage 
// //         onLogin={handleLogin}
// //         onSignup={handleSignup}
// //       />
// //     );
// //   }

// //   // Authenticated views
// //   return (
// //     <Stack>
// //       <Stack.Screen
// //         name="index"
// //         options={{
// //           headerStyle: styles.header,
// //           headerTitle: () => <HeaderTitle text="PingMe" />,
// //           headerTitleAlign: "center",
// //         }}
// //       />
// //       <Stack.Screen
// //         name="dashboard"
// //         options={{
// //           headerStyle: styles.header,
// //           headerTitle: () => <HeaderTitle text="Dashboard" />,
// //           headerTitleAlign: "center",
// //         }}
// //       />
// //       <Stack.Screen
// //         name="events"
// //         options={{
// //           headerStyle: styles.header,
// //           headerTitle: () => <HeaderTitle text="Events" />,
// //           headerTitleAlign: "center",
// //         }}
// //       />
// //       <Stack.Screen
// //         name="signup"
// //         options={{
// //           headerShown: false
// //         }}
// //       />
// //     </Stack>
// //   );
// // }

// // // Reusable header component
// // const HeaderTitle = ({ text }: { text: string }) => (
// //   <View style={styles.headerTitleContainer}>
// //     <Text style={styles.headerTitleText}>{text}</Text>
// //   </View>
// // );

// // const styles = StyleSheet.create({
// //   header: {
// //     backgroundColor: "#6200ee",
// //   },
// //   headerTitleContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },
// //   headerTitleText: {
// //     color: "#fff",
// //     fontSize: 20,
// //     fontWeight: "bold",
// //   },
// // });

// import { Stack } from "expo-router";
// import { View, Text, StyleSheet } from "react-native";
// import { useEffect, useState } from "react";
// import SplashScreen from "./components/SplashScreen";
// import LoginPage from "./components/LoginPage";
// import SignUpPage from "./components/SignUpPage";
// import EventsPage from "./components/Events";
// import DashboardPage from "./components/Homepage"; // You must create this component

// import { NavigationContainer } from "@react-navigation/native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// // Bottom tab navigator
// const Tab = createBottomTabNavigator();

// function AuthenticatedTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerStyle: styles.header,
//         headerTitleAlign: "center",
//         tabBarActiveTintColor: "#6200ee",
//       }}
//     >
//       <Tab.Screen
//         name="Dashboard"
//         component={DashboardPage}
//         options={{
//           headerTitle: () => <HeaderTitle text="Dashboard" />,
//         }}
//       />
//       <Tab.Screen
//         name="Events"
//         component={EventsPage}
//         options={{
//           headerTitle: () => <HeaderTitle text="Events" />,
//         }}
//       />
//     </Tab.Navigator>
//   );
// }

// export default function RootLayout() {
//   const [appState, setAppState] = useState<
//     "loading" | "login" | "signup" | "authenticated"
//   >("loading");

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setAppState("login");
//     }, 2500);

//     return () => clearTimeout(timer);
//   }, []);

//   const handleLogin = (email: string, password: string) => {
//     console.log("Login with:", email, password);
//     setAppState("authenticated");
//     return true;
//   };

//   const handleSignup = () => {
//     setAppState("signup");
//   };

//   const handleBackToLogin = () => {
//     setAppState("login");
//   };

//   if (appState === "loading") {
//     return <SplashScreen />;
//   }

//   if (appState === "signup") {
//     return <SignUpPage onBack={handleBackToLogin} />;
//   }

//   if (appState === "login") {
//     return <LoginPage onLogin={handleLogin} onSignup={handleSignup} />;
//   }

//   // Authenticated views (bottom tab navigation)
//   return (
//     <NavigationContainer>
//       <AuthenticatedTabs />
//     </NavigationContainer>
//   );
// }

// // Header title component
// const HeaderTitle = ({ text }: { text: string }) => (
//   <View style={styles.headerTitleContainer}>
//     <Text style={styles.headerTitleText}>{text}</Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#6200ee",
//   },
//   headerTitleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   headerTitleText: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
// });


import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import EventsPage from "./components/Events";
import Transactions from "./components/Transactions";
import Profile from "./components/Profile";
// import DashboardPage from "./components/Dashboard"; // Make sure this exists

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Homepage from "./components/Homepage";

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Bottom tabs shown after authentication
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
        options={{
          headerTitle: () => <HeaderTitle text="Home" />,
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsPage}
        options={{
          headerTitle: () => <HeaderTitle text="Events" />,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={Transactions}
        options={{
          headerTitle: () => <HeaderTitle text="Transacion" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerTitle: () => <HeaderTitle text="Profile" />,
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

  // Authenticated views — show tab navigator (no extra NavigationContainer)
  return <AuthenticatedTabs />;
}

// Custom header title
const HeaderTitle = ({ text }: { text: string }) => (
  <View style={styles.headerTitleContainer}>
    <Text style={styles.headerTitleText}>{text}</Text>
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
