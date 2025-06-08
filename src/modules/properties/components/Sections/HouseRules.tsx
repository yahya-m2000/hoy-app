import React from "react";
import PolicyScreen, {
  PolicySection,
  PolicyItem,
} from "../Details/PolicyScreen";

interface HouseRulesProps {
  onClose: () => void;
  houseRules?: {
    checkIn?: string;
    checkOut?: string;
    maxGuests?: number;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    partiesAllowed?: boolean;
    quietHours?: string;
    additionalRules?: string[];
  };
}

const HouseRules: React.FC<HouseRulesProps> = ({
  onClose,
  houseRules = {},
}) => {
  const {
    checkIn = "3:00 PM",
    checkOut = "11:00 AM",
    maxGuests = 2,
    smokingAllowed = false,
    petsAllowed = false,
    partiesAllowed = false,
    quietHours = "10:00 PM - 8:00 AM",
    additionalRules = [],
  } = houseRules;

  return (
    <PolicyScreen title="House Rules" icon="home" onClose={onClose}>
      <PolicySection title="Check-in & Check-out">
        <PolicyItem
          icon="login"
          title="Check-in"
          description={`Check-in is after ${checkIn}. Late check-in may be available upon request.`}
          highlight
        />

        <PolicyItem
          icon="logout"
          title="Check-out"
          description={`Check-out is before ${checkOut}. Late check-out may be available for an additional fee.`}
          highlight
        />
      </PolicySection>

      <PolicySection title="Occupancy & Guests">
        <PolicyItem
          icon="people"
          title="Maximum Guests"
          description={`This property accommodates up to ${maxGuests} guests. Additional guests may require host approval and extra fees.`}
        />

        <PolicyItem
          icon="child-care"
          title="Children Welcome"
          description="Children of all ages are welcome. Please ensure supervision at all times."
        />
      </PolicySection>

      <PolicySection title="Property Policies">
        <PolicyItem
          icon={smokingAllowed ? "check-circle" : "cancel"}
          title="Smoking"
          description={
            smokingAllowed
              ? "Smoking is allowed in designated areas only."
              : "This is a non-smoking property."
          }
        />

        <PolicyItem
          icon={petsAllowed ? "pets" : "cancel"}
          title="Pets"
          description={
            petsAllowed
              ? "Pets are welcome with prior approval. Additional fees may apply."
              : "No pets allowed."
          }
        />

        <PolicyItem
          icon={partiesAllowed ? "celebration" : "cancel"}
          title="Parties & Events"
          description={
            partiesAllowed
              ? "Small gatherings may be allowed with prior host approval."
              : "No parties or events allowed."
          }
        />
      </PolicySection>

      <PolicySection title="Quiet Hours & Respect">
        <PolicyItem
          icon="volume-off"
          title="Quiet Hours"
          description={`Please respect quiet hours from ${quietHours}. Be mindful of neighbors and other guests.`}
          highlight
        />

        <PolicyItem
          icon="security"
          title="Property Care"
          description="Please treat the property with care and respect. Report any damages immediately."
        />
      </PolicySection>

      {additionalRules.length > 0 && (
        <PolicySection title="Additional Rules">
          {additionalRules.map((rule, index) => (
            <PolicyItem
              key={index}
              icon="rule"
              title={`Rule ${index + 1}`}
              description={rule}
            />
          ))}
        </PolicySection>
      )}

      <PolicySection title="Compliance">
        <PolicyItem
          icon="gavel"
          title="Legal Compliance"
          description="Guests must comply with all local laws and regulations during their stay."
        />

        <PolicyItem
          icon="warning"
          title="Violation Consequences"
          description="Violation of house rules may result in immediate cancellation without refund."
        />
      </PolicySection>
    </PolicyScreen>
  );
};

export { HouseRules };
