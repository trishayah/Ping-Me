import { firebaseApp } from "../../firebaseConfig"; // Adjust the path as necessary
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { UserPlus, ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

// Initialize Firestore
const db = getFirestore(firebaseApp);

interface SignUpPageProps {
  onBack: () => void;
  onSignupSuccess: (email: string, userType: "student" | "organizer") => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onBack, onSignupSuccess }) => {
  const navigation = useNavigation();
  const [userType, setUserType] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!userType) {
        setError("Please select your user type");
        return;
      }

      if (!fname || !lname || !email || !password || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Check if email already exists in the accounts collection
      const emailQuery = query(
        collection(db, "accounts"),
        where("email", "==", email.toLowerCase().trim())
      );
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        setError(
          "This email is already registered. Please use a different email."
        );
        return;
      }

      // Store user data in Firestore accounts collection
      await addDoc(collection(db, "accounts"), {
        userType: userType,
        firstName: fname.trim(),
        lastName: lname.trim(),
        email: email.toLowerCase().trim(),
        password: password, 
        createdAt: serverTimestamp(),
        displayName: `${fname.trim()} ${lname.trim()}`,
      });

      // Clear the form
      setUserType("");
      setFname("");
      setLname("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // // Success alert with navigation to homepage
      // Alert.alert("Success!", "Your account has been created successfully.", [
      //   {
      //     text: "OK",
      //     onPress: () => {
      //       // Navigate to homepage
      //       navigation.reset({
      //         index: 0,
      //         routes: [{ name: "Home" }],
      //       });
      //     },
      //   },
      // ]);
      console.log("[SignUpPage] Calling onSignupSuccess with:", {
      email: email.toLowerCase().trim(),
      userType,
      firstName: fname.trim()
   });
   onSignupSuccess(email.toLowerCase().trim(), userType as "student" | "organizer", fname.trim());

    } catch (error: any) {
      console.error("Signup error:", error);

      let errorMessage = "An error occurred during signup. Please try again.";

      if (error.code === "permission-denied") {
        errorMessage =
          "Permission denied. Please check your Firestore security rules.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#6200ee" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeSubtitle}>
            Join us to{" "}
            {userType === "organizer"
              ? "create and manage events"
              : "discover amazing events"}
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>I am a:</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === "student" && styles.userTypeButtonSelected,
                ]}
                onPress={() => setUserType("student")}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.userTypeText,
                    userType === "student" && styles.userTypeTextSelected,
                  ]}
                >
                  Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === "organizer" && styles.userTypeButtonSelected,
                ]}
                onPress={() => setUserType("organizer")}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.userTypeText,
                    userType === "organizer" && styles.userTypeTextSelected,
                  ]}
                >
                  Event Organizer
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={fname}
              onChangeText={setFname}
              placeholder="Enter your first name"
              placeholderTextColor="#9ca3af"
              editable={!loading}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lname}
              onChangeText={setLname}
              placeholder="Enter your last name"
              placeholderTextColor="#9ca3af"
              editable={!loading}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password (min. 8 characters)"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              editable={!loading}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[
                styles.signupButton,
                (loading ||
                  !userType ||
                  !fname ||
                  !lname ||
                  !email ||
                  !password ||
                  !confirmPassword) &&
                  styles.signupButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={
                loading ||
                !userType ||
                !fname ||
                !lname ||
                !email ||
                !password ||
                !confirmPassword
              }
            >
              <UserPlus size={20} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginLink} onPress={onBack}>
                  Log in
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  headerPlaceholder: { width: 32 },
  content: { flex: 1, paddingHorizontal: 24 },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  form: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  userTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  userTypeButtonSelected: {
    borderColor: "#6200ee",
    backgroundColor: "#e0d6ee",
  },
  userTypeText: { color: "#4b5563", fontWeight: "500" },
  userTypeTextSelected: { color: "#6200ee", fontWeight: "600" },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8, color: "#374151" },
  input: {
    width: "100%",
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    fontSize: 15,
  },
  signupButton: {
    width: "100%",
    backgroundColor: "#6200ee",
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  signupButtonDisabled: {
    backgroundColor: "#c4a7ee",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: { color: "white", fontWeight: "600", fontSize: 16 },
  icon: { marginRight: 12 },
  loginContainer: { marginTop: 24, alignItems: "center" },
  loginText: { fontSize: 15, color: "#6b7280" },
  loginLink: {
    color: "#9570dd",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default SignUpPage;
