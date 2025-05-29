import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Calendar, Users, User } from "react-native-feather";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { firebaseApp, db } from "../../firebaseConfig";

type Registration = {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  eventId: string;
  eventName: string;
  registrationDate: string | number | Date;
  status: 'confirmed' | 'pending' | 'cancelled' | 'no-show';
};

type Event = {
  id: string;
  eventName: string;
  attendees: number; // max capacity
  registrations: Registration[];
};

const Transactions = ({ userType = "organizer" }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  useEffect(() => {
    // Listen to events collection
    const eventsQuery = query(collection(db, "events"));
    const unsubscribeEvents = onSnapshot(eventsQuery, async (querySnapshot) => {
      const eventsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const eventData = { id: doc.id, ...doc.data() } as any;
          
          // Get registrations for this event
          const registrationsQuery = query(
            collection(db, "registrations"),
            where("eventId", "==", doc.id)
          );
          
          return new Promise<Event>((resolve) => {
            onSnapshot(registrationsQuery, (regSnapshot) => {
              const registrations = regSnapshot.docs.map((regDoc) => ({
                id: regDoc.id,
                ...regDoc.data(),
              })) as Registration[];
              
              resolve({
                id: eventData.id,
                eventName: eventData.eventName,
                attendees: eventData.attendees,
                registrations,
              });
            });
          });
        })
      );
      
      setEvents(eventsData);
    });

    return () => unsubscribeEvents();
  }, []);

  const renderEventOverview = ({ item }: { item: Event }) => {
    const totalRegistrations = item.registrations.length;
    const availableSpots = item.attendees - totalRegistrations;
    const confirmedRegistrations = item.registrations.filter(r => r.status === 'confirmed').length;

    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => setSelectedEvent(selectedEvent === item.id ? null : item.id)}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventName}>{item.eventName}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: availableSpots > 0 ? "#dcfce7" : "#fee2e2" }
          ]}>
            <Text style={[
              styles.statusText,
              { color: availableSpots > 0 ? "#166534" : "#991b1b" }
            ]}>
              {availableSpots > 0 ? "Open" : "Full"}
            </Text>
          </View>
        </View>

        <View style={styles.overviewStats}>
          <View style={styles.stat}>
            <Users width={16} height={16} style={styles.icon} />
            <Text style={styles.statText}>
              {totalRegistrations}/{item.attendees} Registered
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statText}>
              {availableSpots} spots remaining
            </Text>
          </View>
        </View>

        {selectedEvent === item.id && (
          <View style={styles.registrationsList}>
            <Text style={styles.registrationsTitle}>Registrations:</Text>
            {item.registrations.length === 0 ? (
              <Text style={styles.noRegistrations}>No registrations yet</Text>
            ) : (
              item.registrations.map((registration) => (
                <View key={registration.id} style={styles.registrationItem}>
                  <View style={styles.registrationInfo}>
                    <View style={styles.registrationHeader}>
                      <Text style={styles.attendeeName}>{registration.attendeeName}</Text>
                      <View style={[
                        styles.statusBadge,
                        styles.smallBadge,
                        { backgroundColor: getStatusColor(registration.status) }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          styles.smallStatusText,
                          { color: getStatusTextColor(registration.status) }
                        ]}>
                          {registration.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.attendeeEmail}>{registration.attendeeEmail}</Text>
                    <View style={styles.registrationDate}>
                      <Calendar width={14} height={14} style={styles.smallIcon} />
                      <Text style={styles.dateText}>
                        Registered: {new Date(registration.registrationDate).toLocaleDateString()}
                      </Text>
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
      case 'confirmed': return "#dcfce7";
      case 'pending': return "#fef3c7";
      case 'cancelled': return "#fee2e2";
      case 'no-show': return "#f3f4f6";
      default: return "#f3f4f6";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'confirmed': return "#166534";
      case 'pending': return "#92400e";
      case 'cancelled': return "#991b1b";
      case 'no-show': return "#4b5563";
      default: return "#4b5563";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration Transactions</Text>
      <FlatList
        data={events}
        renderItem={renderEventOverview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
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
    marginBottom: 4,
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
});

export default Transactions;