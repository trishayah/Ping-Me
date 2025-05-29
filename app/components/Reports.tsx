import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Users, Calendar, TrendingUp, BarChart2 } from "react-native-feather";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

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
    // Handle different field names and undefined values
    const eventType = event.eventType?.toLowerCase() || 
                     event.category?.toLowerCase() || 
                     "uncategorized";
    acc[eventType] = (acc[eventType] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categories)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
};

// Helper function to calculate monthly statistics
const calculateMonthlyStats = (
  events: any[],
  registrations: any[]
): MonthlyStat[] => {
  // Map eventId to registrations for attendee count
  const eventIdToAttendees: Record<string, number> = {};
  registrations.forEach((reg) => {
    if (reg.eventId) {
      eventIdToAttendees[reg.eventId] =
        (eventIdToAttendees[reg.eventId] || 0) + 1;
    }
  });

  const monthlyData = events.reduce(
    (acc: Record<string, { events: number; attendees: number }>, event) => {
      let month = "Unknown";
      if (event.date) {
        try {
          const date = new Date(event.date);
          if (!isNaN(date.getTime())) {
            month = date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          }
        } catch (error) {
          console.warn("Invalid date format:", event.date);
        }
      }

      if (!acc[month]) {
        acc[month] = { events: 0, attendees: 0 };
      }

      acc[month].events += 1;
      acc[month].attendees += eventIdToAttendees[event.id] || 0;

      return acc;
    },
    {}
  );

  return Object.entries(monthlyData)
    .map(([month, stats]) => ({ month, ...stats }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const Reports = ({ 
  userType = "organizer",
  userData
}: {
  userType?: "student" | "organizer";
  userData?: {
    userId?: string;
    email?: string;
    userType?: "student" | "organizer";
  };
}) => {
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
    console.log("=== REPORTS REAL-TIME SETUP ===");
    console.log("userType:", userType);
    console.log("userId:", userData?.userId);
    console.log("email:", userData?.email);

    let eventsUnsubscribe: (() => void) | null = null;
    let registrationsUnsubscribe: (() => void) | null = null;

    const setupRealTimeListeners = () => {
      let eventsQuery;
      let registrationsQuery;
      
      // Apply filtering based on user type (same as Events component)
      if (userType === "organizer" && userData?.userId) {
        console.log("Setting up reports for organizer events only");
        eventsQuery = query(
          collection(db, "events"),
          where("createdBy", "==", userData.userId)
        );
      } else {
        console.log("Setting up reports for all events");
        eventsQuery = collection(db, "events");
      }

      // Set up real-time listener for events
      eventsUnsubscribe = onSnapshot(eventsQuery, (eventsSnapshot) => {
        console.log("=== REPORTS EVENTS UPDATE ===");
        console.log("Received", eventsSnapshot.size, "events for reports");

        type EventType = {
          id: string;
          attendees?: any[];
          eventType?: string;
          category?: string;
          status?: string;
          date?: string;
          createdBy?: string;
          [key: string]: any;
        };

        const eventsData: EventType[] = eventsSnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Report event:", doc.id, data.name || data.eventName);
          return {
            id: doc.id,
            ...data,
          };
        });

        // Set up registrations query based on events we have
        const eventIds = eventsData.map(event => event.id);
        
        if (eventIds.length === 0) {
          console.log("No events found, setting empty metrics");
          setMetrics({
            totalEvents: 0,
            totalAttendees: 0,
            averageAttendance: 0,
            upcomingEvents: 0,
            popularCategories: [],
            monthlyStats: [],
          });
          setLoading(false);
          return;
        }

        // For students, only show their own registrations
        if (userType === "student" && userData?.email) {
          registrationsQuery = query(
            collection(db, "registrations"),
            where("attendeeEmail", "==", userData.email)
          );
        } else {
          // For organizers, show all registrations for their events
          registrationsQuery = collection(db, "registrations");
        }

        // Set up real-time listener for registrations
        if (registrationsUnsubscribe) {
          registrationsUnsubscribe();
        }

        registrationsUnsubscribe = onSnapshot(registrationsQuery, (registrationsSnapshot) => {
          console.log("=== REPORTS REGISTRATIONS UPDATE ===");
          console.log("Received", registrationsSnapshot.size, "registrations for reports");

          const allRegistrationsData = registrationsSnapshot.docs.map((doc) => doc.data());
          
          // Filter registrations to only include those for our events
          const filteredRegistrationsData = allRegistrationsData.filter(reg => 
            eventIds.includes(reg.eventId)
          );

          console.log("Filtered registrations:", filteredRegistrationsData.length);

          // Calculate metrics
          const totalEvents = eventsData.length;
          const totalAttendees = filteredRegistrationsData.length;
          const now = new Date();

          const upcomingEvents = eventsData.filter((event) => {
            if (!event.date) return false;
            try {
              const eventDate = new Date(event.date);
              return eventDate >= now;
            } catch {
              return false;
            }
          }).length;

          const newMetrics = {
            totalEvents,
            totalAttendees,
            averageAttendance:
              totalEvents > 0
                ? Math.round((totalAttendees / totalEvents) * 100) / 100
                : 0,
            upcomingEvents,
            popularCategories: calculatePopularCategories(eventsData),
            monthlyStats: calculateMonthlyStats(eventsData, filteredRegistrationsData),
          };

          console.log("Updated metrics:", newMetrics);
          setMetrics(newMetrics);
          setLoading(false);
        }, (error) => {
          console.error("Error in registrations listener:", error);
          setLoading(false);
        });

      }, (error) => {
        console.error("Error in events listener:", error);
        setLoading(false);
      });
    };

    setupRealTimeListeners();

    // Cleanup function
    return () => {
      console.log("Cleaning up Reports listeners");
      if (eventsUnsubscribe) eventsUnsubscribe();
      if (registrationsUnsubscribe) registrationsUnsubscribe();
    };
  }, [userType, userData?.userId, userData?.email]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {userType === "organizer" ? "My Event Analytics" : "Event Analytics"}
      </Text>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Calendar width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>{metrics.totalEvents}</Text>
          <Text style={styles.metricLabel}>
            {userType === "organizer" ? "My Events" : "Total Events"}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Users width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>{metrics.totalAttendees}</Text>
          <Text style={styles.metricLabel}>
            {userType === "organizer" ? "My Attendees" : "Total Attendees"}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <TrendingUp width={24} height={24} style={styles.metricIcon} />
          <Text style={styles.metricNumber}>{metrics.averageAttendance}</Text>
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
          <Text style={styles.emptyText}>
            {userType === "organizer" 
              ? "No events created yet" 
              : "No categories data available"
            }
          </Text>
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
            <Text style={styles.emptyText}>
              {userType === "organizer" 
                ? "No events data yet" 
                : "No monthly data available"
              }
            </Text>
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
    justifyContent: "center",
    alignItems: "center",
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