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
import { db } from "../../firebaseConfig"; // Adjust the path if your firebase config is elsewhere

type PopularCategory = { name: string; count: number };
type MonthlyStat = { month: string; events: number; attendees: number };

type Metrics = {
  totalEvents: number;
  totalAttendees: number;
  averageAttendance: number;
  upcomingEvents: number;
  popularCategories: PopularCategory[];
  monthlyStats: MonthlyStat[];
};

// Helper function to calculate popular categories
const calculatePopularCategories = (events: any[]): PopularCategory[] => {
  const categories = events.reduce((acc: Record<string, number>, event) => {
    // Handle undefined or null eventType
    const eventType = event.eventType?.toLowerCase() || 'uncategorized';
    acc[eventType] = (acc[eventType] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categories)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
};

// Helper function to calculate monthly statistics
const calculateMonthlyStats = (events: any[]): MonthlyStat[] => {
  const monthlyData = events.reduce((acc: Record<string, { events: number; attendees: number }>, event) => {
    // Handle date parsing safely
    let month = 'Unknown';
    if (event.date) {
      try {
        const date = new Date(event.date);
        if (!isNaN(date.getTime())) {
          month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
      } catch (error) {
        console.warn('Invalid date format:', event.date);
      }
    }

    if (!acc[month]) {
      acc[month] = { events: 0, attendees: 0 };
    }
    
    acc[month].events += 1;
    acc[month].attendees += event.attendees?.length || 0;
    
    return acc;
  }, {});

  return Object.entries(monthlyData)
    .map(([month, stats]) => ({ month, ...stats }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const Reports = ({ userType = "organizer" }) => {
  const [metrics, setMetrics] = useState<Metrics>({
    totalEvents: 0,
    totalAttendees: 0,
    averageAttendance: 0,
    upcomingEvents: 0,
    popularCategories: [],
    monthlyStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const eventsRef = collection(db, "events");
        const eventsSnap = await getDocs(eventsRef);

        type EventType = {
          id: string;
          attendees?: any[];
          eventType?: string;
          status?: string;
          date?: string;
          [key: string]: any;
        };

        const eventsData: EventType[] = eventsSnap.docs.map((doc) => ({
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
              ? Math.round((totalAttendees / totalEvents) * 100) / 100
              : 0,
          upcomingEvents: eventsData.filter(
            (e) => e.status?.toLowerCase() === "upcoming"
          ).length,
          popularCategories: calculatePopularCategories(eventsData),
          monthlyStats: calculateMonthlyStats(eventsData),
        });
      } catch (error) {
        console.error("Error fetching metrics: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Event Analytics</Text>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Calendar width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>{metrics.totalEvents}</Text>
          <Text style={styles.metricLabel}>Total Events</Text>
        </View>

        <View style={styles.metricCard}>
          <Users width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>{metrics.totalAttendees}</Text>
          <Text style={styles.metricLabel}>Total Attendees</Text>
        </View>

        <View style={styles.metricCard}>
          <TrendingUp width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>
            {metrics.averageAttendance}
          </Text>
          <Text style={styles.metricLabel}>Avg. Attendance</Text>
        </View>

        <View style={styles.metricCard}>
          <BarChart2 width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>{metrics.upcomingEvents}</Text>
          <Text style={styles.metricLabel}>Upcoming</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Popular Categories</Text>
      <View style={styles.categoriesList}>
        {metrics.popularCategories.length > 0 ? (
          metrics.popularCategories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>
                {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
              </Text>
              <Text style={styles.categoryCount}>{category.count} events</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No categories data available</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Monthly Overview</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {metrics.monthlyStats.length > 0 ? (
          metrics.monthlyStats.map((stat, index) => (
            <View key={index} style={styles.monthlyCard}>
              <Text style={styles.monthText}>{stat.month}</Text>
              <Text style={styles.monthStat}>{stat.events} events</Text>
              <Text style={styles.monthStat}>{stat.attendees} attendees</Text>
            </View>
          ))
        ) : (
          <View style={styles.monthlyCard}>
            <Text style={styles.emptyText}>No monthly data available</Text>
          </View>
        )}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default Reports;