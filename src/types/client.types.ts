export interface UserRef {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface PhoneNumber {
  code: string;
  number: string;
}

export interface CompanyInformation {
  _id: string;
  name: string;
  address: string;
  zipCode: string;
  country: string;
  city: string;
  telephone: PhoneNumber;
  fax: PhoneNumber;
  VATNumber: string;
  email: string;
  preferredLanguage: string;
  currency: string;
  associationName: string;
  paymentAgreement: string;
}

export interface ClientProfile {
  _id: string;
  userId: UserRef;
  status: boolean;
  profileType: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: PhoneNumber;
  whatsapp: PhoneNumber;
  teamsId: string;
  position: string;
  boardedFromOnlinePortal: boolean;
  companyInformation: CompanyInformation;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}
