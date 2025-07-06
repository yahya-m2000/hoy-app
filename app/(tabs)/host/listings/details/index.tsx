import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Container, Header, Button, Text } from "@shared/components";
import { useProperty } from "@features/host/hooks/useProperties";
import LoadingState from "@features/host/components/listings/LoadingState";
import HostPropertyDetailsScreen from "src/features/host/screens/HostPropertyDetailsScreen";

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { property, loading, error } = useProperty(id!);

  const handleEdit = () => {
    if (property) {
      router.push({
        pathname: "/(tabs)/host/listings//",
        params: { mode: "edit", propertyId: property._id },
      });
    }
  };

  if (loading) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header title="Property Details" />
        <LoadingState />
      </Container>
    );
  }

  if (error || !property) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header title="Property Details" />
        <Container
          flex={1}
          justifyContent="center"
          alignItems="center"
          style={{ padding: 32 }}
        >
          <Text
            variant="h4"
            weight="bold"
            style={{ marginTop: 16, marginBottom: 8 }}
          >
            Property not found
          </Text>
          <Text
            color="textSecondary"
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            {error || "The property you're looking for could not be found."}
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </Container>
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor="background">
      <HostPropertyDetailsScreen property={property} onEdit={handleEdit} />
    </Container>
  );
}
