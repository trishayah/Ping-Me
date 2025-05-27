import { View, Button, Text, TextInput, StyleSheet, ScrollView } from "react-native";

export default function AddEvent() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Add New Event</Text>

            <Text style={styles.label}>Event Name</Text>
            <TextInput style={styles.input} placeholder="Event Name" />

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} placeholder="Event Description" multiline numberOfLines={3} />

            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} placeholder="Event Date" />

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} placeholder="Event Location" />

            <Text style={styles.label}>Attendees</Text>
            <TextInput style={styles.input} placeholder="Number of Attendees" keyboardType="numeric" />

            <View style={styles.buttonContainer}>
                <Button title="Save Event" onPress={() => alert("Event Saved!")} />
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
