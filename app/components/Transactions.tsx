import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Calendar, Users, User, AlertTriangle } from "react-native-feather";
import {
  collection,
  query,
  onSnapshot,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { firebaseApp, db } from "../../firebaseConfig";

type Registration = {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  eventId: string;
  eventName: string;
  registrationDate: string | number | Date;
  status: "confirmed" | "pending" | "cancelled" | "no-show";
};

type Event = {
  id: string;
  eventName: string;
  attendees: number; // max capacity
  registrations: Registration[];
  createdBy?: string; // Added to track event creator
  isDeleted?: boolean; // Track if event is deleted
  deletedAt?: string; // When it was deleted
  deletedBy?: string; // Who deleted it
};

const Transactions = ({ 
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
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  useEffect(() => {
    console.log("=== TRANSACTIONS REAL-TIME SETUP ===");
    console.log("userType:", userType);
    console.log("userId:", userData?.userId);
    console.log("email:", userData?.email);

    let eventsUnsubscribe: (() => void) | null = null;
    let registrationsUnsubscribes: (() => void)[] = [];

    const setupRealTimeListeners = () => {
      let eventsQuery;
      
      // Apply filtering based on user type - but now include deleted events for transaction history
      if (userType === "organizer" && userData?.userId) {
        console.log("Setting up real-time listener for organizer events (including deleted)");
        eventsQuery = query(
          collection(db, "events"),
          where("createdBy", "==", userData.userId)
        );
      } else {
        console.log("Setting up real-time listener for all events (including deleted)");
        eventsQuery = collection(db, "events");
      }

      // Set up real-time listener for events
      eventsUnsubscribe = onSnapshot(eventsQuery, (eventsSnapshot) => {
        console.log("=== EVENTS UPDATE IN TRANSACTIONS ===");
        console.log("Received", eventsSnapshot.size, "events");

        // Clear previous registration listeners
        registrationsUnsubscribes.forEach(unsub => unsub());
        registrationsUnsubscribes = [];

        const eventsData: Event[] = [];
        let processedEvents = 0;

        if (eventsSnapshot.empty) {
          console.log("No events found");
          setEvents([]);
          return;
        }

        eventsSnapshot.docs.forEach((docSnap) => {
          const eventData = docSnap.data();
          console.log("Processing event:", docSnap.id, eventData.name || eventData.eventName, "Deleted:", eventData.isDeleted);
          
          let registrationsQuery;
          
          // For students, only show their own registrations
          if (userType === "student" && userData?.email) {
            registrationsQuery = query(
              collection(db, "registrations"),
              where("eventId", "==", docSnap.id),
              where("attendeeEmail", "==", userData.email)
            );
          } else {
            // For organizers, show all registrations for their events
            registrationsQuery = query(
              collection(db, "registrations"),
              where("eventId", "==", docSnap.id)
            );
          }

          // Set up real-time listener for registrations of this event
          const registrationsUnsub = onSnapshot(registrationsQuery, (registrationsSnapshot) => {
            console.log(`Registrations update for event ${docSnap.id}:`, registrationsSnapshot.size, "registrations");
            
            const registrations: Registration[] = registrationsSnapshot.docs.map(
              (regDoc) => {
                const regData = regDoc.data();
                return {
                  id: regDoc.id,
                  attendeeName: regData.attendeeName || "",
                  attendeeEmail: regData.attendeeEmail || "",
                  eventId: regData.eventId,
                  eventName: regData.eventName,
                  registrationDate: regData.registrationDate,
                  status: regData.status,
                };
              }
            );

            // Only include events that have registrations for students
            if (userType === "student" && registrations.length === 0) {
              // Remove this event from the list if student has no registrations
              setEvents(prevEvents => prevEvents.filter(e => e.id !== docSnap.id));
              return;
            }

            const eventItem: Event = {
              id: docSnap.id,
              eventName: eventData.eventName || eventData.name || "",
              attendees: eventData.attendees || 0,
              registrations,
              createdBy: eventData.createdBy || "",
              isDeleted: eventData.isDeleted || false, // Include deletion status
              deletedAt: eventData.deletedAt || null, // Include deletion timestamp
              deletedBy: eventData.deletedBy || null, // Include who deleted it
            };

            // Update or add this event in the events array
            setEvents(prevEvents => {
              const existingIndex = prevEvents.findIndex(e => e.id === docSnap.id);
              if (existingIndex >= 0) {
                // Update existing event
                const newEvents = [...prevEvents];
                newEvents[existingIndex] = eventItem;
                return newEvents;
              } else {
                // Add new event
                return [...prevEvents, eventItem];
              }
            });

            console.log(`Event ${docSnap.id} updated with ${registrations.length} registrations`);
          }, (error) => {
            console.error(`Error in registrations listener for event ${docSnap.id}:`, error);
          });

          registrationsUnsubscribes.push(registrationsUnsub);
        });

        console.log("Set up listeners for", eventsSnapshot.size, "events");
      }, (error) => {
        console.error("Error in events listener:", error);
        setEvents([]);
      });
    };

    setupRealTimeListeners();

    // Cleanup function
    return () => {
      console.log("Cleaning up Transactions listeners");
      if (eventsUnsubscribe) eventsUnsubscribe();
      registrationsUnsubscribes.forEach(unsub => unsub());
    };
  }, [userType, userData?.userId, userData?.email]);

  // Helper function to format deletion date
  const formatDeletionDate = (deletedAt: string) => {
    try {
      const date = new Date(deletedAt);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  const renderEventOverview = ({ item }: { item: Event }) => {
    const totalRegistrations = item.registrations.length;
    const availableSpots = item.attendees - totalRegistrations;
    const confirmedRegistrations = item.registrations.filter(
      (r) => r.status === "confirmed"
    ).length;

    return (
      <TouchableOpacity
        style={[
          styles.eventCard,
          item.isDeleted && styles.deletedEventCard, // Add special styling for deleted events
        ]}
        onPress={() =>
          setSelectedEvent(selectedEvent === item.id ? null : item.id)
        }
      >
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleContainer}>
            <Text style={[
              styles.eventName,
              item.isDeleted && styles.deletedEventName
            ]}>
              {item.eventName}
            </Text>
            {item.isDeleted && (
              <View style={styles.deletedBadge}>
                <AlertTriangle width={12} height={12} style={styles.deletedIcon} />
                <Text style={styles.deletedText}>DELETED</Text>
              </View>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              { 
                backgroundColor: item.isDeleted 
                  ? "#fee2e2" 
                  : availableSpots > 0 
                    ? "#dcfce7" 
                    : "#fee2e2" 
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { 
                  color: item.isDeleted 
                    ? "#991b1b" 
                    : availableSpots > 0 
                      ? "#166534" 
                      : "#991b1b" 
                },
              ]}
            >
              {item.isDeleted ? "Deleted" : availableSpots > 0 ? "Open" : "Full"}
            </Text>
          </View>
        </View>

        {item.isDeleted && (
          <View style={styles.deletionInfo}>
            <Text style={styles.deletionText}>
              Event deleted on {formatDeletionDate(item.deletedAt || "")}
            </Text>
          </View>
        )}

        <View style={styles.overviewStats}>
          <View style={styles.stat}>
            <Users width={16} height={16} style={styles.icon} />
            <Text style={styles.statText}>
              {userType === "student" 
                ? `${totalRegistrations} registration${totalRegistrations !== 1 ? 's' : ''}`
                : `${totalRegistrations}/${item.attendees} Registered`
              }
            </Text>
          </View>
          {userType === "organizer" && !item.isDeleted && (
            <View style={styles.stat}>
              <Text style={styles.statText}>
                {availableSpots} spots remaining
              </Text>
            </View>
          )}
        </View>

        {selectedEvent === item.id && (
          <View style={styles.registrationsList}>
            <Text style={styles.registrationsTitle}>
              {userType === "student" ? "My Registrations:" : "Attendees:"}
            </Text>
            {item.registrations.length === 0 ? (
              <Text style={styles.noRegistrations}>
                {userType === "student" 
                  ? "No registrations found" 
                  : "No registrations yet"
                }
              </Text>
            ) : (
              item.registrations.map((registration) => (
                <View key={registration.id} style={styles.registrationItem}>
                  <View style={styles.registrationInfo}>
                    <Text style={styles.attendeeName}>
                      {registration.attendeeName}
                    </Text>
                    <Text style={styles.attendeeEmail}>
                      {registration.attendeeEmail}
                    </Text>
                    <View style={styles.registrationHeader}>
                      <View
                        style={[
                          styles.statusBadge,
                          styles.smallBadge,
                          { backgroundColor: getStatusColor(registration.status) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            styles.smallStatusText,
                            { color: getStatusTextColor(registration.status) },
                          ]}
                        >
                          {registration.status}
                        </Text>
                      </View>
                      {item.isDeleted && (
                        <Text style={styles.historicalNote}>
                          (Historical Record)
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#dcfce7";
      case "pending":
        return "#fef3c7";
      case "cancelled":
        return "#fee2e2";
      case "no-show":
        return "#f3f4f6";
      default:
        return "#f3f4f6";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#166534";
      case "pending":
        return "#92400e";
      case "cancelled":
        return "#991b1b";
      case "no-show":
        return "#4b5563";
      default:
        return "#4b5563";
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEventOverview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {userType === "student" 
                ? "You haven't registered for any events yet" 
                : "No events created by you yet"
              }
            </Text>
          </View>
        }
      />
    </View>
  );
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
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
    textAlign: "center",
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deletedEventCard: {
    backgroundColor: "#fef9f9", // Light red background for deleted events
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626", // Red left border
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  deletedEventName: {
    color: "#64748b", // Muted color for deleted events
    textDecorationLine: "line-through",
  },
  deletedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  deletedIcon: {
    color: "#dc2626",
    marginRight: 4,
  },
  deletedText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#dc2626",
  },
  deletionInfo: {
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#f87171",
  },
  deletionText: {
    fontSize: 12,
    color: "#991b1b",
    fontStyle: "italic",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  smallStatusText: {
    fontSize: 10,
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    color: "#64748b",
    marginRight: 6,
  },
  smallIcon: {
    color: "#64748b",
    marginRight: 4,
  },
  statText: {
    color: "#64748b",
    fontSize: 14,
  },
  registrationsList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  registrationsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  noRegistrations: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
  registrationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  registrationInfo: {
    flex: 1,
  },
  registrationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  attendeeName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    flex: 1,
  },
  attendeeEmail: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  registrationDate: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#64748b",
  },
  historicalNote: {
    fontSize: 10,
    color: "#64748b",
    fontStyle: "italic",
  },
});

export default Transactions;