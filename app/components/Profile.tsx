import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  GraduationCap,
  Users,
} from "lucide-react-native";
import { db } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: "student" | "organizer";
  displayName: string;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string | null;
}

interface ProfileProps {
  onLogin: (
    email: string,
    password: string,
    userType: string,
    firstName: string,
    lastName: string,
    createdAt: Date
  ) => void;
  onLogout: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function Profile({ userId, onLogout }: ProfileProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");

  const getCurrentUserId = async () => {
    try {
      const q = query(collection(db, "accounts"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }
      return null;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();

      if (!userId) {
        Alert.alert("Error", "User not found. Please log in again.");
        return;
      }

      const userDoc = await getDoc(doc(db, "accounts", userId));

      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
        setUser(userData);

        // Set editable fields
        setEditFirstName(userData.firstName);
        setEditLastName(userData.lastName);
      } else {
        Alert.alert("Error", "Profile not found.");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const updatedData = {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        displayName: `${editFirstName.trim()} ${editLastName.trim()}`,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, "accounts", user.id), updatedData);

      // Update local state
      setUser({ ...user, ...updatedData });
      setEditing(false);

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setEditFirstName(user?.firstName || "");
    setEditLastName(user?.lastName || "");
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerActions}>
          {editing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={handleCancelEdit}
                style={styles.cancelButton}
              >
                <X size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveProfile}
                style={styles.saveButton}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Save size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setEditing(true)}
              style={styles.editButton}
            >
              <Edit3 size={20} color="#6200ee" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {user.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color="#6200ee" />
            </View>
          )}
        </View>

        {editing ? (
          <View style={styles.nameEditContainer}>
            <TextInput
              style={styles.nameInput}
              value={editFirstName}
              onChangeText={setEditFirstName}
              placeholder="First Name"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              style={styles.nameInput}
              value={editLastName}
              onChangeText={setEditLastName}
              placeholder="Last Name"
              placeholderTextColor="#9ca3af"
            />
          </View>
        ) : (
          <Text style={styles.displayName}>{user.displayName}</Text>
        )}

        <View style={styles.userTypeBadge}>
          {user.userType === "organizer" ? (
            <>
              <Shield size={16} color="#6200ee" />
              <Text style={styles.userTypeText}>Event Organizer</Text>
            </>
          ) : (
            <>
              <GraduationCap size={16} color="#6200ee" />
              <Text style={styles.userTypeText}>Student</Text>
            </>
          )}
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <View style={styles.infoItem}>
          <Mail size={20} color="#666" />
          <Text style={styles.infoText}>{user.email}</Text>
        </View>
      </View>

      {/* Account Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>

        <View style={styles.infoItem}>
          <Calendar size={20} color="#666" />
          <View>
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoText}>{formatDate(user.createdAt)}</Text>
          </View>
        </View>
      </View>

      {/* Log out button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            if (onLogout) onLogout();
          }}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerActions: {
    alignItems: "flex-end",
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#6200ee",
    minWidth: 36,
    alignItems: "center",
  },
  profileSection: {
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0d6ee",
    justifyContent: "center",
    alignItems: "center",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  nameEditContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlign: "center",
  },
  userTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0d6ee",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  userTypeText: {
    color: "#6200ee",
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    backgroundColor: "white",
    marginBottom: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  editInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  bioText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
