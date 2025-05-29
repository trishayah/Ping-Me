import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  Calendar,
  Users,
  PlusCircle,
  Star,
  Bell,
  Settings,
} from "react-native-feather";

import type { StackNavigationProp } from '@react-navigation/stack';

type HomepageProps = {
  userType?: "student" | "organizer";
  navigation: StackNavigationProp<any>;
};

const Homepage: React.FC<HomepageProps> = ({ userType = "student", navigation }) => {
  const renderOrganizerStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>12</Text>
        <Text style={styles.statLabel}>Total Events</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>458</Text>
        <Text style={styles.statLabel}>Attendees</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>8</Text>
        <Text style={styles.statLabel}>Upcoming</Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      {userType === "organizer" ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("AddEvent")}
        >
          <PlusCircle width={24} height={24} style={styles.actionIcon} />
          <Text style={styles.actionText}>Create Event</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("Events")}
        >
          <Star width={24} height={24} style={styles.actionIcon} />
          <Text style={styles.actionText}>Browse Events</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            style={styles.avatar}
            source={{ uri: "https://via.placeholder.com/40" }}
          />
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.userName}>{userEmail || "User"}</Text>
          </View>
        </View>
        <TouchableOpacity>
          {/* <Bell width={24} height={24} style={styles.headerIcon} /> */}
           <Bell width={24} height={24} color={styles.headerIcon.color} />
        </TouchableOpacity>
      </View>

      {userType === "organizer" && renderOrganizerStats()}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      {renderQuickActions()}

      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.eventsScroll}
      >
        {/* Example Event Cards */}
        <TouchableOpacity style={styles.eventCard}>
          <View style={styles.eventDateBadge}>
            <Text style={styles.eventDateDay}>15</Text>
            <Text style={styles.eventDateMonth}>MAY</Text>
          </View>
          <Text style={styles.eventTitle}>Tech Conference 2024</Text>
          <View style={styles.eventDetail}>
            <Users width={14} height={14} style={styles.eventIcon} />
            <Text style={styles.eventDetailText}>150 attending</Text>
          </View>
        </TouchableOpacity>
        {/* Add more event cards as needed */}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  welcome: {
    fontSize: 14,
    color: "#64748b",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  headerIcon: {
    color: "#64748b",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "white",
    marginBottom: 16,
  },
  statCard: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    padding: 16,
    paddingBottom: 8,
  },
  quickActionsContainer: {
    padding: 16,
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    color: "#2563eb",
    marginRight: 8,
  },
  actionText: {
    color: "#1e293b",
    fontWeight: "500",
  },
  eventsScroll: {
    paddingHorizontal: 16,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventDateBadge: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  eventDateDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
  },
  eventDateMonth: {
    fontSize: 12,
    color: "#64748b",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventIcon: {
    color: "#64748b",
    marginRight: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: "#64748b",
  },
});

export default Homepage;
