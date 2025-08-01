export interface EditedProduct {
  id: string;
  title: string;
  serviceType: "guide" | "assistant";
  tourType: "shared" | "private";
  activityType: "city tours";
  subType: "walking tours";
  description: string;
  willSee: string[];
  willLearn: string[];
  tourTextLanguage: "english";
  bookingType: "instant" | "request";
  tourGuideLanguage: string;
  tourGuideLanguageInstant?: string[];
  tourGuideLanguageOnRequest: string[];
  mandatoryInformation: string[];
  recommdendedInformation: string[];
  included: string[];
  excluded: string[];
  activitySuitableFor: "all" | "adults" | "children";
  voucherType:
    | "printed or e-voucher accepted"
    | "printed"
    | "e-voucher accepted";
  maxPax: number;
  meetingPoint: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    text: string;
    pickupInstructions?: string[];
  };
  endPoint?: {
    latitude?: number;
    longitude?: number;
    text: string;
  };
  tags: (
    | "walk"
    | "museum"
    | "palace"
    | "science"
    | "technology"
    | "beer"
    | "christmas"
    | undefined
  )[];
  existingImages?: string[];
  priceModel: "fixed rate" | "per pax";
  currency: "USD" | "EUR" | "GBP" | "INR";
  b2bRateInstant: number;
  b2bExtraHourSupplementInsant?: number | undefined;
  b2bRateOnRequest: number | undefined;
  b2bExtraHourSupplementOnRequest?: number | undefined;
  b2cRateInstant: number;
  b2cExtraHourSupplementInstant?: number | undefined;
  b2cRateOnRequest: number | undefined;
  b2cExtraHourSupplementOnRequest?: number | undefined;
  closedDates?: Date[];
  holidayDates?: Date[];
  publicHolidaySupplementPercent: number;
  weekendSupplementPercent: number;
  availability: {
    startTime: string;
    endTime: string;
    duration: {
      value: number;
      unit: "minutes" | "hours" | "days";
    };
  };
  cancellationTerms: string[];
  realease: string;
  isB2B: boolean;
  isB2C: boolean;
  overridePriceFromContract: boolean;
  isBookingPerProduct: boolean;
  productCode: string;
  baseProductId: string;
}
