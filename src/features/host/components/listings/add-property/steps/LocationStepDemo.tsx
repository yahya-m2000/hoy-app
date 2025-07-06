// import React, { useState } from "react";
// import { View, ScrollView } from "react-native";
// import { Container, Text, AutocompleteInput } from "@shared/components";
// import {
//   searchCountriesForAutocomplete,
//   getCitiesByCountryForAutocomplete,
//   getStateByCity,
//   getCountryByCode,
// } from "@core/utils/data/countries";

// export default function LocationStepDemo() {
//   const [selectedCountry, setSelectedCountry] = useState<any>(null);
//   const [selectedCity, setSelectedCity] = useState<string>("");
//   const [autoSelectedState, setAutoSelectedState] = useState<string>("");

//   const [countryInput, setCountryInput] = useState("");
//   const [cityInput, setCityInput] = useState("");

//   const countrySuggestions = searchCountriesForAutocomplete(countryInput);
//   const citySuggestions = selectedCountry
//     ? getCitiesByCountryForAutocomplete(selectedCountry.code, cityInput)
//     : [];

//   const handleCountrySelect = (country: any) => {
//     setSelectedCountry(country);
//     setSelectedCity("");
//     setAutoSelectedState("");
//     console.log("Selected country:", country.name);
//   };

//   const handleCitySelect = (city: string) => {
//     setSelectedCity(city);
//     if (selectedCountry) {
//       const state = getStateByCity(selectedCountry.code, city);
//       setAutoSelectedState(state || "");
//       console.log("Selected city:", city, "Auto-selected state:", state);
//     }
//   };

//   const renderCountrySuggestion = (country: any, onPress: () => void) => (
//     <View
//       style={{
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         borderBottomWidth: 1,
//         borderBottomColor: "#F0F0F0",
//       }}
//     >
//       <Text style={{ marginRight: 8, fontSize: 20 }}>{country.flag}</Text>
//       <Text style={{ flex: 1 }}>{country.name}</Text>
//       <Text style={{ color: "#666", fontSize: 12 }}>{country.code}</Text>
//     </View>
//   );

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
//       <Container padding="xl">
//         <Text variant="h4" style={{ marginBottom: 24 }}>
//           Location Autocomplete Demo
//         </Text>

//         {/* Country Selection */}
//         <Container marginBottom="xl">
//           <Text variant="h6" style={{ marginBottom: 8 }}>
//             Country *
//           </Text>
//           <AutocompleteInput
//             value={countryInput}
//             onChangeText={setCountryInput}
//             onSelectItem={handleCountrySelect}
//             placeholder="Start typing a country name..."
//             suggestions={countrySuggestions}
//             renderSuggestionItem={renderCountrySuggestion}
//           />
//           {selectedCountry && (
//             <Container
//               marginTop="sm"
//               padding="sm"
//               backgroundColor="primary"
//               borderRadius="sm"
//             >
//               <Text color="onPrimary">
//                 Selected: {selectedCountry.flag} {selectedCountry.name}
//               </Text>
//             </Container>
//           )}
//         </Container>

//         {/* City Selection */}
//         <Container marginBottom="xl">
//           <Text variant="h6" style={{ marginBottom: 8 }}>
//             City *
//           </Text>
//           <AutocompleteInput
//             value={cityInput}
//             onChangeText={setCityInput}
//             onSelectItem={handleCitySelect}
//             placeholder={
//               selectedCountry
//                 ? "Start typing a city name..."
//                 : "Select a country first"
//             }
//             suggestions={citySuggestions}
//             disabled={!selectedCountry}
//           />
//           {selectedCity && (
//             <Container
//               marginTop="sm"
//               padding="sm"
//               backgroundColor="secondary"
//               borderRadius="sm"
//             >
//               <Text color="onSecondary">Selected: {selectedCity}</Text>
//             </Container>
//           )}
//         </Container>

//         {/* Auto-selected State */}
//         {autoSelectedState && (
//           <Container marginBottom="xl">
//             <Text variant="h6" style={{ marginBottom: 8 }}>
//               Auto-selected State
//             </Text>
//             <Container padding="sm" backgroundColor="success" borderRadius="sm">
//               <Text color="onSuccess">{autoSelectedState}</Text>
//             </Container>
//           </Container>
//         )}

//         {/* Debug Info */}
//         <Container
//           marginTop="xl"
//           padding="md"
//           backgroundColor="surface"
//           borderRadius="sm"
//         >
//           <Text variant="h6" style={{ marginBottom: 8 }}>
//             Debug Information
//           </Text>
//           <Text variant="body" style={{ marginBottom: 4 }}>
//             Country Suggestions: {countrySuggestions.length}
//           </Text>
//           <Text variant="body" style={{ marginBottom: 4 }}>
//             City Suggestions: {citySuggestions.length}
//           </Text>
//           <Text variant="body" style={{ marginBottom: 4 }}>
//             Selected Country Code: {selectedCountry?.code || "None"}
//           </Text>
//           <Text variant="body">
//             Available Cities: {selectedCountry?.cities?.length || 0}
//           </Text>
//         </Container>

//         {/* Somaliland Test Section */}
//         <Container
//           marginTop="xl"
//           padding="md"
//           backgroundColor="warning"
//           borderRadius="sm"
//         >
//           <Text variant="h6" style={{ marginBottom: 8 }}>
//             Somaliland Test
//           </Text>
//           <Text variant="body" style={{ marginBottom: 4 }}>
//             Try typing "Somaliland" in the country field above
//           </Text>
//           <Text variant="body" style={{ marginBottom: 4 }}>
//             Then try typing "Hargeisa" in the city field
//           </Text>
//           <Text variant="body">
//             The state should auto-select to "Maroodi Jeex"
//           </Text>
//         </Container>
//       </Container>
//     </ScrollView>
//   );
// }
