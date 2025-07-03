import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  onAddProperty: () => void;
  hasError?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export default function EmptyState({
  onAddProperty,
  hasError = false,
  errorMessage,
  onRetry,
}: EmptyStateProps) {
  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>
          {errorMessage || 'Failed to load your properties. Please try again.'}
        </Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.addButton} onPress={onAddProperty}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Property</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="home-outline" size={64} color="#007AFF" />
      </View>
      <Text style={styles.title}>No Properties Yet</Text>
      <Text style={styles.subtitle}>
        Start by adding your first property to begin hosting guests and earning income.
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddProperty}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Your First Property</Text>
      </TouchableOpacity>
      
      <View style={styles.benefitsContainer}>
        <View style={styles.benefit}>
          <Ionicons name="cash-outline" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Earn money from your space</Text>
        </View>
        <View style={styles.benefit}>
          <Ionicons name="people-outline" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Meet travelers from around the world</Text>
        </View>
        <View style={styles.benefit}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Host protection and support</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsContainer: {
    alignSelf: 'stretch',
    gap: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  retryButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
});
