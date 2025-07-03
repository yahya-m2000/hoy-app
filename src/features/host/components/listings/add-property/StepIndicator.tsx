import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Step {
  id: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                step.id < currentStep && styles.completedCircle,
                step.id === currentStep && styles.activeCircle,
              ]}>
                {step.id < currentStep ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <Text style={[
                    styles.stepNumber,
                    step.id === currentStep && styles.activeStepNumber,
                  ]}>
                    {step.id}
                  </Text>
                )}
              </View>
              <Text style={[
                styles.stepTitle,
                step.id === currentStep && styles.activeStepTitle,
                step.id < currentStep && styles.completedStepTitle,
              ]}>
                {step.title}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepConnector,
                step.id < currentStep && styles.completedConnector,
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  activeCircle: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  completedCircle: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeStepNumber: {
    color: '#fff',
  },
  stepTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeStepTitle: {
    color: '#007AFF',
    fontWeight: '600',
  },
  completedStepTitle: {
    color: '#4CAF50',
  },
  stepConnector: {
    height: 2,
    backgroundColor: '#e0e0e0',
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 24,
  },
  completedConnector: {
    backgroundColor: '#4CAF50',
  },
});
