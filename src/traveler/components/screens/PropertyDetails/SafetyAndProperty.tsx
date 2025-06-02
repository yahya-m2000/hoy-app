import React from "react";
import PolicyScreen, { PolicySection, PolicyItem } from "./PolicyScreen";

interface SafetyAndPropertyProps {
  onClose: () => void;
  safetyFeatures?: {
    smokeDetector?: boolean;
    carbonMonoxideDetector?: boolean;
    fireExtinguisher?: boolean;
    firstAidKit?: boolean;
    securityCamera?: boolean;
    poolSafety?: boolean;
    weaponsPresent?: boolean;
    dangerousAnimals?: boolean;
    additionalSafety?: string[];
  };
}

const SafetyAndProperty: React.FC<SafetyAndPropertyProps> = ({
  onClose,
  safetyFeatures = {},
}) => {
  const {
    smokeDetector = true,
    carbonMonoxideDetector = true,
    fireExtinguisher = true,
    firstAidKit = false,
    securityCamera = false,
    poolSafety = false,
    weaponsPresent = false,
    dangerousAnimals = false,
    additionalSafety = [],
  } = safetyFeatures;

  return (
    <PolicyScreen title="Safety & Property" icon="shield" onClose={onClose}>
      <PolicySection title="Safety Equipment">
        <PolicyItem
          icon={smokeDetector ? "check-circle" : "warning"}
          title="Smoke Detector"
          description={
            smokeDetector
              ? "Smoke detector is installed and functioning."
              : "No smoke detector reported."
          }
          highlight={smokeDetector}
        />

        <PolicyItem
          icon={carbonMonoxideDetector ? "check-circle" : "warning"}
          title="Carbon Monoxide Detector"
          description={
            carbonMonoxideDetector
              ? "Carbon monoxide detector is installed and functioning."
              : "No carbon monoxide detector reported."
          }
          highlight={carbonMonoxideDetector}
        />

        <PolicyItem
          icon={fireExtinguisher ? "check-circle" : "info"}
          title="Fire Extinguisher"
          description={
            fireExtinguisher
              ? "Fire extinguisher is available on the property."
              : "No fire extinguisher reported."
          }
        />

        <PolicyItem
          icon={firstAidKit ? "check-circle" : "info"}
          title="First Aid Kit"
          description={
            firstAidKit
              ? "First aid kit is available for guest use."
              : "No first aid kit available."
          }
        />
      </PolicySection>

      <PolicySection title="Security & Surveillance">
        <PolicyItem
          icon={securityCamera ? "videocam" : "videocam-off"}
          title="Security Cameras"
          description={
            securityCamera
              ? "External security cameras may be present for property security."
              : "No security cameras on the property."
          }
        />

        <PolicyItem
          icon="lock"
          title="Property Security"
          description="Please ensure all doors and windows are locked when leaving the property."
        />
      </PolicySection>

      <PolicySection title="Potential Hazards">
        {poolSafety && (
          <PolicyItem
            icon="pool"
            title="Pool Safety"
            description="Pool area requires supervision. Children must be accompanied by adults at all times."
            highlight
          />
        )}

        <PolicyItem
          icon={weaponsPresent ? "warning" : "check-circle"}
          title="Weapons on Property"
          description={
            weaponsPresent
              ? "Host has disclosed the presence of weapons on the property."
              : "No weapons reported on the property."
          }
        />

        <PolicyItem
          icon={dangerousAnimals ? "warning" : "check-circle"}
          title="Dangerous Animals"
          description={
            dangerousAnimals
              ? "Host has disclosed the presence of potentially dangerous animals nearby."
              : "No dangerous animals reported in the area."
          }
        />
      </PolicySection>

      <PolicySection title="Property Information">
        <PolicyItem
          icon="stairs"
          title="Stairs & Accessibility"
          description="Please be aware of any stairs or accessibility considerations when moving around the property."
        />

        <PolicyItem
          icon="local-hospital"
          title="Emergency Services"
          description="Familiarize yourself with the location of the nearest hospital and emergency services."
        />

        <PolicyItem
          icon="wifi"
          title="Internet & Communication"
          description="Reliable internet connection available. Emergency contact information is provided in the welcome guide."
        />
      </PolicySection>

      {additionalSafety.length > 0 && (
        <PolicySection title="Additional Safety Information">
          {additionalSafety.map((info, index) => (
            <PolicyItem
              key={index}
              icon="info"
              title={`Safety Note ${index + 1}`}
              description={info}
            />
          ))}
        </PolicySection>
      )}

      <PolicySection title="Emergency Procedures">
        <PolicyItem
          icon="local-fire-department"
          title="Fire Emergency"
          description="In case of fire, evacuate immediately and call local emergency services. Do not use elevators."
          highlight
        />

        <PolicyItem
          icon="local-hospital"
          title="Medical Emergency"
          description="For medical emergencies, call local emergency services immediately. Contact information is in the welcome guide."
          highlight
        />

        <PolicyItem
          icon="support-agent"
          title="Host Contact"
          description="For non-emergency property issues, contact the host first. Emergency contact details are provided separately."
        />
      </PolicySection>
    </PolicyScreen>
  );
};

export { SafetyAndProperty };
