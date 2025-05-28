import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Users, Calendar, TrendingUp, BarChart2 } from "react-native-feather";
import { collection, query, getDocs } from "firebase/firestore";

const Reports = ({ userType = "organizer" }) => {
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    averageAttendance: 0,
    upcomingEvents: 0,
    popularCategories: [],
    monthlyStats: [],
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const eventsRef = collection(db, "events");
        const eventsSnap = await getDocs(eventsRef);

        const eventsData = eventsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate metrics
        const totalEvents = eventsData.length;
        const totalAttendees = eventsData.reduce(
          (sum, event) => sum + (event.attendees?.length || 0),
          0
        );

        setMetrics({
          totalEvents,
          totalAttendees,
          averageAttendance:
            totalEvents > 0
              ? Math.round((totalAttendees / totalEvents) * 100)
              : 0,
          upcomingEvents: eventsData.filter(
            (e) => e.status === "upcoming"
          ).length,
          popularCategories: calculatePopularCategories(eventsData),
          monthlyStats: calculateMonthlyStats(eventsData),
        });
      } catch (error) {
        console.error("Error fetching metrics: ", error);
      }
    };

    fetchMetrics();
  }, []);

  const eventMetrics = metrics;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Event Analytics</Text>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Calendar width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>{eventMetrics.totalEvents}</Text>
          <Text style={styles.metricLabel}>Total Events</Text>
        </View>

        <View style={styles.metricCard}>
          <Users width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>{eventMetrics.totalAttendees}</Text>
          <Text style={styles.metricLabel}>Total Attendees</Text>
        </View>

        <View style={styles.metricCard}>
          <TrendingUp width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>
            {eventMetrics.averageAttendance}%
          </Text>
          <Text style={styles.metricLabel}>Avg. Attendance</Text>
        </View>

        <View style={styles.metricCard}>
          <BarChart2 width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>{eventMetrics.upcomingEvents}</Text>
          <Text style={styles.metricLabel}>Upcoming</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Popular Categories</Text>
      <View style={styles.categoriesList}>
        {eventMetrics.popularCategories.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryCount}>{category.count} events</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Monthly Overview</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {eventMetrics.monthlyStats.map((stat, index) => (
          <View key={index} style={styles.monthlyCard}>
            <Text style={styles.monthText}>{stat.month}</Text>
            <Text style={styles.monthStat}>{stat.events} Events</Text>
            <Text style={styles.monthStat}>{stat.attendees} Attendees</Text>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
};

const calculatePopularCategories = (events) => {
  const categories = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categories)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
};

const calculateMonthlyStats = (events) => {
  // Implementation for monthly statistics
  // ...
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricIcon: {
    color: "#2563eb",
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  metricLabel: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 12,
  },
  categoriesList: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  categoryName: {
    fontSize: 16,
    color: "#1e293b",
  },
  categoryCount: {
    fontSize: 16,
    color: "#64748b",
  },
  monthlyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  monthStat: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
});

export default Reports;
