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
  waste_type: string;
  reward?: {
    id: number;
    title: string;
    description: string;
  };
  creator?: {
    id: number;
    username: string;
    email: string;
  };
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
  const [creating, setCreating] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [createChallengeWasteType, setCreateChallengeWasteType] = useState(WASTE_TYPES[0]);
  
  // Contribution modal state
  const [contributionModalVisible, setContributionModalVisible] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedWasteType, setSelectedWasteType] = useState<string>('');

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await challengeService.getChallenges();
      setChallenges(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch challenges. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const validateTargetAmount = (amount: string): boolean => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  };

  const createChallenge = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!validateTargetAmount(targetAmount)) {
      Alert.alert('Error', 'Please enter a valid target amount (greater than 0)');
      return;
    }

    setCreating(true);
    try {
      await challengeService.createChallenge({
        title: title.trim(),
        description: description.trim(),
        target_amount: parseFloat(targetAmount),
        is_public: isPublic,
        waste_type: createChallengeWasteType,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setTargetAmount('');
      setIsPublic(true);
      setCreateChallengeWasteType(WASTE_TYPES[0]);
      
      // Refresh challenges
      fetchChallenges();
      Alert.alert('Success', 'Challenge created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create challenge. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleContributePress = (challengeId: number, wasteType: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) {
      Alert.alert('Error', 'Challenge not found');
      return;
    }
    
    setSelectedChallengeId(challengeId);
    setSelectedWasteType(wasteType); // Fixed to challenge's waste type
    setContributionModalVisible(true);
  };

  const handleContributionSubmit = async () => {
    if (!selectedChallengeId || !validateTargetAmount(contributionAmount)) {
      Alert.alert('Error', 'Please enter a valid amount (greater than 0)');
      return;
    }

    const challenge = challenges.find(c => c.id === selectedChallengeId);
    if (!challenge) {
      Alert.alert('Error', 'Challenge not found');
      return;
    }

    setContributing(true);
    try {
      await challengeService.contributeToChallenge(
        selectedChallengeId,
        parseFloat(contributionAmount),
        challenge.waste_type
      );
      setContributionModalVisible(false);
      setContributionAmount('');
      setSelectedChallengeId(null);
      fetchChallenges();
      Alert.alert('Success', 'Contribution added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add contribution. Please try again.');
    } finally {
      setContributing(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const renderChallenge = ({ item }: { item: Challenge }) => {
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
            onPress={() => handleContributePress(item.id, item.waste_type)}
            disabled={isCompleted}
          >
            <Text style={styles.contributeButtonText}>➕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.challengeDetailsContainer}>
          <View style={styles.wasteTypeTag}>
            <Text style={styles.wasteTypeTagText}>{item.waste_type}</Text>
          </View>
          <View style={styles.progressContainer}>
            <Text>Progress: </Text>
            <Text style={isCompleted ? styles.completedText : undefined}>
              {item.current_progress} / {item.target_amount}
            </Text>
          </View>
        </View>
        <Text style={styles.visibilityText}>
          {item.is_public ? 'Public Challenge' : 'Private Challenge'}
        </Text>
        {isCompleted && (
          <Text style={styles.completedMessage}>Challenge Completed! 🎉</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Challenges</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderChallenge}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No challenges found</Text>
          }
        />
      )}

      <Text style={styles.subtitle}>Create New Challenge</Text>
      <View style={styles.createChallengeForm}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        <View style={styles.formRow}>
          <TextInput
            style={[styles.input, styles.targetAmountInput]}
            placeholder="Target Amount"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
          />
          <View style={styles.wasteTypeSelectContainer}>
            <Text style={styles.wasteTypeLabel}>Waste Type:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalWasteTypeList}
            >
              {WASTE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.createFormWasteTypeButton,
                    createChallengeWasteType === type && styles.selectedWasteType
                  ]}
                  onPress={() => setCreateChallengeWasteType(type)}
                >
                  <Text style={[
                    styles.createFormWasteTypeText,
                    createChallengeWasteType === type && styles.selectedWasteTypeText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.button, creating && styles.disabledButton]}
          onPress={createChallenge}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Create Challenge</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Contribution Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contributionModalVisible}
        onRequestClose={() => setContributionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Contribution</Text>
            
            {selectedChallengeId && (
              <View style={styles.selectedChallengeInfo}>
                <Text style={styles.wasteTypeLabel}>
                  Required Waste Type: {challenges.find(c => c.id === selectedChallengeId)?.waste_type}
                </Text>
              </View>
            )}

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
                  setSelectedChallengeId(null);
                }}
                disabled={contributing}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, contributing && styles.disabledButton]}
                onPress={handleContributionSubmit}
                disabled={contributing}
              >
                {contributing ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...commonStyles.container },
  title: { ...typography.h1, color: colors.primary, marginBottom: spacing.md },
  subtitle: { ...typography.h2, color: colors.primary, marginVertical: spacing.sm },
  input: { ...commonStyles.input },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  button: { ...commonStyles.button },
  buttonText: { ...commonStyles.buttonText },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    marginVertical: spacing.lg,
  },
  challengeItem: {
    backgroundColor: '#f0f0f0',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  completedChallengeItem: {
    backgroundColor: '#e6ffe6',
    borderColor: colors.success,
    borderWidth: 1,
  },
  description: {
    marginVertical: spacing.xs,
    color: colors.text,
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
  },
  completedText: {
    color: colors.success,
    fontWeight: 'bold',
  },
  completedMessage: {
    color: colors.success,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: colors.gray,
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
    color: colors.white,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
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
    backgroundColor: colors.error,
    marginRight: spacing.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  selectedChallengeInfo: {
    backgroundColor: colors.lightGray,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  challengeDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  wasteTypeTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  wasteTypeTagText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  visibilityText: {
    color: colors.gray,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  createChallengeForm: {
    backgroundColor: colors.lightGray,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  targetAmountInput: {
    flex: 0.4,
    marginRight: spacing.sm,
    marginBottom: 0,
  },
  wasteTypeSelectContainer: {
    flex: 0.6,
  },
  wasteTypeLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  horizontalWasteTypeList: {
    flexGrow: 0,
  },
  createFormWasteTypeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.white,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  createFormWasteTypeText: {
    fontSize: 12,
    color: colors.primary,
  },
  selectedWasteType: {
    backgroundColor: colors.primary,
  },
  selectedWasteTypeText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});
