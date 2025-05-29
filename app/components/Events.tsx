import React, { useState, useEffect } from "react";
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
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseApp } from "../../firebaseConfig";

const db = getFirestore(firebaseApp);

const Events = ({ userType = "student", initialEvents = [], navigation }) => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpedEvents, setRsvpedEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const fetchedEvents = [];
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
            eventAddress: data.address || "",
            eventAgenda: data.agenda || null,
            // add other fields as needed
          });
        });
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

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

  const handleRSVP = (eventId) => {
    if (rsvpedEvents.includes(eventId)) {
      setRsvpedEvents(rsvpedEvents.filter((id) => id !== eventId));
    } else {
      setRsvpedEvents([...rsvpedEvents, eventId]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDetailedDate = (dateString) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEventTypeBadgeStyle = (type) => {
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
              onPress={() => navigation.navigate("AddEvent")}
            >
              <Plus width={22} height={22} style={styles.addIcon} />
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

      {filteredEvents.length > 0 ? (
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
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Filter width={48} height={48} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>
            No events found matching your criteria
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const EventCard = ({
  event,
  onPress,
  isAttending,
  formatDate,
  getEventTypeBadgeStyle,
}) => {
  const badgeStyle = getEventTypeBadgeStyle(event.eventType);

  // Debug log for image
  console.log("Event image:", event.eventImage);

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

const EventDetails = ({
  event,
  onBack,
  onRSVP,
  isAttending,
  userType,
  formatDate,
  getEventTypeBadgeStyle,
}) => {
  const badgeStyle = getEventTypeBadgeStyle(event.eventType);

  return (
    <ScrollView style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        {event.eventImage && (
          <Image
            source={event.eventImage}
            style={styles.detailsImage}
            resizeMode="cover"
            onError={(error) => console.log("Details image load error:", error)}
            onLoad={() => console.log("Details image loaded successfully")}
          />
        )}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft width={20} height={20} style={styles.backIcon} />
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
          <Text style={styles.detailsTitle}>
            {event.eventName || "Untitled Event"}
          </Text>
        </View>
      </View>

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
          ) : userType === "organizer" ? (
            <TouchableOpacity style={styles.editButton}>
              <Edit width={16} height={16} style={styles.editIcon} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Calendar
              width={18}
              height={18}
              style={[styles.actionIcon, styles.blueIcon]}
            />
            <View>
              <Text style={styles.detailPrimary}>
                {formatDate(event.eventDate)}
              </Text>
              <Text style={styles.detailSecondary}>
                {event.eventTime || "Time TBD"}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MapPin
              width={18}
              height={18}
              style={[styles.actionIcon, styles.blueIcon]}
            />
            <View>
              <Text style={styles.detailPrimary}>
                {event.eventLocation || "Location TBD"}
              </Text>
              {event.eventAddress && (
                <Text style={styles.detailSecondary}>{event.eventAddress}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>About this event</Text>
          <Text style={styles.sectionText}>
            {event.eventDescription || "No description available"}
          </Text>
        </View>

        {event.eventAgenda && event.eventAgenda.length > 0 && (
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            <View style={styles.agendaContainer}>
              {event.eventAgenda.map((item, index) => (
                <View key={index} style={styles.agendaItem}>
                  <Text style={styles.agendaTime}>{item.time || "TBD"}:</Text>
                  <Text style={styles.agendaActivity}>
                    {item.activity || "Activity"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
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
    backgroundColor: "#1e40af", // More vibrant blue
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
    color: "#fff", // White icon for contrast
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
  defaultBadge: {
    backgroundColor: "#e2e8f0",
  },
  hackathonBadge: {
    backgroundColor: "#f3e8ff",
  },
  workshopBadge: {
    backgroundColor: "#dcfce7",
  },
  seminarBadge: {
    backgroundColor: "#dbeafe",
  },
  conferenceBadge: {
    backgroundColor: "#fef9c3",
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  defaultBadgeText: {
    color: "#334155",
  },
  hackathonBadgeText: {
    color: "#6b21a8",
  },
  workshopBadgeText: {
    color: "#166534",
  },
  seminarBadgeText: {
    color: "#1e40af",
  },
  conferenceBadgeText: {
    color: "#854d0e",
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
  blueIcon: {
    color: "#2563eb",
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
    borderColor: "#22c55e", // Green border
    backgroundColor: "#fff",
  },
  rsvpButtonActive: {
    backgroundColor: "#22c55e", // Green when active
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
    borderColor: "#1e40af", // Match addButton color
    backgroundColor: "#1e40af", // Vibrant blue
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
  agendaContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
  },
  agendaItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  agendaTime: {
    fontWeight: "500",
    color: "#1e293b",
    marginRight: 8,
    minWidth: 60,
  },
  agendaActivity: {
    color: "#334155",
    flex: 1,
  },
});

export default Events;
