import { View, Text, TextInput, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import TimePicker from "@/components/time-picker";
import DatePicker from "@/components/date-picker";


export default function AddEvent() {
    const [image, setImage] = useState<string | null>(null);
    const [eventTime, setEventTime] = useState<Date | undefined>(undefined);
    const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
    
    const pickImage = async () => {
        // request for camera roll permission
        const camrollPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if(camrollPermission.granted === false) {
            Alert.alert("Permission Required", "Permission to access camera roll is required")
            return;
        }

        // open camera roll
        const camrollResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if(!camrollResult.canceled){
            setImage(camrollResult.assets[0].uri);
        }
    }

    const takePhoto = async () => {
        // request for camera permission
        const camPermission = await ImagePicker.requestCameraPermissionsAsync();

        if(camPermission.granted === false) {
            Alert.alert("Permission Required", "Permission to access camera is required")
            return;
        }

        // open camera
        const camResult = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if(!camResult.canceled){
            setImage(camResult.assets[0].uri);
        }
    }

    // cam roll or take photo option
    const eventImgOptions = () => {
        Alert.alert("Select Image", "Choose option to select an image", [
            { text: "Cancel", style: "cancel" },
            { text: "Camera", onPress: takePhoto },
            { text: "Gallery", onPress: pickImage },
        ])
    }

    const handleTimeChange = (newTime: any) => {
        setEventTime(newTime);
    }

    const handleDateChange = (newDate: any) => {
        setEventDate(newDate);
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Add New Event</Text>

            {/* event name */}
            <Text style={styles.label}>Event Name</Text>
            <TextInput style={styles.input} placeholder="Event Name" />

            {/* event description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your event description"
                multiline
                numberOfLines={4}
            />

            {/* event image */}
            <Text style={styles.label}>Event Image</Text>
            <TouchableOpacity>
                <Text style={styles.imagePickerButtonText} onPress={eventImgOptions}>
                    {image ? "Change Image" : "Select Image"}
                </Text>
            </TouchableOpacity>
            
            {/* display image */}
            {image && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.selectedImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                        <Text style={styles.removeImageText}>Remove Image</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* event category */}
            <Text style={styles.label}>Event Category</Text>
            <View style={styles.pickercontainer}>
                <Picker style={styles.picker} mode="dropdown">
                    <Picker.Item label="Select" value="" />
                    <Picker.Item label="Conference" value="conference" />
                    <Picker.Item label="Workshop" value="workshop" />
                    <Picker.Item label="Seminar" value="seminar" />
                    <Picker.Item label="Webinar" value="webinar" />
                    <Picker.Item label="Hackathon" value="hackathon" />
                </Picker>
            </View>

            {/* event time */}
            <Text style={styles.label}>Time</Text>
            <TimePicker 
                value={eventTime}
                onTimeChange={handleTimeChange}
                placeholder="Select Event Time"
            />

            {/* event date */}
            <Text style={styles.label}>Date</Text>
            <DatePicker 
                value={eventDate}
                onDateChange={handleDateChange}
                placeholder="Select Event Date"
                minimumDate={new Date()} 
                mode="date"
            />

            {/* event location */}
            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} placeholder="Event Location" />

            {/* event number of attendees */}
            <Text style={styles.label}>Attendees</Text>
            <TextInput
                style={styles.input}
                placeholder="Number of Attendees"
                keyboardType="numeric"
            />

            {/* save button */}
            <TouchableOpacity style={styles.button} onPress={() => alert("Event Saved!")}>
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 25,
        textAlign: "center",
        color: "#6200ee",
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
    buttonContainer: {
        marginTop: 30,
        width: "100%",
    },
    button: {
        width: "100%",
        backgroundColor: "#2563eb",
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
        borderColor: '#ccc',
        borderRadius: 10,
        height: 50,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: "100%",
        paddingVertical: 0,
    },
     imagePickerButton: {
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
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
