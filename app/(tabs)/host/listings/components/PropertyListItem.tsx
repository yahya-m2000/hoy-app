import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../utils/types';

interface PropertyListItemProps {
  property: Property;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function PropertyListItem({
  property,
  onPress,
  onEdit,
  onDelete,
  isDeleting = false,
}: PropertyListItemProps) {
  const primaryImage = property.images?.[0];
  const address = `${property.address.city}, ${property.address.state}`;

  const handleOptionsPress = () => {
    Alert.alert(
      'Property Options',
      `Options for "${property.name}"`,
      [
        {
          text: 'Edit',
          onPress: onEdit,
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, isDeleting && styles.deleting]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isDeleting}
    >
      {/* Property Image */}
      <View style={styles.imageContainer}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={32} color="#999" />
          </View>
        )}
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, property.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, property.isActive ? styles.activeText : styles.inactiveText]}>
            {property.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Property Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.header}>
          <Text style={styles.propertyName} numberOfLines={1}>
            {property.name}
          </Text>
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={handleOptionsPress}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Ionicons name="hourglass-outline" size={20} color="#999" />
            ) : (
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.address} numberOfLines={1}>
          {address}
        </Text>

        <Text style={styles.propertyType}>
          {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
        </Text>

        {/* Property Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="bed-outline" size={16} color="#666" />
            <Text style={styles.statText}>{property.bedrooms}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="water-outline" size={16} color="#666" />
            <Text style={styles.statText}>{property.bathrooms}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statText}>{property.maxGuests}</Text>
          </View>
          {property.rating > 0 && (
            <View style={styles.stat}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{property.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {property.currency} {property.price}
          </Text>
          <Text style={styles.priceUnit}>/ night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleting: {
    opacity: 0.6,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#d4edda',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#155724',
  },
  inactiveText: {
    color: '#721c24',
  },
  detailsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  optionsButton: {
    padding: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  propertyType: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});
