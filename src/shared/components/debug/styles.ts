/**
 * Shared Debug Component Styles
 * Common styles used across debug components
 */

import { StyleSheet } from 'react-native';

export const debugStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
    color: '#333',
  },
  statText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-around' as const,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#333',
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  warningText: {
    color: '#ff9500',
    fontSize: 12,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row' as const,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden' as const,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    backgroundColor: '#f0f0f0',
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#666',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  loadingContainer: {
    alignItems: 'center' as const,
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center' as const,
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic' as const,
    marginTop: 20,
  },
  violationsList: {
    maxHeight: 300,
  },
  violationItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  violationType: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  violationSeverity: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  violationDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  violationTime: {
    fontSize: 11,
    color: '#999',
  },
  messagesList: {
    maxHeight: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'monospace' as const,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  webView: {
    flex: 1,
  },
  webViewUrl: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  // Additional styles for various debug components
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  successText: {
    color: '#28a745',
  },
  errorTextColor: {
    color: '#dc3545',
  },
  warningTextColor: {
    color: '#ffc107',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    padding: 20,
  },
  actionGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '48%' as any,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  },
  buttonGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  },
  logoutButton: {
    backgroundColor: '#FF9500',
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
  },
  securityButton: {
    backgroundColor: '#8E44AD',
  },
  auditList: {
    maxHeight: 300,
  },
  auditItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  // Token-related styles
  tokenContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tokenLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  tokenValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  tokenAvailable: {
    color: '#28a745',
    fontWeight: '600' as const,
  },
  tokenUnavailable: {
    color: '#dc3545',
    fontWeight: '600' as const,
  },
  // Test result styles
  testResultsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  testResultsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
    color: '#333',
  },
  testResult: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  testSuccess: {
    color: '#28a745',
    fontWeight: '600' as const,
  },
  testError: {
    color: '#dc3545',
    fontWeight: '600' as const,
  },
  testDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Header and footer styles
  header: {
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center' as const,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center' as const,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  // Button variants
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  warningButton: {
    backgroundColor: '#ffc107',
  },
  halfButton: {
    width: '48%' as any,
  },
  buttonRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
}); 