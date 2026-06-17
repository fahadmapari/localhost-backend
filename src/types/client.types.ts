export interface UserRef {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhoneNumber {
  code: string;
  number: string;
}

export interface CompanyInformation {
  id: string;
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
  id: string;
  userId: UserRef;
  status: boolean;
  firstName: string;
  lastName: string;
  email: string;
  mobile: PhoneNumber;
  whatsapp: PhoneNumber;
  teamsId: string;
  position: string;
  boardedFromOnlinePortal: boolean;
  companyInformation: CompanyInformation;
  createdAt: string;
  updatedAt: string;
}
