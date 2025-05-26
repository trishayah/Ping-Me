import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';

export default function RootLayout() {
  const [appState, setAppState] = useState<'loading' | 'login' | 'signup' | 'authenticated'>('loading');

  useEffect(() => {
    // Simulate app loading process
    const timer = setTimeout(() => {
      setAppState('login');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Add your real authentication logic here
    console.log('Login with:', email, password);
    setAppState('authenticated');
    return true;
  };

  const handleSignup = () => {
    setAppState('signup');
  };

  const handleBackToLogin = () => {
    setAppState('login');
  };

  if (appState === 'loading') {
    return <SplashScreen />;
  }

  if (appState === 'signup') {
    return <SignUpPage onBack={handleBackToLogin} />;
  }

  if (appState === 'login') {
    return (
      <LoginPage 
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  // Authenticated views
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerStyle: styles.header,
          headerTitle: () => <HeaderTitle text="PingMe" />,
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          headerStyle: styles.header,
          headerTitle: () => <HeaderTitle text="Dashboard" />,
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="events"
        options={{
          headerStyle: styles.header,
          headerTitle: () => <HeaderTitle text="Events" />,
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}

// Reusable header component
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