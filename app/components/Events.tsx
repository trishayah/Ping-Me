import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Edit,
  Plus,
} from "react-native-feather";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { firebaseApp } from "../../firebaseConfig";

const db = getFirestore(firebaseApp);

import { NavigationProp, useFocusEffect } from "@react-navigation/native";

// Define the EventData type
type EventData = {
  id: string;
  eventName: string;
  eventDescription: string;
  eventType: string;
  eventLocation: string;
  eventDate: string;
  eventTime: string;
  eventAttendees?: any[];
  eventImage?: { uri: string } | null;
  createdBy?: string; // Added to track who created the event
};

const Events = ({
  userType = "student",
  initialEvents = [],
  navigation,
  userData, // <-- make sure this is passed from the parent
}: {
  userType?: string;
  initialEvents?: any[];
  navigation: NavigationProp<any>;
  userData?: { 
    email: string; 
    firstName: string; 
    userId?: string; // Added userId to userData
  };
}) => {
  // Debug log for userType
  console.log("Events component userType:", userType);
  console.log("Events component userData:", userData);

  const [events, setEvents] = useState<EventData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [rsvpedEvents, setRsvpedEvents] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      let eventsQuery;
      
      // If user is an organizer, only fetch events they created
      if (userType === "organizer" && userData?.userId) {
        eventsQuery = query(
          collection(db, "events"),
          where("createdBy", "==", userData.userId)
        );
        console.log("Fetching events for organizer:", userData.userId);
      } else {
        // For students or when no userId, fetch all events
        eventsQuery = collection(db, "events");
        console.log("Fetching all events for student");
      }

      const querySnapshot = await getDocs(eventsQuery);
      const fetchedEvents: EventData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Event data:", data); // Debug log
        fetchedEvents.push({
          id: doc.id,
          eventName: data.name || "",
          eventDescription: data.description || "",
          eventType: data.category || "general", // Provide default value
          eventLocation: data.location || "",
          eventDate: data.date || "",
          eventTime: data.time || "",
          eventAttendees: data.attendees ? [data.attendees] : [],
          eventImage: data.image ? { uri: data.image } : null,
          createdBy: data.createdBy || "", // Include createdBy field
        });
      });
      
      setEvents(fetchedEvents);
      console.log(`Fetched ${fetchedEvents.length} events for ${userType}`);
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Error", "Failed to fetch events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userType, userData?.userId]);

  // Use useFocusEffect to refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  interface HandleRSVP {
    (eventId: string): void;
  }

  // Get user info from navigation params, props, or context
  const userEmail = userData?.email || "";
  const userName = userData?.firstName || "";

  const handleRSVP: HandleRSVP = async (eventId) => {
    if (rsvpedEvents.includes(eventId)) {
      setRsvpedEvents(rsvpedEvents.filter((id) => id !== eventId));
      // Optionally: remove RSVP from Firestore here if needed
    } else {
      setRsvpedEvents([...rsvpedEvents, eventId]);
      Alert.alert(
        "Success",
        "You have successfully registered for this event!"
      );

      // Store RSVP in Firestore (registrations collection)
      try {
        const event = events.find((ev) => ev.id === eventId);
        if (!event) return;

        await addDoc(collection(db, "registrations"), {
          eventId: event.id,
          eventName: event.eventName,
          attendeeEmail: userEmail, // <-- store the student's email
          attendeeName: userName, // <-- store the student's name
          registrationDate: new Date().toISOString(),
          status: "confirmed",
        });

        // Optionally update event's attendees count in Firestore
        const eventDocRef = doc(db, "events", event.id);
        let newAttendees = 1;
        if (Array.isArray(event.eventAttendees)) {
          newAttendees = event.eventAttendees.length + 1;
        } else if (typeof event.eventAttendees === "number") {
          newAttendees = event.eventAttendees + 1;
        }
        await updateDoc(eventDocRef, {
          attendees: newAttendees,
        });

        await fetchEvents(); // Refresh events after RSVP
      } catch (e) {
        console.error("Failed to save RSVP to Firestore:", e);
      }
    }
  };

  interface FormatDate {
    (dateString: string): string;
  }

  const formatDate: FormatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  interface FormatDetailedDate {
    (dateString: string): string;
  }

  const formatDetailedDate: FormatDetailedDate = (dateString) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  interface EventTypeBadgeStyle {
    backgroundColor: string;
    color: string;
  }

  interface GetEventTypeBadgeStyle {
    (type: string): EventTypeBadgeStyle;
  }

  const getEventTypeBadgeStyle: GetEventTypeBadgeStyle = (type) => {
    // Add null/undefined check
    if (!type) {
      return { backgroundColor: "#e2e8f0", color: "#334155" };
    }

    const eventType = (type || "").toLowerCase();
    switch (eventType) {
      case "hackathon":
        return { backgroundColor: "#f3e8ff", color: "#6b21a8" };
      case "workshop":
        return { backgroundColor: "#dcfce7", color: "#166534" };
      case "seminar":
      case "webinar":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "conference":
        return { backgroundColor: "#fef9c3", color: "#854d0e" };
      default:
        return { backgroundColor: "#e2e8f0", color: "#334155" };
    }
  };

  const EventDetails = ({
    event,
    onBack,
    onRSVP,
    isAttending,
    userType,
    formatDate,
    getEventTypeBadgeStyle,
    refreshEvents, // new prop
  }: {
    event: EventData;
    onBack: () => void;
    onRSVP: (eventId: string) => void;
    isAttending: boolean;
    userType: string;
    formatDate: (dateString: string) => string;
    getEventTypeBadgeStyle: (type: string) => { backgroundColor: string; color: string };
    refreshEvents?: () => void;
  }) => {
    // Use the getEventTypeBadgeStyle function with null check
    const getEventTypeBadgeStyleSafe = (type: string) => {
      if (!type) {
        return { backgroundColor: "#e2e8f0", color: "#334155" };
      }

      switch (type.toLowerCase()) {
        case "hackathon":
          return { backgroundColor: "#f3e8ff", color: "#6b21a8" };
        case "workshop":
          return { backgroundColor: "#dcfce7", color: "#166534" };
        case "seminar":
        case "webinar":
          return { backgroundColor: "#dbeafe", color: "#1e40af" };
        case "conference":
          return { backgroundColor: "#fef9c3", color: "#854d0e" };
        default:
          return { backgroundColor: "#e2e8f0", color: "#334155" };
      }
    };

    const badgeStyle = getEventTypeBadgeStyleSafe(event.eventType);

    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({
      eventName: event.eventName,
      eventDescription: event.eventDescription,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      eventLocation: event.eventLocation,
      eventType: event.eventType,
    });
    const [editLoading, setEditLoading] = useState(false);

    const handleEditChange = (field:any, value:any) => {
      setEditData({ ...editData, [field]: value });
    };

    const handleSaveEdit = async () => {
      setEditLoading(true);
      try {
        const eventRef = doc(db, "events", event.id);
        await updateDoc(eventRef, {
          name: editData.eventName,
          description: editData.eventDescription,
          date: editData.eventDate,
          time: editData.eventTime,
          location: editData.eventLocation,
          category: editData.eventType,
        });
        setEditMode(false);
        if (refreshEvents) refreshEvents();
        Alert.alert("Success", "Event updated successfully!");
      } catch (e) {
        console.error("Failed to update event:", e);
        Alert.alert("Error", "Failed to update event. Please try again.");
      }
      setEditLoading(false);
    };

    const handleDelete = async () => {
      Alert.alert(
        "Delete Event",
        "Are you sure you want to delete this event?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setEditLoading(true);
              try {
                await deleteDoc(doc(db, "events", event.id));
                if (refreshEvents) refreshEvents();
                onBack();
                Alert.alert("Success", "Event deleted successfully!");
              } catch (e) {
                console.error("Failed to delete event:", e);
                Alert.alert("Error", "Failed to delete event. Please try again.");
              }
              setEditLoading(false);
            },
          },
        ]
      );
    };

    // Check if current user can edit this event (only if they created it)
    const canEditEvent = userType === "organizer" && 
                        event.createdBy === userData?.userId;

    const detailsContent = (
      <View style={styles.detailsContent}>
        <View style={styles.detailsActionRow}>
          <View style={styles.attendingContainer}>
            <Users width={18} height={18} style={styles.actionIcon} />
            <Text style={styles.attendingCount}>
              {event.eventAttendees ? event.eventAttendees.length : 0} attending
            </Text>
          </View>
          {userType === "student" ? (
            <TouchableOpacity
              style={[
                styles.rsvpButton,
                isAttending && styles.rsvpButtonActive,
              ]}
              onPress={() => onRSVP(event.id)}
            >
              <Text
                style={[
                  styles.rsvpButtonText,
                  isAttending && styles.rsvpButtonTextActive,
                ]}
              >
                {isAttending ? "Attending" : "RSVP"}
              </Text>
            </TouchableOpacity>
          ) : canEditEvent ? (
            <View style={{ flexDirection: "row" }}>
              {editMode ? (
                <>
                  <TouchableOpacity
                    style={[styles.editButton, { marginRight: 8 }]}
                    onPress={handleSaveEdit}
                    disabled={editLoading}
                  >
                    <Text style={styles.editButtonText}>
                      {editLoading ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.editButton,
                      { backgroundColor: "#64748b", borderColor: "#64748b" },
                    ]}
                    onPress={() => setEditMode(false)}
                    disabled={editLoading}
                  >
                    <Text style={styles.editButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditMode(true)}
                  >
                    <Edit width={16} height={16} style={styles.editIcon} />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.editButton,
                      {
                        backgroundColor: "#dc2626",
                        borderColor: "#dc2626",
                        marginLeft: 8,
                      },
                    ]}
                    onPress={handleDelete}
                  >
                    <Text style={styles.editButtonText}>Delete</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Calendar
              width={18}
              height={18}
              style={styles.actionIcon}
              color="#2563eb"
            />
            <View>
              {editMode ? (
                <>
                  <TextInput
                    style={styles.detailPrimary}
                    value={editData.eventDate}
                    onChangeText={(v) => handleEditChange("eventDate", v)}
                    editable={!editLoading}
                    placeholder="YYYY-MM-DD"
                  />
                  <TextInput
                    style={styles.detailSecondary}
                    value={editData.eventTime}
                    onChangeText={(v) => handleEditChange("eventTime", v)}
                    editable={!editLoading}
                    placeholder="Time"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.detailPrimary}>
                    {formatDate(event.eventDate)}
                  </Text>
                  <Text style={styles.detailSecondary}>
                    {event.eventTime || "Time TBD"}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.detailRow}>
            <MapPin
              width={18}
              height={18}
              style={styles.actionIcon}
              color="#2563eb"
            />
            <View>
              {editMode ? (
                <TextInput
                  style={styles.detailPrimary}
                  value={editData.eventLocation}
                  onChangeText={(v) => handleEditChange("eventLocation", v)}
                  editable={!editLoading}
                  placeholder="Location"
                />
              ) : (
                <Text style={styles.detailPrimary}>
                  {event.eventLocation || "Location TBD"}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailPrimary, { marginRight: 8 }]}>
              Type:
            </Text>
            {editMode ? (
              <TextInput
                style={styles.detailPrimary}
                value={editData.eventType}
                onChangeText={(v) => handleEditChange("eventType", v)}
                editable={!editLoading}
                placeholder="Type"
              />
            ) : (
              <Text style={styles.detailPrimary}>
                {event.eventType || "General"}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>About this event</Text>
          {editMode ? (
            <TextInput
              style={[
                styles.sectionText,
                {
                  minHeight: 60,
                  backgroundColor: "#f1f5f9",
                  borderRadius: 4,
                  padding: 8,
                },
              ]}
              value={editData.eventDescription}
              onChangeText={(v) => handleEditChange("eventDescription", v)}
              editable={!editLoading}
              multiline
            />
          ) : (
            <Text style={styles.sectionText}>
              {event.eventDescription || "No description available"}
            </Text>
          )}
        </View>
      </View>
    );

    return (
      <ScrollView style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          {event.eventImage && (
            <Image
              source={event.eventImage}
              style={styles.detailsImage}
              resizeMode="cover"
              onError={(error) =>
                console.log("Details image load error:", error)
              }
              onLoad={() => console.log("Details image loaded successfully")}
            />
          )}
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft width={20} height={20} color={styles.backIcon.color} />
          </TouchableOpacity>
          <View style={styles.detailsHeaderContent}>
            <View
              style={[
                styles.eventTypeBadge,
                styles.detailsBadge,
                { backgroundColor: badgeStyle.backgroundColor },
              ]}
            >
              <Text style={[styles.eventTypeText, { color: badgeStyle.color }]}>
                {event.eventType || "General"}
              </Text>
            </View>
            {editMode ? (
              <TextInput
                style={[
                  styles.detailsTitle,
                  {
                    color: "white",
                    backgroundColor: "#2226",
                    borderRadius: 4,
                    padding: 4,
                  },
                ]}
                value={editData.eventName}
                onChangeText={(v) => handleEditChange("eventName", v)}
                editable={!editLoading}
              />
            ) : (
              <Text style={styles.detailsTitle}>
                {event.eventName || "Untitled Event"}
              </Text>
            )}
          </View>
        </View>

        {detailsContent}
      </ScrollView>
    );
  };

  const filteredEvents = events.filter((event) => {
    // Add null checks for event properties
    const eventName = event.eventName || "";
    const eventDescription = event.eventDescription || "";
    const eventType = event.eventType || "";

    const matchesSearch =
      eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eventDescription.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "hackathons")
      return eventType.toLowerCase() === "hackathon" && matchesSearch;
    if (filter === "workshops")
      return eventType.toLowerCase() === "workshop" && matchesSearch;
    if (filter === "seminars")
      return (
        (eventType.toLowerCase() === "seminar" ||
          eventType.toLowerCase() === "webinar") &&
        matchesSearch
      );
    if (filter === "conferences")
      return eventType.toLowerCase() === "conference" && matchesSearch;
    return matchesSearch;
  });

  if (selectedEvent) {
    return (
      <EventDetails
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
        onRSVP={handleRSVP}
        isAttending={rsvpedEvents.includes(selectedEvent.id)}
        userType={userType}
        formatDate={formatDetailedDate}
        getEventTypeBadgeStyle={getEventTypeBadgeStyle}
        refreshEvents={fetchEvents}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Search width={18} height={18} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          {userType === "organizer" && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                console.log("Add button pressed");
                navigation.navigate("AddEvent", { userData });
              }}
            >
              <Plus width={22} height={22} color={styles.addIcon.color} />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "all" && styles.activeFilter,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.activeFilterText,
              ]}
            >
              All Events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "hackathons" && styles.activeFilter,
            ]}
            onPress={() => setFilter("hackathons")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "hackathons" && styles.activeFilterText,
              ]}
            >
              Hackathons
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "workshops" && styles.activeFilter,
            ]}
            onPress={() => setFilter("workshops")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "workshops" && styles.activeFilterText,
              ]}
            >
              Workshops
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "seminars" && styles.activeFilter,
            ]}
            onPress={() => setFilter("seminars")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "seminars" && styles.activeFilterText,
              ]}
            >
              Seminars
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "conferences" && styles.activeFilter,
            ]}
            onPress={() => setFilter("conferences")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "conferences" && styles.activeFilterText,
              ]}
            >
              Conferences
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : filteredEvents.length > 0 ? (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => setSelectedEvent(item)}
              isAttending={rsvpedEvents.includes(item.id)}
              formatDate={formatDate}
              getEventTypeBadgeStyle={getEventTypeBadgeStyle}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Filter width={48} height={48} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>
            {userType === "organizer" 
              ? "No events created by you yet. Tap the + button to create your first event!" 
              : "No events found matching your criteria"
            }
          </Text>
          {userType === "organizer" && (
            <TouchableOpacity
              style={styles.createFirstEventButton}
              onPress={() => navigation.navigate("AddEvent")}
            >
              <Plus width={20} height={20} color="#fff" />
              <Text style={styles.createFirstEventText}>Create Your First Event</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

// Rest of the component remains the same...
type EventCardProps = {
  event: EventData;
  onPress: () => void;
  isAttending: boolean;
  formatDate: (dateString: string) => string;
  getEventTypeBadgeStyle: (type: string) => {
    backgroundColor: string;
    color: string;
  };
};

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  isAttending,
  formatDate,
  getEventTypeBadgeStyle,
}) => {
  const badgeStyle = getEventTypeBadgeStyle(event.eventType);

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      {event.eventImage && (
        <Image
          source={event.eventImage}
          style={styles.cardImage}
          resizeMode="cover"
          onError={(error) => console.log("Image load error:", error)}
          onLoad={() => console.log("Image loaded successfully")}
        />
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.eventTypeBadge,
              { backgroundColor: badgeStyle.backgroundColor },
            ]}
          >
            <Text style={[styles.eventTypeText, { color: badgeStyle.color }]}>
              {event.eventType || "General"}
            </Text>
          </View>
          {isAttending && (
            <View style={styles.attendingBadge}>
              <Text style={styles.attendingText}>Going</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle}>
          {event.eventName || "Untitled Event"}
        </Text>

        <View style={styles.cardDetailRow}>
          <Calendar width={14} height={14} style={styles.detailIcon} />
          <Text style={styles.cardDetailText}>
            {formatDate(event.eventDate)}
          </Text>
          <Clock
            width={14}
            height={14}
            style={[styles.detailIcon, styles.clockIcon]}
          />
          <Text style={styles.cardDetailText}>
            {event.eventTime || "Time TBD"}
          </Text>
        </View>

        <View style={styles.cardDetailRow}>
          <MapPin width={14} height={14} style={styles.detailIcon} />
          <Text style={styles.cardDetailText}>
            {event.eventLocation || "Location TBD"}
          </Text>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {event.eventDescription || "No description available"}
        </Text>

        <View style={styles.cardDetailRow}>
          <Users width={14} height={14} style={styles.detailIcon} />
          <Text style={styles.cardDetailText}>
            {event.eventAttendees ? event.eventAttendees.length : 0} attending
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    flex: 1,
  },
  searchIcon: {
    color: "#94a3b8",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#334155",
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#1e40af",
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  addIcon: {
    color: "#fff",
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: "#2563eb",
  },
  filterText: {
    fontSize: 14,
    color: "#475569",
  },
  activeFilterText: {
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    color: "#64748b",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    color: "#94a3b8",
    marginBottom: 16,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  createFirstEventButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e40af",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  createFirstEventText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  attendingBadge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attendingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  cardDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailIcon: {
    color: "#64748b",
    marginRight: 4,
  },
  clockIcon: {
    marginLeft: 12,
  },
  cardDetailText: {
    fontSize: 13,
    color: "#64748b",
  },
  cardDescription: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  detailsHeader: {
    height: 200,
    width: "100%",
  },
  detailsImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  backIcon: {
    color: "#1e293b",
  },
  detailsHeaderContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  detailsBadge: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  detailsContent: {
    padding: 16,
  },
  detailsActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  attendingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    color: "#64748b",
    marginRight: 8,
  },
  attendingCount: {
    color: "#334155",
    fontSize: 14,
  },
  rsvpButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22c55e",
    backgroundColor: "#fff",
  },
  rsvpButtonActive: {
    backgroundColor: "#22c55e",
  },
  rsvpButtonText: {
    color: "#22c55e",
    fontWeight: "500",
  },
  rsvpButtonTextActive: {
    color: "#fff",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e40af",
    backgroundColor: "#1e40af",
    elevation: 2,
  },
  editIcon: {
    color: "#fff",
    marginRight: 8,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailPrimary: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  detailSecondary: {
    fontSize: 14,
    color: "#64748b",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
});

export default Events;