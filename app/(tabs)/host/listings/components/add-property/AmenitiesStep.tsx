import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyFormData, AMENITIES } from '../../utils/types';

interface AmenitiesStepProps {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: any) => void;
  updateNestedFormData: (field: keyof PropertyFormData, nestedField: string, value: any) => void;
  errors: Record<string, string>;
  isEditMode: boolean;
}

export default function AmenitiesStep({
  formData,
  updateFormData,
}: AmenitiesStepProps) {
  const toggleAmenity = (amenity: string) => {
    const currentAmenities = formData.amenities;
    let updatedAmenities;
    
    if (currentAmenities.includes(amenity)) {
      updatedAmenities = currentAmenities.filter(item => item !== amenity);
    } else {
      updatedAmenities = [...currentAmenities, amenity];
    }
    
    updateFormData('amenities', updatedAmenities);
  };

  const isSelected = (amenity: string) => {
    return formData.amenities.includes(amenity);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepTitle}>Amenities</Text>
      <Text style={styles.stepSubtitle}>
        What amenities do you offer? Select all that apply.
      </Text>

      <View style={styles.amenitiesGrid}>
        {AMENITIES.map((amenity) => (
          <TouchableOpacity
            key={amenity}
            style={[
              styles.amenityCard,
              isSelected(amenity) && styles.amenityCardSelected
            ]}
            onPress={() => toggleAmenity(amenity)}
          >
            <View style={styles.amenityContent}>
              <View style={[
                styles.amenityIcon,
                isSelected(amenity) && styles.amenityIconSelected
              ]}>
                <Ionicons 
                  name={getAmenityIcon(amenity)} 
                  size={24} 
                  color={isSelected(amenity) ? '#fff' : '#007AFF'} 
                />
              </View>
              <Text style={[
                styles.amenityText,
                isSelected(amenity) && styles.amenityTextSelected
              ]}>
                {amenity}
              </Text>
              {isSelected(amenity) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.selectedCount}>
        <Text style={styles.selectedCountText}>
          {formData.amenities.length} amenities selected
        </Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Amenity Tips</Text>
        <Text style={styles.infoText}>
          Popular amenities like WiFi, Kitchen, and AC can help attract more guests. 
          Only select amenities you actually provide to maintain good reviews.
        </Text>
      </View>
    </ScrollView>
  );
}

// Helper function to get icon for each amenity
const getAmenityIcon = (amenity: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    'WiFi': 'wifi',
    'Kitchen': 'restaurant',
    'AC': 'snow',
    'Heating': 'flame',
    'TV': 'tv',
    'Washer': 'shirt',
    'Dryer': 'shirt-outline',
    'Parking': 'car',
    'Pool': 'water',
    'Gym': 'barbell',
    'Balcony': 'home',
    'Garden': 'leaf',
    'Smart TV': 'tv',
    'Netflix': 'play-circle',
    'Dishwasher': 'restaurant-outline',
    'Microwave': 'radio',
    'Coffee Maker': 'cafe',
    'Hair Dryer': 'cut',
    'Iron': 'shirt',
    'Workspace': 'laptop',
  };
  
  return iconMap[amenity] || 'checkmark-circle';
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  amenityCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  amenityCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  amenityContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  amenityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  amenityIconSelected: {
    backgroundColor: '#007AFF',
  },
  amenityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  amenityTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  selectedCount: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedCountText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
