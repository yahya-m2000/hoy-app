import React from "react";
import {
  OverlayScreen,

} from "@shared/components";
import { usePropertyPolicies } from "../../hooks/usePropertyPolicies";
import { useTheme } from "src/core/hooks/useTheme";
import { Container } from "src/shared";
import { BulletList, PolicyItem, PolicySection, RefundSchedule } from "src/features/host";


interface HouseRulesScreenProps {
  propertyId?: string;
  onClose?: () => void;
}

const HouseRulesScreen: React.FC<HouseRulesScreenProps> = ({
  propertyId,
  onClose,
}) => {
  const { theme } = useTheme();

  const { data: policies, isLoading } = usePropertyPolicies(propertyId || "");
  const houseRules = policies?.houseRules;
  return (
    <OverlayScreen
      headerIcon="home-outline"
      headerTitle="House Rules"
      headerSubtitle="Important rules and guidelines for your stay"
      isLoading={isLoading}
      loadingText="Loading..."
      errorText={!houseRules ? "House rules not available" : undefined}
      onClose={onClose}
      infoBoxText="Please respect all house rules during your stay. Contact your host if you have any questions about these guidelines. Violations may result in booking cancellation."
    >
      {houseRules && (
        <Container>
          {/* Check-in & Check-out Times */}
          <PolicySection title="Check-in & Check-out">
            <PolicyItem
              icon="log-in-outline"
              title="Check-in time"
              value={`${houseRules.checkInTime.from} - ${houseRules.checkInTime.to}`}
              description="Please arrive within these hours"
            />
            <PolicyItem
              icon="log-out-outline"
              title="Check-out time"
              value={`By ${houseRules.checkOutTime}`}
              description="Please vacate the property by this time"
            />
          </PolicySection>

          {/* Quiet Hours */}
          <PolicySection title="Quiet Hours">
            <PolicyItem
              icon="moon-outline"
              title="Quiet time"
              value={`${houseRules.quietHours.from} - ${houseRules.quietHours.to}`}
              description="Please keep noise to a minimum during these hours"
            />
          </PolicySection>

          {/* Property Policies */}
          <PolicySection title="Property Policies">
            <PolicyItem
              icon={
                houseRules.smokingAllowed ? "checkmark-circle" : "ban-outline"
              }
              title="Smoking"
              value={
                houseRules.smokingAllowed ? "Smoking allowed" : "No smoking"
              }
              description={
                houseRules.smokingAllowed
                  ? "Smoking is permitted"
                  : "Smoking is not permitted anywhere on the property"
              }
              positive={houseRules.smokingAllowed}
            />
            <PolicyItem
              icon={houseRules.petsAllowed ? "paw-outline" : "ban-outline"}
              title="Pets"
              value={
                houseRules.petsAllowed ? "Pets allowed" : "No pets allowed"
              }
              description={
                houseRules.petsAllowed
                  ? "Pets are welcome"
                  : "Pets are not permitted on the property"
              }
              positive={houseRules.petsAllowed}
            />
            <PolicyItem
              icon={
                houseRules.partiesAllowed
                  ? "musical-notes-outline"
                  : "ban-outline"
              }
              title="Events & Parties"
              value={
                houseRules.partiesAllowed
                  ? "Events allowed"
                  : "No parties or events"
              }
              description={
                houseRules.partiesAllowed
                  ? "Events and parties are permitted"
                  : "Parties and events are not allowed"
              }
              positive={houseRules.partiesAllowed}
            />
          </PolicySection>

          {/* Additional Rules */}
          {houseRules.additionalRules &&
            houseRules.additionalRules.length > 0 && (
              <PolicySection title="Additional Rules">
                <BulletList
                  items={houseRules.additionalRules}
                  iconColor={theme.colors.primary}
                />
              </PolicySection>
            )}
        </Container>
      )}
    </OverlayScreen>
  );
};

export default HouseRulesScreen;
