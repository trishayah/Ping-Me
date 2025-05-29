import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import TimePicker from "@/components/time-picker";
import DatePicker from "@/components/date-picker";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseApp } from "../../firebaseConfig";
import { ArrowLeft } from "react-native-feather";

const db = getFirestore(firebaseApp);

export default function AddEvent({ 
  navigation, 
  route 
}: { 
  navigation?: any;
  route?: any;
}) {
  // Get userData from route params
  const userData = route?.params?.userData;
  
  console.log("=== ADD EVENT COMPONENT ===");
  console.log("userData from route:", userData);
  console.log("userId:", userData?.userId);

  const [image, setImage] = useState<string | null>(null);
  const [eventTime, setEventTime] = useState<Date | undefined>(undefined);
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [attendees, setAttendees] = useState("");

  const pickImage = async () => {
    const camrollPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!camrollPermission.granted) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera roll is required"
      );
      return;
    }
    const camrollResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!camrollResult.canceled) {
      setImage(camrollResult.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const camPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!camPermission.granted) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera is required"
      );
      return;
    }
    const camResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!camResult.canceled) {
      setImage(camResult.assets[0].uri);
    }
  };

  const eventImgOptions = () => {
    Alert.alert("Select Image", "Choose option to select an image", [
      { text: "Cancel", style: "cancel" },
      { text: "Camera", onPress: takePhoto },
      { text: "Gallery", onPress: pickImage },
    ]);
  };

  const handleTimeChange = (newTime: Date) => setEventTime(newTime);
  const handleDateChange = (newDate: Date) => setEventDate(newDate);

  const handleSaveEvent = async () => {
    if (
      !eventName ||
      !eventDescription ||
      !eventCategory ||
      !eventLocation ||
      !eventDate ||
      !eventTime ||
      !attendees
    ) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (eventCategory === "") {
      Alert.alert("Invalid Category", "Please select a valid event category.");
      return;
    }

    // Check if userData and userId are available
    if (!userData?.userId) {
      Alert.alert(
        "Error", 
        "User information not found. Please log out and log back in.",
        [
          {
            text: "OK",
            onPress: () => navigation?.goBack?.()
          }
        ]
      );
      console.error("No userId found in userData:", userData);
      return;
    }

    try {
      const eventData = {
        name: eventName,
        description: eventDescription,
        category: eventCategory.toLowerCase(),
        location: eventLocation,
        date: eventDate.toISOString(),
        time: eventTime.toISOString(),
        attendees: Number(attendees),
        image: image || null,
        createdBy: userData.userId, // THIS IS THE CRUCIAL FIELD!
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Creating event with data:", eventData);

      const docRef = await addDoc(collection(db, "events"), eventData);
      
      console.log("Event created successfully with ID:", docRef.id);

      Alert.alert("Success", "Your event has been successfully saved.", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setEventName("");
            setEventDescription("");
            setEventCategory("");
            setEventLocation("");
            setEventDate(undefined);
            setEventTime(undefined);
            setAttendees("");
            setImage(null);
            
            // Navigate back
            navigation?.goBack?.();
          }
        }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save event. Please try again.");
      console.error("Firestore error:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Debug Panel */}
      {/* <View style={styles.debugPanel}>
        <Text style={styles.debugText}>
          Debug: UserID = {userData?.userId || "MISSING!"} | 
          Email = {userData?.email || "MISSING!"}
        </Text>
      </View> */}

      {/* Custom Header with Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation && navigation.goBack && navigation.goBack()}
        >
          <ArrowLeft width={24} height={24} color="#6200ee" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Event</Text>
      </View>

      <Text style={styles.label}>Event Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={eventName}
        onChangeText={setEventName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your event description"
        multiline
        numberOfLines={4}
        value={eventDescription}
        onChangeText={setEventDescription}
      />

      <Text style={styles.label}>Event Image</Text>
      <TouchableOpacity onPress={eventImgOptions}>
        <Text style={styles.imagePickerButtonText}>
          {image ? "Change Image" : "Select Image"}
        </Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.selectedImage} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setImage(null)}
          >
            <Text style={styles.removeImageText}>Remove Image</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Event Category</Text>
      <View style={styles.pickercontainer}>
        <Picker
          style={styles.picker}
          mode="dropdown"
          selectedValue={eventCategory}
          onValueChange={setEventCategory}
        >
          <Picker.Item label="Select" value="" enabled={false} />
          <Picker.Item label="Conference" value="conference" />
          <Picker.Item label="Workshop" value="workshop" />
          <Picker.Item label="Seminar" value="seminar" />
          <Picker.Item label="Webinar" value="webinar" />
          <Picker.Item label="Hackathon" value="hackathon" />
        </Picker>
      </View>

      <Text style={styles.label}>Time</Text>
      <TimePicker
        value={eventTime}
        onTimeChange={handleTimeChange}
        placeholder="Select Event Time"
      />

      <Text style={styles.label}>Date</Text>
      <DatePicker
        value={eventDate}
        onDateChange={handleDateChange}
        placeholder="Select Event Date"
        minimumDate={new Date()}
        mode="date"
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Event Location"
        value={eventLocation}
        onChangeText={setEventLocation}
      />

      <Text style={styles.label}>Attendees</Text>
      <TextInput
        style={styles.input}
        placeholder="Number of Attendees"
        keyboardType="numeric"
        value={attendees}
        onChangeText={setAttendees}
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveEvent}>
        <Text style={styles.buttonTxt}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: width * 0.06,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  debugPanel: {
    backgroundColor: "#fef3c7",
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  debugText: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  headerBackButton: {
    marginRight: 10,
    padding: 4,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6200ee",
    flex: 1,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    width: "100%",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    width: "100%",
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  pickercontainer: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    height: 50,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  imagePickerButtonText: {
    fontSize: 16,
    color: "#6200ee",
    fontWeight: "500",
  },
  imageContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    marginTop: 8,
    backgroundColor: "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
});