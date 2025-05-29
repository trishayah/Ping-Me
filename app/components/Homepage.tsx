"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Users, PlusCircle, Star } from "react-native-feather"
import { getFirestore, collection, onSnapshot, query, where } from "firebase/firestore"
import { firebaseApp } from "../../firebaseConfig"

const db = getFirestore(firebaseApp)

type HomepageProps = {
  navigation: any
  route?: any
  userData?: {
    userType: "student" | "organizer"
    email: string
    firstName: string
    userName: string
    userId?: string
  }
}

const Homepage: React.FC<HomepageProps> = ({ navigation, route, userData }) => {
  const firstName = userData?.firstName || "User"
  const userType = userData?.userType || "student"
  const userId = userData?.userId
  const userEmail = userData?.email

  // State for Firestore data
  const [totalEvents, setTotalEvents] = useState(0)
  const [totalAttendees, setTotalAttendees] = useState(0)
  const [upcomingEvents, setUpcomingEvents] = useState(0)
  const [upcomingEventsList, setUpcomingEventsList] = useState<any[]>([])

  // For student RSVP events
  const [studentRSVPEvents, setStudentRSVPEvents] = useState<any[]>([])

  useEffect(() => {
    console.log("=== HOMEPAGE REAL-TIME SETUP ===")
    console.log("userType:", userType)
    console.log("userId:", userId)
    console.log("userData:", userData)

    let eventsUnsubscribe: (() => void) | null = null
    let registrationsUnsubscribe: (() => void) | null = null

    // Set up real-time listener for events
    const setupEventsListener = () => {
      let eventsQuery

      if (userType === "organizer" && userId) {
        console.log("Setting up real-time listener for organizer events with userId:", userId)
        eventsQuery = query(collection(db, "events"), where("createdBy", "==", userId))
      } else {
        console.log("Setting up real-time listener for all events")
        eventsQuery = collection(db, "events")
      }

      eventsUnsubscribe = onSnapshot(eventsQuery, (eventsSnapshot) => {
        console.log("=== EVENTS REAL-TIME UPDATE ===")
        console.log("Received", eventsSnapshot.size, "events")

        interface FirestoreEvent {
          id: string
          name?: string
          date?: string
          attendees?: number | any[]
          createdBy?: string
          [key: string]: any
        }
        const events: FirestoreEvent[] = []
        let attendeesSum = 0
        let upcoming = 0
        const now = new Date()

        eventsSnapshot.forEach((doc) => {
          const data = doc.data()
          console.log("Event:", doc.id, data)
          events.push({ id: doc.id, ...data })
          
          // Sum attendees (assume number or array)
          if (typeof data.attendees === "number") {
            attendeesSum += data.attendees
          } else if (Array.isArray(data.attendees)) {
            attendeesSum += data.attendees.length
          }
          
          // Count upcoming events
          if (data.date) {
            const eventDate = new Date(data.date)
            if (eventDate >= now) {
              upcoming += 1
            }
          }
        })

        setTotalEvents(events.length)
        setTotalAttendees(attendeesSum)
        setUpcomingEvents(upcoming)

        // For upcoming events list (sorted by date, next 5)
        const upcomingList = events
          .filter((ev) => ev.date && new Date(ev.date) >= now)
          .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
          .slice(0, 5)
        setUpcomingEventsList(upcomingList)

        console.log("Updated stats:")
        console.log("- Total events:", events.length)
        console.log("- Upcoming events:", upcoming)
        console.log("- Upcoming events list:", upcomingList.length)
        console.log("===============================")
      }, (error) => {
        console.error("Error in events listener:", error)
        setTotalEvents(0)
        setTotalAttendees(0)
        setUpcomingEvents(0)
        setUpcomingEventsList([])
      })
    }

    // Set up real-time listener for student RSVP events
    const setupStudentRSVPListener = () => {
      if (userType !== "student" || !userEmail) {
        setStudentRSVPEvents([])
        return
      }

      console.log("Setting up real-time listener for student RSVP events:", userEmail)
      
      registrationsUnsubscribe = onSnapshot(collection(db, "registrations"), (registrationsSnapshot) => {
        console.log("=== REGISTRATIONS REAL-TIME UPDATE ===")
        
        const myRegistrations = registrationsSnapshot.docs
          .map((doc) => doc.data())
          .filter((reg) => reg.attendeeEmail === userEmail)

        console.log("Found registrations:", myRegistrations.length)

        // Get eventIds
        const eventIds = myRegistrations.map((reg) => reg.eventId)

        if (eventIds.length === 0) {
          setStudentRSVPEvents([])
          return
        }

        // Set up listener for events that the student is registered for
        const eventsQuery = collection(db, "events")
        onSnapshot(eventsQuery, (eventsSnapshot) => {
          const myEvents = eventsSnapshot.docs
            .filter((doc) => eventIds.includes(doc.id))
            .map((doc) => ({ id: doc.id, ...doc.data() }))

          console.log("Student RSVP events updated:", myEvents.length)
          setStudentRSVPEvents(myEvents)
        })
      }, (error) => {
        console.error("Error in registrations listener:", error)
        setStudentRSVPEvents([])
      })
    }

    setupEventsListener()
    setupStudentRSVPListener()

    // Cleanup function
    return () => {
      console.log("Cleaning up Homepage listeners")
      if (eventsUnsubscribe) eventsUnsubscribe()
      if (registrationsUnsubscribe) registrationsUnsubscribe()
    }
  }, [userType, userId, userEmail])

  const renderOrganizerStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalEvents}</Text>
        <Text style={styles.statLabel}>My Events</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalAttendees}</Text>
        <Text style={styles.statLabel}>Total Attendees</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{upcomingEvents}</Text>
        <Text style={styles.statLabel}>Upcoming</Text>
      </View>
    </View>
  )

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      {userType === "organizer" ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("Events", { 
            screen: "AddEvent", 
            params: { userData } 
          })}
        >
          <PlusCircle width={24} height={24} style={styles.actionIcon} />
          <Text style={styles.actionText}>Create Event</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Events")}>
          <Star width={24} height={24} style={styles.actionIcon} />
          <Text style={styles.actionText}>Browse Events</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
        </View>
      </View>

      {userType === "organizer" && renderOrganizerStats()}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      {renderQuickActions()}

      <Text style={styles.sectionTitle}>{userType === "organizer" ? "My Upcoming Events" : "Upcoming Events"}</Text>
      <View style={styles.verticalEventsList}>
        {upcomingEventsList.length > 0 ? (
          upcomingEventsList.map((event) => {
            const eventDate = event.date ? new Date(event.date) : null
            const day = eventDate ? eventDate.getDate() : "--"
            const month = eventDate ? eventDate.toLocaleString("en-US", { month: "short" }).toUpperCase() : "--"
            const attendeesCount =
              typeof event.attendees === "number"
                ? event.attendees
                : Array.isArray(event.attendees)
                  ? event.attendees.length
                  : 0
            return (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <View style={styles.eventDateBadge}>
                  <Text style={styles.eventDateDay}>{day}</Text>
                  <Text style={styles.eventDateMonth}>{month}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{event.name || "Untitled"}</Text>
                  <View style={styles.eventDetailBelow}>
                    <Users width={14} height={14} style={styles.eventIcon} />
                    <Text style={styles.eventDetailText}>{attendeesCount} attending</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        ) : (
          <View style={[styles.eventCard, { justifyContent: "center", alignItems: "center" }]}>
            <Text style={{ color: "#64748b" }}>
              {userType === "organizer" ? "No upcoming events created by you" : "No upcoming events"}
            </Text>
          </View>
        )}
      </View>

      {/* Student RSVP Events */}
      {userType === "student" && (
        <>
          <Text style={styles.sectionTitle}>My Registered Events</Text>
          <View style={styles.verticalEventsList}>
            {studentRSVPEvents.length > 0 ? (
              studentRSVPEvents.map((event) => {
                const eventDate = event.date ? new Date(event.date) : null
                const day = eventDate ? eventDate.getDate() : "--"
                const month = eventDate ? eventDate.toLocaleString("en-US", { month: "short" }).toUpperCase() : "--"
                const attendeesCount =
                  typeof event.attendees === "number"
                    ? event.attendees
                    : Array.isArray(event.attendees)
                      ? event.attendees.length
                      : 0
                return (
                  <TouchableOpacity key={event.id} style={styles.eventCard}>
                    <View style={styles.eventDateBadge}>
                      <Text style={styles.eventDateDay}>{day}</Text>
                      <Text style={styles.eventDateMonth}>{month}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{event.name || "Untitled"}</Text>
                      <View style={styles.eventDetailBelow}>
                        <Users width={14} height={14} style={styles.eventIcon} />
                        <Text style={styles.eventDetailText}>{attendeesCount} attending</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })
            ) : (
              <View style={[styles.eventCard, { justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ color: "#64748b" }}>You have not registered for any events</Text>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  )
}

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
    marginBottom: 16,
    width: "100%",
    minHeight: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  eventDateBadge: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    minWidth: 48,
  },
  eventDateDay: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "center",
  },
  eventDateMonth: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventDetailBelow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  eventIcon: {
    color: "#64748b",
    marginRight: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: "#64748b",
  },
  verticalEventsList: {
    paddingHorizontal: 16,
    flexDirection: "column",
  },
})

export default Homepage