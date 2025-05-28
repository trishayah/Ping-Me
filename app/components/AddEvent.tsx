import React, { useState } from "react";
import { View, Button, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export default function AddEvent({ navigation }) {
    const [eventData, setEventData] = useState({
        eventName: "",
        eventDescription: "",
        eventDate: "",
        eventLocation: "",
        maxAttendees: "",
        eventType: "conference",
        status: "upcoming",
        createdAt: new Date(),
        attendees: [],
    });

    const handleSubmit = async () => {
        try {
            const docRef = await addDoc(collection(db, "events"), {
                ...eventData,
                maxAttendees: parseInt(eventData.maxAttendees) || 0,
            });

            navigation.goBack();
        } catch (error) {
            console.error("Error adding event: ", error);
            alert("Failed to create event");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Add New Event</Text>

            <Text style={styles.label}>Event Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Event Name"
                value={eventData.eventName}
                onChangeText={(text) => setEventData({ ...eventData, eventName: text })}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                placeholder="Event Description"
                multiline
                numberOfLines={3}
                value={eventData.eventDescription}
                onChangeText={(text) => setEventData({ ...eventData, eventDescription: text })}
            />

            <Text style={styles.label}>Date</Text>
            <TextInput
                style={styles.input}
                placeholder="Event Date"
                value={eventData.eventDate}
                onChangeText={(text) => setEventData({ ...eventData, eventDate: text })}
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
                style={styles.input}
                placeholder="Event Location"
                value={eventData.eventLocation}
                onChangeText={(text) => setEventData({ ...eventData, eventLocation: text })}
            />

            <Text style={styles.label}>Attendees</Text>
            <TextInput
                style={styles.input}
                placeholder="Number of Attendees"
                keyboardType="numeric"
                value={eventData.maxAttendees}
                onChangeText={(text) => setEventData({ ...eventData, maxAttendees: text })}
            />

            <View style={styles.buttonContainer}>
                <Button title="Save Event" onPress={handleSubmit} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#6200ee",
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 5,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    buttonContainer: {
        marginTop: 30,
    },
});
