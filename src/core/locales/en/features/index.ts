import calendar from "./calendar.json";
import accountProfile from "./account/profile.json";
import accountQrCode from "./account/qrCode.json";
import authForms from "./auth/forms.json";
import authLegal from "./auth/legal.json";
import authSocial from "./auth/social.json";
import bookingCalendar from "./booking/calendar.json";
import bookingCancellation from "./booking/cancellation.json";
import bookingCommunication from "./booking/communication.json";
import bookingConfirmation from "./booking/confirmation.json";
import bookingDetails from "./booking/details.json";
import bookingFlow from "./booking/flow.json";
import bookingLocation from "./booking/location.json";
import bookingManagement from "./booking/management.json";
import bookingErrors from "./booking/errors.json";
import bookingPayment from "./booking/payment.json";
import bookingActions from "./booking/actions.json";
import homeContent from "./home/content.json";
import hostCalendarAvailability from "./host/calendar/availability.json";
import hostCalendarBookings from "./host/calendar/bookings.json";
import hostCalendarGeneral from "./host/calendar/general.json";
import hostDashboardActivity from "./host/dashboard/activity.json";
import hostDashboardEarnings from "./host/dashboard/earnings.json";
import hostDashboardMain from "./host/dashboard/main.json";
import hostDashboardReservations from "./host/dashboard/reservations.json";
import hostDashboardStatus from "./host/dashboard/status.json";
import hostListingsManagement from "./host/listings/management.json";
import hostSetupAgreement from "./host/setup/agreement.json";
import hostSetupErrors from "./host/setup/errors.json";
import hostSetupMain from "./host/setup/main.json";
import hostSetupNavigation from "./host/setup/navigation.json";
import hostSetupPolicies from "./host/setup/policies.json";
import hostSetupPreferences from "./host/setup/preferences.json";
import hostSetupProfile from "./host/setup/profile.json";
import hostSetupSuccess from "./host/setup/success.json";
import hostSetupValidation from "./host/setup/validation.json";
import hostSetupVerification from "./host/setup/verification.json";
import propertyDetailsAmenities from "./property/details/amenities.json";
import propertyDetailsCommon from "./property/details/common.json";
import propertyDetailsImages from "./property/details/images.json";
import propertyDetailsPricing from "./property/details/pricing.json";
import propertyDetailsTypes from "./property/details/types.json";
import propertyDetailsPolicies from "./property/details/policies.json";
import propertyDetailsHost from "./property/details/host.json";
import propertyDetailsGeneral from "./property/details/general.json";
import propertyDetailsActions from "./property/details/actions.json";
import propertyDetailsDates from "./property/details/dates.json";
import propertyDetailsLocation from "./property/details/location.json";
import propertyDetailsHouseRules from "./property/details/houseRules.json";
import propertyReviews from "./property/reviews.json";
import propertyListingForms from "./property/listing/forms.json";
import propertyListingSteps from "./property/listing/steps.json";
import propertyListingValidation from "./property/listing/validation.json";
import propertyListingAlerts from "./property/listing/alerts.json";
import propertyListingAmenities from "./property/listing/amenities.json";
import propertyListingTags from "./property/listing/tags.json";
import propertyListingPricing from "./property/listing/pricing.json";
import propertyListingPolicies from "./property/listing/policies.json";
import propertyListingActions from "./property/listing/actions.json";
import propertyListingCommon from "./property/listing/common.json";
import propertyListingDetails from "./property/listing/details.json";
import propertyManagementAlerts from "./property/management/alerts.json";
import propertyManagementErrors from "./property/management/errors.json";
import propertyManagementOptions from "./property/management/options.json";
import propertyManagementActions from "./property/management/actions.json";
import propertyManagementGeneral from "./property/management/general.json";
import propertyManagementStatus from "./property/management/status.json";
import propertyManagementAnalytics from "./property/management/analytics.json";
import propertyManagementDetails from "./property/management/details.json";
import propertyManagementPricing from "./property/management/pricing.json";
import propertyManagementPolicies from "./property/management/policies.json";
import searchFilters from "./search/filters.json";
import searchResults from "./search/results.json";
import searchLocation from "./search/location.json";
import searchDates from "./search/dates.json";
import searchTravelers from "./search/travelers.json";
import wishlistManagement from "./wishlist/management.json";
import wishlistContent from "./wishlist/content.json";
import profileIndex from "./profile/index.json";

export default {
    calendar,
    account: {
      profile: accountProfile,
      qrCode: accountQrCode
    },
    auth: {
      forms: authForms,
      legal: authLegal,
      social: authSocial
    },
    booking: {
      calendar: bookingCalendar,
      cancellation: bookingCancellation,
      communication: bookingCommunication,
      confirmation: bookingConfirmation,
      details: bookingDetails,
      flow: bookingFlow,
      location: bookingLocation,
      management: bookingManagement,
      errors: bookingErrors,
      payment: bookingPayment,
      actions: bookingActions
    },
    home: {
      content: homeContent
    },
    host: {
      calendar: {
        availability: hostCalendarAvailability,
        bookings: hostCalendarBookings,
        general: hostCalendarGeneral
      },
      dashboard: {
        activity: hostDashboardActivity,
        earnings: hostDashboardEarnings,
        main: hostDashboardMain,
        reservations: hostDashboardReservations,
        status: hostDashboardStatus
      },
      listings: {
        management: hostListingsManagement
      },
      setup: {
        agreement: hostSetupAgreement,
        errors: hostSetupErrors,
        main: hostSetupMain,
        navigation: hostSetupNavigation,
        policies: hostSetupPolicies,
        preferences: hostSetupPreferences,
        profile: hostSetupProfile,
        success: hostSetupSuccess,
        validation: hostSetupValidation,
        verification: hostSetupVerification
      }
    },
    property: {
      details: {
        amenities: propertyDetailsAmenities,
        common: propertyDetailsCommon,
        images: propertyDetailsImages,
        pricing: propertyDetailsPricing,
        types: propertyDetailsTypes,
        policies: propertyDetailsPolicies,
        host: propertyDetailsHost,
        general: propertyDetailsGeneral,
        actions: propertyDetailsActions,
        dates: propertyDetailsDates,
        location: propertyDetailsLocation,
        houseRules: propertyDetailsHouseRules
      },
      reviews: propertyReviews,
      listing: {
        forms: propertyListingForms,
        steps: propertyListingSteps,
        validation: propertyListingValidation,
        alerts: propertyListingAlerts,
        amenities: propertyListingAmenities,
        tags: propertyListingTags,
        pricing: propertyListingPricing,
        policies: propertyListingPolicies,
        actions: propertyListingActions,
        common: propertyListingCommon,
        details: propertyListingDetails
      },
      management: {
        alerts: propertyManagementAlerts,
        errors: propertyManagementErrors,
        options: propertyManagementOptions,
        actions: propertyManagementActions,
        general: propertyManagementGeneral,
        status: propertyManagementStatus,
        analytics: propertyManagementAnalytics,
        details: propertyManagementDetails,
        pricing: propertyManagementPricing,
        policies: propertyManagementPolicies
      }
    },
    search: {
      ...searchFilters,
      results: searchResults,
      location: searchLocation,
      dates: searchDates,
      travelers: searchTravelers
    },
    wishlist: {
      management: wishlistManagement,
      content: wishlistContent
    },
    profile: profileIndex
  }
