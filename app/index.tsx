import { Text, View, StyleSheet} from "react-native";

export default function Index() {
  return (
    <View style={styles.header}>
      <Text>PingMe</Text>
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
