import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert,
  Modal, ScrollView,
} from 'react-native';
import { colors, spacing, typography, commonStyles } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import api, { challengeService } from '../services/api';

interface Challenge {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_progress: number;
  is_public: boolean;
  waste_type?: string;
  reward?: any;
  creator?: any;
}

// Available waste types
const WASTE_TYPES = [
  'Plastic',
  'Paper',
  'Glass',
  'Metal',
  'Electronic',
  'Organic',
  'Other'
];

// Add helper function to check if challenge is completed
const isChallengeCompleted = (challenge: Challenge): boolean => {
  return challenge.current_progress >= challenge.target_amount;
};

export const ChallengesScreen = () => {
  const { userData } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // New state for contribution modal
  const [contributionModalVisible, setContributionModalVisible] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedWasteType, setSelectedWasteType] = useState<string>('');

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await challengeService.getChallenges();
      setChallenges(response); // If backend wraps in {data: [...]}, use response.data
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async () => {
    if (!title || !description || !targetAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await challengeService.createChallenge({
        title,
        description,
        target_amount: parseFloat(targetAmount),
        is_public: isPublic,
      });
      setTitle('');
      setDescription('');
      setTargetAmount('');
      setIsPublic(true);
      fetchChallenges();
    } catch (error) {
      Alert.alert('Error', 'Failed to create challenge');
    }
  };

  const handleContributePress = (challengeId: number, defaultWasteType?: string) => {
    setSelectedChallengeId(challengeId);
    setSelectedWasteType(defaultWasteType || WASTE_TYPES[0]);
    setContributionModalVisible(true);
  };

  const handleContributionSubmit = async () => {
    if (!selectedChallengeId || !contributionAmount || parseFloat(contributionAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedWasteType) {
      Alert.alert('Error', 'Please select a waste type');
      return;
    }

    try {
      await challengeService.contributeToChallenge(
        selectedChallengeId,
        parseFloat(contributionAmount),
        selectedWasteType
      );
      setContributionModalVisible(false);
      setContributionAmount('');
      setSelectedChallengeId(null);
      setSelectedWasteType('');
      fetchChallenges(); // Refresh challenges to show updated progress
      Alert.alert('Success', 'Waste entry added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add waste entry');
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Challenges</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isCompleted = isChallengeCompleted(item);
            return (
              <View style={[
                styles.challengeItem,
                isCompleted && styles.completedChallengeItem
              ]}>
                <View style={styles.challengeHeader}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.challengeTitle}>{item.title}</Text>
                    {isCompleted && (
                      <Text style={styles.completedIcon}>✅</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.contributeButton,
                      isCompleted && styles.disabledButton
                    ]}
                    onPress={() => handleContributePress(item.id)}
                    disabled={isCompleted}
                  >
                    <Text style={styles.contributeButtonText}>➕</Text>
                  </TouchableOpacity>
                </View>
                <Text>{item.description}</Text>
                <View style={styles.progressContainer}>
                  <Text>Progress: </Text>
                  <Text style={isCompleted ? styles.completedText : undefined}>
                    {item.current_progress} / {item.target_amount}
                  </Text>
                </View>
                <Text>Type: {item.is_public ? 'Public' : 'Private'}</Text>
                {isCompleted && (
                  <Text style={styles.completedMessage}>Challenge Completed! 🎉</Text>
                )}
              </View>
            );
          }}
        />
      )}

      <Text style={styles.subtitle}>Create New Challenge</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Target Amount"
        value={targetAmount}
        onChangeText={setTargetAmount}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={createChallenge}
      >
        <Text style={styles.buttonText}>Add Challenge</Text>
      </TouchableOpacity>

      {/* Contribution Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contributionModalVisible}
        onRequestClose={() => setContributionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Waste Entry</Text>
            
            <Text style={styles.inputLabel}>Waste Type:</Text>
            <ScrollView style={styles.wasteTypeContainer}>
              {WASTE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.wasteTypeButton,
                    selectedWasteType === type && styles.selectedWasteType
                  ]}
                  onPress={() => setSelectedWasteType(type)}
                >
                  <Text style={[
                    styles.wasteTypeText,
                    selectedWasteType === type && styles.selectedWasteTypeText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Amount:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={contributionAmount}
              onChangeText={setContributionAmount}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setContributionModalVisible(false);
                  setContributionAmount('');
                  setSelectedWasteType('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={handleContributionSubmit}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...commonStyles.container, padding: spacing.md },
  title: { ...typography.h1, color: colors.primary, marginBottom: spacing.md },
  subtitle: { ...typography.h2, color: colors.primary, marginVertical: spacing.sm },
  input: { ...commonStyles.input },
  button: { ...commonStyles.button, marginTop: spacing.sm },
  buttonText: { ...commonStyles.buttonText },
  challengeItem: {
    backgroundColor: '#f0f0f0',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  completedChallengeItem: {
    backgroundColor: '#e6ffe6', // Light green background
    borderColor: '#4CAF50', // Green border
    borderWidth: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  completedIcon: {
    marginLeft: spacing.xs,
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  completedMessage: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#cccccc', // Gray out the contribute button for completed challenges
    opacity: 0.5,
  },
  challengeTitle: { ...typography.h2, fontWeight: 'bold' },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  contributeButton: {
    padding: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  contributeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: spacing.lg,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  cancelButton: {
    backgroundColor: colors.error || '#ff4444',
    marginRight: spacing.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  wasteTypeContainer: {
    maxHeight: 150,
    marginBottom: spacing.md,
  },
  wasteTypeButton: {
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedWasteType: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  wasteTypeText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedWasteTypeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
