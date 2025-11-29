

export interface Space {
    id: string;
    name: string;
    description?: string;
    location: string;
    capacity: number;
    price: number;
    purpose: 'Meeting' | 'Event' | 'Photoshoot' | 'Workshop' | 'Rooftop';
    facilities: string[];
    photoUrls: string[];
    rating: number;
    aiMatch?: number;
    surge?: boolean;
    sellerId: string;
    latitude?: number;
    longitude?: number;
    verified?: boolean;
    hotListing?: boolean;
}

export interface Booking {
    id: string;
    spaceId: string;
    buyerId: string;
    sellerId: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'declined';
    createdAt: any; // serverTimestamp
    spaceName: string;
    activity: { status: string; timestamp: any }[];
}


export interface ProviderProfile {
    id: string;
    userId: string;
    fullName: string;
    dob: string;
    phone: string;
    email: string;
    gender: string;
    profilePhotoUrl: string;
    aadhaarNumber: string;
    aadhaarFrontUrl: string;
    aadhaarBackUrl: string;
    panNumber: string;
    panUrl: string;
    selfieUrl: string;
    address: {
        door: string;
        street: string;
        area: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
    addressProofUrl: string;
    addressProofType: 'Electricity Bill' | 'Rent Agreement' | 'Bank Statement';
    liveLocation: {
        latitude: number;
        longitude: number;
    };
    securityQuestions: {
        why: string;
        experience: string;
        verifiedWork: string;
        emergencyContact: string;
    };
    verificationStatus: 'unverified' | 'pending_verification' | 'verified' | 'rejected';
    createdAt: any;
}

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    phoneNumber?: string;
    verificationStatus: 'unverified' | 'pending_verification' | 'verified' | 'rejected';
}

export interface Service {
    id: string;
    providerId: string;
    providerName: string;
    providerPhotoUrl: string;
    serviceCategory: string;
    skillDescription: string;
    experience: number;
    certifications: string[];
    portfolioImages: string[];
    costPerHour: number;
    costPerDay?: number;
    additionalCharges?: string;
    minimumHours: number;
    availability: {
        dates: string[];
        timeRanges: string;
    };
    locationRadius: number;
    verificationStatus: 'verified' | 'pending';
    createdAt: any;
}


export interface HireRequest {
    id: string;
    buyerId: string;
    buyerName: string;
    providerId: string;
    serviceId: string;
    date: string;
    startTime: string;
    endTime: string;
    venue: string;
    notes?: string;
    hours: number;
    totalCost: number;
    status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
    createdAt: any;
    service?: Service; // Denormalized for easier display
}
