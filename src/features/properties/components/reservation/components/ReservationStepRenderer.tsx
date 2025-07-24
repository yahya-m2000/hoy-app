/**
 * Component to render the current reservation step
 *
 * @module @features/properties/components/reservation/components/ReservationStepRenderer
 */

import React from "react";
import { GuestStep, PaymentStep, ConfirmationStep } from "../steps";
import type { ReservationStepProps } from "../../../types/reservation.types";
import { RESERVATION_STEPS } from "../constants/reservationConstants";

interface ReservationStepRendererProps extends ReservationStepProps {
  step: number;
  isCheckingAvailability: boolean;
  isAvailable: boolean | null;
  onAvailabilityChange: (available: boolean | null, checking: boolean) => void;
  onSelectRange: (start: Date, end: Date) => void;
  onChangeAdults: (count: number) => void;
  onChangeChildren: (count: number) => void;
  onChangeInfants: (count: number) => void;
  onChangePets: (count: number) => void;
  onSelectPaymentMethod: (method: any) => void;
}

export function ReservationStepRenderer({
  step,
  startDate,
  endDate,
  adults,
  childrenCount,
  infants,
  pets,
  selectedPaymentMethod,
  property,
  unit,
  isCheckingAvailability,
  isAvailable,
  onEditDates,
  onEditGuests,
  formatDate,
  calculateNights,
  onAvailabilityChange,
  onSelectRange,
  onChangeAdults,
  onChangeChildren,
  onChangeInfants,
  onChangePets,
  onSelectPaymentMethod,
}: ReservationStepRendererProps) {
  switch (step) {
    case RESERVATION_STEPS.GUEST_DETAILS:
      return (
        <GuestStep
          startDate={startDate}
          endDate={endDate}
          adults={adults}
          childrenCount={childrenCount}
          infants={infants}
          pets={pets}
          onChangeAdults={onChangeAdults}
          onChangeChildren={onChangeChildren}
          onChangeInfants={onChangeInfants}
          onChangePets={onChangePets}
          maxGuests={property?.maxGuests || 10}
          formatDate={formatDate}
          calculateNights={calculateNights}
          onEditDates={onEditDates}
        />
      );

    case RESERVATION_STEPS.PAYMENT_METHOD:
      return (
        <PaymentStep
          startDate={startDate}
          endDate={endDate}
          adults={adults}
          childrenCount={childrenCount}
          pets={pets}
          selectedPaymentMethod={selectedPaymentMethod}
          onSelectPaymentMethod={onSelectPaymentMethod}
          formatDate={formatDate}
          onEditDates={onEditDates}
          onEditGuests={onEditGuests || (() => {})}
        />
      );

    case RESERVATION_STEPS.CONFIRMATION:
      return (
        <ConfirmationStep
          property={property}
          startDate={startDate}
          endDate={endDate}
          adults={adults}
          childrenCount={childrenCount}
          infants={infants}
          pets={pets}
          selectedPaymentMethod={selectedPaymentMethod}
          priceDetails={null}
          safePropertyPrice={unit?.price || property?.price || 0}
          formatDate={formatDate}
          calculateNights={calculateNights}
        />
      );

    default:
      return null;
  }
}
