// import React from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import { useTheme } from "@core/hooks/useTheme";
// import { spacing } from "@core/design";
// import { Ionicons } from "@expo/vector-icons";
// import { useQuery } from "@tanstack/react-query";
// import { getPropertyReviews } from "@core/api";

// interface PropertyReview {
//   _id: string;
//   guest: {
//     firstName: string;
//     lastName: string;
//     avatarUrl?: string;
//   };
//   overallRating: number;
//   ratings: {
//     cleanliness: number;
//     accuracy: number;
//     checkIn: number;
//     communication: number;
//     location: number;
//     value: number;
//   };
//   comment: string;
//   createdAt: string;
// }

// interface PropertyInsightsData {
//   property: {
//     _id: string;
//     title: string;
//     images: string[];
//   };
//   averageRating: number;
//   totalReviews: number;
//   categoryAverages: {
//     cleanliness: number;
//     accuracy: number;
//     checkIn: number;
//     communication: number;
//     location: number;
//     value: number;
//   };
//   reviews: PropertyReview[];
// }

// const PropertyInsightsPage: React.FC = () => {
//   const { theme } = useTheme();
//   const router = useRouter();
//   const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
//   const {
//     data: propertyData,
//     isLoading,
//     error,
//   } = useQuery<PropertyInsightsData, Error>({
//     queryKey: ["propertyInsights", propertyId],
//     queryFn: async () => {
//       if (!propertyId) throw new Error("Property ID is required");
//       const response = await getPropertyReviews(propertyId);
//       return (response as any).data;
//     },
//     enabled: !!propertyId,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   const categoryNames = {
//     cleanliness: "Cleanliness",
//     accuracy: "Accuracy",
//     checkIn: "Check-in",
//     communication: "Communication",
//     location: "Location",
//     value: "Value",
//   };

//   const renderRatingBar = (
//     rating: number,
//     category: string,
//     count?: number
//   ) => {
//     const percentage = (rating / 5) * 100;
//     const barColor =
//       rating >= 4.5 ? "#E91E63" : rating >= 4 ? "#FF9800" : "#9E9E9E";

//     return (
//       <View key={category} style={styles.ratingBarContainer}>
//         <View style={styles.ratingBarHeader}>
//           <Text style={[styles.categoryLabel, { color: theme.text.primary }]}>
//             {categoryNames[category as keyof typeof categoryNames]}
//           </Text>
//           <Text style={[styles.categoryValue, { color: theme.text.primary }]}>
//             {rating.toFixed(1)} ★
//           </Text>
//         </View>
//         <View
//           style={[styles.ratingBarTrack, { backgroundColor: theme.border }]}
//         >
//           <View
//             style={[
//               styles.ratingBarFill,
//               { width: `${percentage}%`, backgroundColor: barColor },
//             ]}
//           />
//         </View>
//         {/* Dynamic tags based on category */}
//         <View style={styles.tagsContainer}>
//           {category === "checkIn" && (
//             <>
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>Responsive host</Text>
//                 <Text style={styles.tagCount}>
//                   ({count || Math.floor(Math.random() * 30) + 10})
//                 </Text>
//               </View>
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>Easy to find</Text>
//                 <Text style={styles.tagCount}>
//                   ({count || Math.floor(Math.random() * 20) + 5})
//                 </Text>
//               </View>
//             </>
//           )}
//           {category === "cleanliness" && (
//             <>
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>Free of clutter</Text>
//                 <Text style={styles.tagCount}>
//                   ({count || Math.floor(Math.random() * 15) + 5})
//                 </Text>
//               </View>
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>Pristine kitchen</Text>
//                 <Text style={styles.tagCount}>
//                   ({count || Math.floor(Math.random() * 10) + 3})
//                 </Text>
//               </View>
//             </>
//           )}
//           {category === "accuracy" && (
//             <>
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>Easy to find</Text>
//                 <Text style={styles.tagCount}>
//                   ({count || Math.floor(Math.random() * 15) + 5})
//                 </Text>
//               </View>
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>Clear instructions</Text>
//                 <Text style={styles.tagCount}>
//                   ({count || Math.floor(Math.random() * 10) + 3})
//                 </Text>
//               </View>
//             </>
//           )}
//         </View>
//       </View>
//     );
//   };

//   if (isLoading) {
//     return (
//       <SafeAreaView
//         style={[styles.container, { backgroundColor: theme.background }]}
//       >
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007AFF" />
//           <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
//             Loading property insights...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !propertyData) {
//     return (
//       <SafeAreaView
//         style={[styles.container, { backgroundColor: theme.background }]}
//       >
//         <View style={styles.errorContainer}>
//           <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
//           <Text style={[styles.errorText, { color: theme.text.primary }]}>
//             Failed to load property insights
//           </Text>
//           <Text style={[styles.errorSubtext, { color: theme.text.secondary }]}>
//             Please try again later
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: theme.background }]}
//     >
//       <View style={[styles.header, { borderBottomColor: theme.border }]}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={styles.backButton}
//         >
//           <Ionicons name="chevron-back-outline" size={24} color={theme.text.primary} />
//         </TouchableOpacity>
//         <Text style={[styles.title, { color: theme.text.primary }]}>Homes</Text>
//         <View style={styles.placeholder} />
//       </View>

//       {/* Tabs */}
//       <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
//         <View style={styles.tabs}>
//           <View
//             style={[styles.activeTab, { backgroundColor: theme.text.primary }]}
//           >
//             <Text style={[styles.activeTabText, { color: theme.background }]}>
//               Reviews
//             </Text>
//           </View>
//           <Text
//             style={[styles.inactiveTabText, { color: theme.text.secondary }]}
//           >
//             Stats
//           </Text>
//           <Text
//             style={[styles.inactiveTabText, { color: theme.text.secondary }]}
//           >
//             Opportunities
//           </Text>
//           <Text
//             style={[styles.inactiveTabText, { color: theme.text.secondary }]}
//           >
//             Superhost
//           </Text>
//         </View>
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Property Title */}
//         <View style={styles.propertyTitleContainer}>
//           <Text
//             style={[styles.propertyTitleText, { color: theme.text.primary }]}
//           >
//             {propertyData.property.title}
//           </Text>
//         </View>

//         {/* Overall Rating */}
//         <View style={styles.overallRatingSection}>
//           <View style={styles.ratingDisplayRow}>
//             <Text
//               style={[styles.ratingValueLarge, { color: theme.text.primary }]}
//             >
//               {propertyData.averageRating.toFixed(2)} ★
//             </Text>
//             <Text
//               style={[styles.totalReviewsText, { color: theme.text.primary }]}
//             >
//               {propertyData.totalReviews}
//             </Text>
//           </View>
//           <View style={styles.ratingLabels}>
//             <Text
//               style={[
//                 styles.overallRatingLabel,
//                 { color: theme.text.secondary },
//               ]}
//             >
//               Overall rating
//             </Text>
//             <Text
//               style={[
//                 styles.totalReviewsLabel,
//                 { color: theme.text.secondary },
//               ]}
//             >
//               Total reviews
//             </Text>
//           </View>
//         </View>

//         {/* Category Ratings */}
//         <View style={styles.categoriesSection}>
//           {Object.entries(propertyData.categoryAverages).map(([key, value]) =>
//             renderRatingBar(value, key, propertyData.totalReviews)
//           )}
//         </View>

//         {/* Recent Reviews */}
//         {propertyData.reviews && propertyData.reviews.length > 0 && (
//           <View
//             style={[
//               styles.reviewsContainer,
//               { backgroundColor: theme.surface, borderColor: theme.border },
//             ]}
//           >
//             <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
//               Recent reviews
//             </Text>

//             {propertyData.reviews.slice(0, 3).map((review, index) => (
//               <View key={review._id || index} style={styles.reviewItem}>
//                 <View style={styles.reviewHeader}>
//                   <View style={styles.guestInfo}>
//                     {review.guest.avatarUrl ? (
//                       <Image
//                         source={{ uri: review.guest.avatarUrl }}
//                         style={styles.guestAvatar}
//                       />
//                     ) : (
//                       <View
//                         style={[
//                           styles.guestAvatar,
//                           styles.guestAvatarPlaceholder,
//                           { backgroundColor: "#007AFF" },
//                         ]}
//                       >
//                         <Text style={styles.guestInitial}>
//                           {review.guest.firstName.charAt(0).toUpperCase()}
//                         </Text>
//                       </View>
//                     )}
//                     <View>
//                       <Text
//                         style={[
//                           styles.guestName,
//                           { color: theme.text.primary },
//                         ]}
//                       >
//                         {review.guest.firstName} {review.guest.lastName}
//                       </Text>
//                       <View style={styles.reviewRating}>
//                         <Text
//                           style={[
//                             styles.reviewRatingText,
//                             { color: theme.text.secondary },
//                           ]}
//                         >
//                           {review.overallRating} ★
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 </View>
//                 <Text
//                   style={[
//                     styles.reviewComment,
//                     { color: theme.text.secondary },
//                   ]}
//                 >
//                   {review.comment}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: spacing.lg,
//     paddingVertical: spacing.md,
//     borderBottomWidth: 1,
//   },
//   backButton: {
//     padding: spacing.sm,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "600",
//   },
//   placeholder: {
//     width: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: spacing.xl * 2,
//   },
//   loadingText: {
//     marginTop: spacing.md,
//     fontSize: 16,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: spacing.xl * 2,
//   },
//   errorText: {
//     marginTop: spacing.md,
//     fontSize: 18,
//     fontWeight: "600",
//     textAlign: "center",
//   },
//   errorSubtext: {
//     marginTop: spacing.sm,
//     fontSize: 16,
//     textAlign: "center",
//   },
//   // Tabs styles
//   tabsContainer: {
//     paddingHorizontal: spacing.lg,
//     borderBottomWidth: 1,
//   },
//   tabs: {
//     flexDirection: "row",
//     gap: spacing.lg,
//     paddingVertical: spacing.md,
//   },
//   activeTab: {
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.xs,
//     borderRadius: 20,
//   },
//   activeTabText: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   inactiveTabText: {
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: spacing.lg,
//   },
//   // Property title
//   propertyTitleContainer: {
//     paddingVertical: spacing.lg,
//   },
//   propertyTitleText: {
//     fontSize: 20,
//     fontWeight: "600",
//   },
//   // Overall rating section
//   overallRatingSection: {
//     marginBottom: spacing.xl,
//   },
//   ratingDisplayRow: {
//     flexDirection: "row",
//     alignItems: "baseline",
//     gap: spacing.xl,
//     marginBottom: spacing.sm,
//   },
//   ratingValueLarge: {
//     fontSize: 32,
//     fontWeight: "700",
//   },
//   totalReviewsText: {
//     fontSize: 32,
//     fontWeight: "700",
//   },
//   ratingLabels: {
//     flexDirection: "row",
//     gap: spacing.xl,
//   },
//   overallRatingLabel: {
//     fontSize: 16,
//   },
//   totalReviewsLabel: {
//     fontSize: 16,
//   },
//   categoriesSection: {
//     marginBottom: spacing.xl,
//   },
//   // Rating bar styles
//   ratingBarContainer: {
//     marginBottom: spacing.lg,
//   },
//   ratingBarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: spacing.xs,
//   },
//   categoryLabel: {
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   categoryValue: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   ratingBarTrack: {
//     height: 8,
//     borderRadius: 4,
//     marginBottom: spacing.sm,
//   },
//   ratingBarFill: {
//     height: "100%",
//     borderRadius: 4,
//   },
//   tagsContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: spacing.xs,
//   },
//   tag: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: spacing.sm,
//     paddingVertical: spacing.xs,
//     backgroundColor: "rgba(0, 0, 0, 0.05)",
//     borderRadius: 16,
//   },
//   tagText: {
//     fontSize: 13,
//     color: "#666",
//     marginRight: spacing.xs,
//   },
//   tagCount: {
//     fontSize: 13,
//     color: "#999",
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: spacing.lg,
//   },
//   reviewsContainer: {
//     padding: spacing.lg,
//     borderRadius: 12,
//     borderWidth: 1,
//     marginBottom: spacing.xl,
//   },
//   reviewItem: {
//     marginBottom: spacing.lg,
//   },
//   reviewHeader: {
//     marginBottom: spacing.sm,
//   },
//   guestInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   guestAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: spacing.md,
//   },
//   guestAvatarPlaceholder: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   guestInitial: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   guestName: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: spacing.xs,
//   },
//   reviewRating: {
//     flexDirection: "row",
//     gap: 2,
//   },
//   reviewRatingText: {
//     fontSize: 14,
//   },
//   reviewComment: {
//     fontSize: 15,
//     lineHeight: 22,
//   },
// });

// export default PropertyInsightsPage;
