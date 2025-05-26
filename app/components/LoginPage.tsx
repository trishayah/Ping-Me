import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LogIn } from "lucide-react-native";
import { useRouter } from "expo-router";

const LoginPage = ({ onLogin, onSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    const success = onLogin(email, password);
    if (!success) {
      setError("Invalid email or password");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSubtitle}>
            Log in to manage your events or RSVP to upcoming tech events
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
            <LogIn size={18} color="white" style={styles.loginIcon} />
            <Text style={styles.ButtonText}>Log In</Text>
          </TouchableOpacity>
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Don't have an account?{" "}
              <Text style={styles.signupLink} onPress={onSignup}>
                Sign up
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 50,
  },
  backButton: {
    marginRight: 12,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: "#4b5563",
  },
  form: {
    marginBottom: 32,
    gap: 8,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#111827",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    marginBottom: 16,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  ButtonText: {
    color: "white",
    fontWeight: "500",
  },
  loginIcon: {
    marginRight: 8,
  },
  signupContainer: {
    marginTop: 24,
    alignItems: "center",
  },

  signupText: {
    fontSize: 14,
    color: "#6b7280", // gray-500
  },

  signupLink: {
    color: "#2563eb",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
export default LoginPage;
