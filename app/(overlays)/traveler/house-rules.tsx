import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PolicyScreen, PolicySection, PolicyItem } from "@modules/properties";

const HouseRulesScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse house rules from params (would typically come from property data)
  const checkInTime = (params.checkInTime as string) || "3:00 PM";
  const checkOutTime = (params.checkOutTime as string) || "11:00 AM";
  const maxGuests = (params.maxGuests as string) || "4";
  const smokingAllowed = params.smokingAllowed === "true";
  const petsAllowed = params.petsAllowed === "true";
  const partiesAllowed = params.partiesAllowed === "true";
  const quietHours = (params.quietHours as string) || "10:00 PM - 8:00 AM";

  return (
    <PolicyScreen title="House Rules" icon="rule" onClose={() => router.back()}>
      <PolicySection title="Check-in & Check-out">
        <PolicyItem
          icon="login"
          title="Check-in Time"
          description={`Check-in is available from ${checkInTime} onwards`}
        />
        <PolicyItem
          icon="logout"
          title="Check-out Time"
          description={`Check-out must be completed by ${checkOutTime}`}
        />
        <PolicyItem
          icon="key"
          title="Self Check-in"
          description="You can check in with the lockbox"
        />
      </PolicySection>

      <PolicySection title="Guest Limits">
        <PolicyItem
          icon="group"
          title="Maximum Guests"
          description={`This property accommodates up to ${maxGuests} guests`}
        />
        <PolicyItem
          icon="child-care"
          title="Children"
          description="Children are welcome and count towards the guest limit"
        />
      </PolicySection>

      <PolicySection title="Property Policies">
        <PolicyItem
          icon={smokingAllowed ? "check-circle" : "cancel"}
          title="Smoking"
          description={
            smokingAllowed
              ? "Smoking is allowed in designated areas only"
              : "No smoking anywhere on the property"
          }
          highlight={!smokingAllowed}
        />
        <PolicyItem
          icon={petsAllowed ? "pets" : "cancel"}
          title="Pets"
          description={
            petsAllowed
              ? "Pets are welcome with prior approval"
              : "No pets allowed"
          }
          highlight={!petsAllowed}
        />
        <PolicyItem
          icon={partiesAllowed ? "celebration" : "cancel"}
          title="Parties & Events"
          description={
            partiesAllowed
              ? "Small gatherings allowed with prior notice"
              : "No parties or events allowed"
          }
          highlight={!partiesAllowed}
        />
      </PolicySection>

      <PolicySection title="Quiet Hours & Behavior">
        <PolicyItem
          icon="volume-off"
          title="Quiet Hours"
          description={`Please keep noise levels down during ${quietHours}`}
          highlight={true}
        />
        <PolicyItem
          icon="security"
          title="Respect the Space"
          description="Please treat the property with care and respect as if it were your own home"
        />
        <PolicyItem
          icon="local-police"
          title="Local Laws"
          description="Guests must comply with all local laws and regulations"
        />
      </PolicySection>

      <PolicySection title="Additional Guidelines">
        <PolicyItem
          icon="cleaning-services"
          title="Cleanliness"
          description="Please keep the property tidy during your stay"
        />
        <PolicyItem
          icon="no-food"
          title="Kitchen Use"
          description="Feel free to use the kitchen but please clean up after yourself"
        />
        <PolicyItem
          icon="wifi"
          title="Internet Usage"
          description="WiFi is provided for reasonable personal use"
        />
        <PolicyItem
          icon="warning"
          title="Violations"
          description="Violation of house rules may result in immediate termination of stay without refund"
          highlight={true}
        />
      </PolicySection>
    </PolicyScreen>
  );
};

export default HouseRulesScreen;
