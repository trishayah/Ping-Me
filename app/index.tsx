import { Text, View, StyleSheet} from "react-native";
import AddEvent from "./components/AddEvent";

export default function Index() {
  return (
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
