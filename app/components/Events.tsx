import React, { useState } from "react";
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

const Events = ({ userType = "student", initialEvents = [], navigation }) => {
  const [events] = useState(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpedEvents, setRsvpedEvents] = useState([]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventDescription.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "hackathons")
      return event.eventType === "hackathon" && matchesSearch;
    if (filter === "workshops")
      return event.eventType === "workshop" && matchesSearch;
    if (filter === "seminars")
      return (
        (event.eventType === "seminar" || event.eventType === "webinar") && matchesSearch
      );
    if (filter === "conferences")
      return event.eventType === "conference" && matchesSearch;
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDetailedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEventTypeBadgeStyle = (type) => {
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


  if (selectedEvent) {
    return (
      <EventDetails
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
        onRSVP={handleRSVP}
        isAttending={rsvpedEvents.includes(selectedEvent.id)}
        userType={userType}
        formatDate={formatDetailedDate}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search width={18} height={18} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
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

      {userType !== "student" && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('AddEvent')}
        >
          <Plus width={24} height={24} style={styles.fabIcon} />
        </TouchableOpacity>
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

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      {event.eventImage && (
        <Image 
          source={event.eventImage} 
          style={styles.cardImage} 
          resizeMode="cover"
        />
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.eventTypeBadge, { backgroundColor: badgeStyle.backgroundColor }]}>
            <Text style={[styles.eventTypeText, { color: badgeStyle.color }]}>
              {event.eventType}
            </Text>
          </View>
          {isAttending && (
            <View style={styles.attendingBadge}>
              <Text style={styles.attendingText}>Going</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle}>{event.eventName}</Text>

        <View style={styles.cardDetailRow}>
          <Calendar width={14} height={14} style={styles.detailIcon} />
          <Text style={styles.cardDetailText}>{formatDate(event.eventDate)}</Text>
          <Clock
            width={14}
            height={14}
            style={[styles.detailIcon, styles.clockIcon]}
          />
          <Text style={styles.cardDetailText}>{event.eventTime}</Text>
        </View>

        <View style={styles.cardDetailRow}>
          <MapPin width={14} height={14} style={styles.detailIcon} />
          <Text style={styles.cardDetailText}>{event.eventLocation}</Text>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {event.eventDescription}
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
          />
        )}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft width={20} height={20} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.detailsHeaderContent}>
          <View style={[styles.eventTypeBadge, styles.detailsBadge, { backgroundColor: badgeStyle.backgroundColor }]}>
            <Text style={[styles.eventTypeText, { color: badgeStyle.color }]}>
              {event.eventType}
            </Text>
          </View>
          <Text style={styles.detailsTitle}>{event.eventName}</Text>
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
          ) : (
            <TouchableOpacity style={styles.editButton}>
              <Edit width={16} height={16} style={styles.editIcon} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Calendar
              width={18}
              height={18}
              style={[styles.actionIcon, styles.blueIcon]}
            />
            <View>
              <Text style={styles.detailPrimary}>{formatDate(event.eventDate)}</Text>
              <Text style={styles.detailSecondary}>{event.eventTime}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MapPin
              width={18}
              height={18}
              style={[styles.actionIcon, styles.blueIcon]}
            />
            <View>
              <Text style={styles.detailPrimary}>{event.eventLocation}</Text>
              {event.eventAddress && (
                <Text style={styles.detailSecondary}>{event.eventAddress}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>About this event</Text>
          <Text style={styles.sectionText}>{event.eventDescription}</Text>
        </View>

        {event.eventAgenda && (
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            <View style={styles.agendaContainer}>
              {event.eventAgenda.map((item, index) => (
                <View key={index} style={styles.agendaItem}>
                  <Text style={styles.agendaTime}>{item.time}:</Text>
                  <Text style={styles.agendaActivity}>{item.activity}</Text>
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
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    marginBottom: 12,
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
    borderColor: "#2563eb",
    backgroundColor: "white",
  },
  rsvpButtonActive: {
    backgroundColor: "#2563eb",
  },
  rsvpButtonText: {
    color: "#2563eb",
    fontWeight: "500",
  },
  rsvpButtonTextActive: {
    color: "white",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#64748b",
    backgroundColor: "white",
  },
  editIcon: {
    color: "#64748b",
    marginRight: 8,
  },
  editButtonText: {
    color: "#334155",
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    color: 'white',
  },
});

export default Events;