import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from "react-native";
import { BEACHES } from "../constants/beaches";

export default function BeachPicker({ selectedBeach, onSelect }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>
          {selectedBeach ? selectedBeach.name : "Select a beach..."}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Your Beach</Text>
            <FlatList
              data={BEACHES}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.beachItem,
                    selectedBeach?.id === item.id && styles.beachItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.beachName,
                      selectedBeach?.id === item.id && styles.beachNameSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e3a5f",
    padding: 14,
    borderRadius: 10,
  },
  selectorText: {
    color: "#fff",
    fontSize: 15,
  },
  arrow: {
    color: "#7eb8f7",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0d2137",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "75%",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  beachItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e3a5f",
  },
  beachItemSelected: {
    backgroundColor: "#1e3a5f",
    borderRadius: 8,
  },
  beachName: {
    color: "#cde0f7",
    fontSize: 15,
  },
  beachNameSelected: {
    color: "#7eb8f7",
    fontWeight: "bold",
  },
  cancelBtn: {
    marginTop: 16,
    padding: 14,
    alignItems: "center",
    backgroundColor: "#1e3a5f",
    borderRadius: 10,
  },
  cancelText: {
    color: "#7eb8f7",
    fontWeight: "bold",
  },
});
