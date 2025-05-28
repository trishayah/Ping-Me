import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Check, X, Calendar, Users } from "react-native-feather";
import { collection, query, onSnapshot } from "firebase/firestore";
import { firebaseApp, db } from "../../firebaseConfig"; 

type Transaction = {
  id: string;
  eventName?: string;
  status?: string;
  date?: string | number | Date;
  attendees?: number;
  registered?: number;
  // Add other fields as needed based on your Firestore data
};

const Transactions = ({ userType = "organizer" }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const q = query(collection(db, "transactions"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transactionsData);
    });

    return () => unsubscribe();
  }, []);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.eventName}>{item.eventName}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "confirmed" ? "#dcfce7" : "#fee2e2",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.status === "confirmed" ? "#166534" : "#991b1b" },
            ]}
          >
            {item.status === "confirmed" ? "Confirmed" : "Cancelled"}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <Calendar width={16} height={16} style={styles.icon} />
        <Text style={styles.detailText}>
          {item.date ? new Date(item.date).toLocaleDateString() : "No date"}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Users width={16} height={16} style={styles.icon} />
          <Text style={styles.statText}>
            {item.attendees}/{item.registered} Attended
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Registrations</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  transactionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    color: "#64748b",
    marginRight: 6,
  },
  detailText: {
    color: "#64748b",
    fontSize: 14,
  },
  statText: {
    color: "#64748b",
    fontSize: 14,
  },
});

export default Transactions;
