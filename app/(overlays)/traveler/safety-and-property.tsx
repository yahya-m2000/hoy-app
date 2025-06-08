import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PolicyScreen, PolicySection, PolicyItem } from "@modules/properties";

const SafetyAndPropertyScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse safety features from params (would typically come from property data)
  const hasSmokeDetetor = params.smokeDetector !== "false";
  const hasCarbonMonoxideDetector = params.carbonMonoxideDetector !== "false";
  const hasFireExtinguisher = params.fireExtinguisher !== "false";
  const hasFirstAidKit = params.firstAidKit !== "false";
  const hasSecurityCamera = params.securityCamera === "true";
  const hasPool = params.pool === "true";
  const hasBalcony = params.balcony === "true";

  return (
    <PolicyScreen
      title="Safety & Property"
      icon="security"
      onClose={() => router.back()}
    >
      <PolicySection title="Safety Equipment">
        <PolicyItem
          icon={hasSmokeDetetor ? "check-circle" : "warning"}
          title="Smoke Detector"
          description={
            hasSmokeDetetor
              ? "Smoke detector is installed and functional"
              : "No smoke detector present"
          }
          highlight={!hasSmokeDetetor}
        />
        <PolicyItem
          icon={hasCarbonMonoxideDetector ? "check-circle" : "warning"}
          title="Carbon Monoxide Detector"
          description={
            hasCarbonMonoxideDetector
              ? "Carbon monoxide detector is installed and functional"
              : "No carbon monoxide detector present"
          }
          highlight={!hasCarbonMonoxideDetector}
        />
        <PolicyItem
          icon={hasFireExtinguisher ? "check-circle" : "info"}
          title="Fire Extinguisher"
          description={
            hasFireExtinguisher
              ? "Fire extinguisher is available on the property"
              : "No fire extinguisher available"
          }
        />
        <PolicyItem
          icon={hasFirstAidKit ? "check-circle" : "info"}
          title="First Aid Kit"
          description={
            hasFirstAidKit
              ? "First aid kit is available for emergencies"
              : "No first aid kit available"
          }
        />
      </PolicySection>

      <PolicySection title="Security Features">
        <PolicyItem
          icon="lock"
          title="Secure Entry"
          description="Property has secure locking mechanisms on all entry points"
        />
        <PolicyItem
          icon={hasSecurityCamera ? "videocam" : "videocam-off"}
          title="Security Cameras"
          description={
            hasSecurityCamera
              ? "Security cameras are present in common outdoor areas only"
              : "No security cameras on the property"
          }
        />
        <PolicyItem
          icon="lightbulb"
          title="Exterior Lighting"
          description="Well-lit pathways and entrances for safety"
        />
      </PolicySection>

      {(hasPool || hasBalcony) && (
        <PolicySection title="Potential Hazards">
          {hasPool && (
            <PolicyItem
              icon="pool"
              title="Swimming Pool"
              description="Pool area present - supervise children at all times, swim at your own risk"
              highlight={true}
            />
          )}
          {hasBalcony && (
            <PolicyItem
              icon="balcony"
              title="Balcony/Elevated Areas"
              description="Property has balcony or elevated areas - exercise caution, especially with children"
              highlight={true}
            />
          )}
        </PolicySection>
      )}

      <PolicySection title="Emergency Procedures">
        <PolicyItem
          icon="local-hospital"
          title="Emergency Services"
          description="In case of emergency, dial local emergency services immediately"
          highlight={true}
        />
        <PolicyItem
          icon="phone"
          title="Emergency Contacts"
          description="Host contact information is available in the welcome guide"
        />
        <PolicyItem
          icon="location-on"
          title="Property Address"
          description="Full property address is provided for emergency services if needed"
        />
        <PolicyItem
          icon="exit-to-app"
          title="Emergency Exits"
          description="Familiarize yourself with all exits and emergency escape routes"
        />
      </PolicySection>

      <PolicySection title="Guest Responsibilities">
        <PolicyItem
          icon="health-and-safety"
          title="Safety Awareness"
          description="Guests are responsible for their own safety and the safety of their party"
        />
        <PolicyItem
          icon="report-problem"
          title="Report Issues"
          description="Please report any safety concerns or equipment malfunctions immediately"
        />
        <PolicyItem
          icon="child-care"
          title="Child Supervision"
          description="Parents/guardians must supervise children at all times"
        />{" "}
        <PolicyItem
          icon="smoke-free"
          title="Fire Safety"
          description="Follow all fire safety guidelines and smoking policies"
        />
      </PolicySection>

      <PolicySection title="Property Care">
        <PolicyItem
          icon="home-repair-service"
          title="Maintenance"
          description="Property is regularly maintained for safety and comfort"
        />
        <PolicyItem
          icon="electrical-services"
          title="Electrical Safety"
          description="All electrical systems are inspected and up to code"
        />
        <PolicyItem
          icon="plumbing"
          title="Plumbing"
          description="Plumbing systems are maintained and functional"
        />
        <PolicyItem
          icon="eco"
          title="Environmental"
          description="Property follows environmental safety standards"
        />
      </PolicySection>
    </PolicyScreen>
  );
};

export default SafetyAndPropertyScreen;
