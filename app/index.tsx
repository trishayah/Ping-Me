import { Text, View, StyleSheet} from "react-native";
// import Home from "./(tabs)/Home";
import AddEvent from "./components/AddEvent";
import Homepage from "./components/Homepage";


export default function Index() {
  return (
    // <View style={styles.header}>
    //   <Text>PingMe</Text>
    // </View>

    <View>
      <AddEvent />
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
