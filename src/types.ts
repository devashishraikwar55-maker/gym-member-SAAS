export interface MembershipHistory {
  id: string;
  planName: string;
  fee: number;
  joiningDate: string;
  expiryDate: string;
  status: 'Completed' | 'Cancelled' | 'Active';
  renewedAt?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Couple';
  age: number;
  address: string;
  membershipPlanId: string;
  membershipFee: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Pending';
  joiningDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  duration: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'Cancelled';
  profilePhoto?: string;
  notes?: string;
  history: MembershipHistory[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  duration: string;
  durationMonths: number;
  fee: number;
  description: string;
  features: string[];
}

export interface ActivityLog {
  id: string;
  memberId: string;
  memberName: string;
  type: 'joined' | 'renewed' | 'status_change' | 'cancelled' | 'edited';
  description: string;
  timestamp: string; // ISO String
}

export interface SystemSettings {
  gymName: string;
  ownerName?: string;
  currency: string;
  reminderTemplates: {
    expiringToday: string;
    expiring3Days: string;
    expiring7Days: string;
  };
}

// Fixed application current date: July 4, 2026
export const CURRENT_DATE_STR = '2026-07-04';

export const INITIAL_PLANS: MembershipPlan[] = [
  {
    id: 'plan-1',
    name: '1 Month Plan',
    duration: '1 Month',
    durationMonths: 1,
    fee: 2000,
    description: 'Perfect for beginners looking to try out our premium facilities.',
    features: ['Access to cardio & strength area', 'Locker room access', '1 Fitness assessment', 'Standard hours (6 AM - 10 PM)'],
  },
  {
    id: 'plan-2',
    name: '2 Months Plan',
    duration: '2 Months',
    durationMonths: 2,
    fee: 3800,
    description: 'Perfect for intermediate training.',
    features: ['Access to cardio & strength area', 'Locker room access', '1 Fitness assessment', 'Standard hours (6 AM - 10 PM)'],
  },
  {
    id: 'plan-3',
    name: '3 Months Plan',
    duration: '3 Months',
    durationMonths: 3,
    fee: 5000,
    description: 'Great value for those with solid intermediate fitness goals.',
    features: ['All Basic features', 'Access to group classes', '2 Trainer sessions', 'Extended hours (5 AM - Midnight)'],
  },
  {
    id: 'plan-4',
    name: '4 Months Plan',
    duration: '4 Months',
    durationMonths: 4,
    fee: 6500,
    description: 'Extended intermediate plan for committed members.',
    features: ['All Basic features', 'Access to group classes', '2 Trainer sessions', 'Extended hours (5 AM - Midnight)'],
  },
  {
    id: 'plan-5',
    name: '5 Months Plan',
    duration: '5 Months',
    durationMonths: 5,
    fee: 8000,
    description: 'Perfect medium-term plan for fitness progress.',
    features: ['All Basic features', 'Access to group classes', '3 Trainer sessions', 'Extended hours (5 AM - Midnight)'],
  },
  {
    id: 'plan-6',
    name: '6 Months Plan',
    duration: '6 Months',
    durationMonths: 6,
    fee: 9500,
    description: 'Our most popular semi-annual plan for committed fitness enthusiasts.',
    features: ['All Standard features', 'Unlimited group & yoga classes', '5 Personal trainer sessions', 'Free hydration drinks', '24/7 Keycard access'],
  },
  {
    id: 'plan-7',
    name: '7 Months Plan',
    duration: '7 Months',
    durationMonths: 7,
    fee: 11000,
    description: 'Sustained fitness plan with excellent extra features.',
    features: ['All Standard features', 'Unlimited group & yoga classes', '5 Personal trainer sessions', 'Free hydration drinks', '24/7 Keycard access'],
  },
  {
    id: 'plan-8',
    name: '8 Months Plan',
    duration: '8 Months',
    durationMonths: 8,
    fee: 12500,
    description: 'Designed for long-term health and strength gains.',
    features: ['All Standard features', 'Unlimited group & yoga classes', '5 Personal trainer sessions', 'Free hydration drinks', '24/7 Keycard access'],
  },
  {
    id: 'plan-9',
    name: '9 Months Plan',
    duration: '9 Months',
    durationMonths: 9,
    fee: 14000,
    description: 'Comprehensive fitness journey plan.',
    features: ['All Standard features', 'Unlimited group & yoga classes', '5 Personal trainer sessions', 'Free hydration drinks', '24/7 Keycard access'],
  },
  {
    id: 'plan-10',
    name: '10 Months Plan',
    duration: '10 Months',
    durationMonths: 10,
    fee: 15500,
    description: 'Committed fitness investment for continuous development.',
    features: ['All Standard features', 'Unlimited group & yoga classes', '5 Personal trainer sessions', 'Free hydration drinks', '24/7 Keycard access'],
  },
  {
    id: 'plan-11',
    name: '11 Months Plan',
    duration: '11 Months',
    durationMonths: 11,
    fee: 17000,
    description: 'Sub-annual professional membership.',
    features: ['All Standard features', 'Unlimited group & yoga classes', '5 Personal trainer sessions', 'Free hydration drinks', '24/7 Keycard access'],
  },
  {
    id: 'plan-12',
    name: '12 Months Plan',
    duration: '12 Months',
    durationMonths: 12,
    fee: 18000,
    description: 'The ultimate fitness investment. Fully featured with extreme savings.',
    features: ['All Power features', 'Unlimited personal training (1/week)', 'Nutrition planning & diet charts', 'Spa & sauna access', 'Guest passes (2/month)'],
  },
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    name: 'Rahul Sharma',
    phone: '123456789',
    gender: 'Male',
    age: 28,
    address: '104, Sector 15, Dwarka, New Delhi',
    membershipPlanId: 'plan-1',
    membershipFee: 2000,
    paymentStatus: 'Paid',
    joiningDate: '2026-06-07',
    expiryDate: '2026-07-07', // Expiring in 3 days
    duration: '1 Month',
    status: 'Expiring',
    profilePhoto: 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/male.png',
    history: [
      {
        id: 'hist-1',
        planName: '1 Month Plan',
        fee: 2000,
        joiningDate: '2026-06-07',
        expiryDate: '2026-07-07',
        status: 'Active',
      }
    ]
  },
  {
    id: 'mem-2',
    name: 'Neha Singh',
    phone: '123456789',
    gender: 'Female',
    age: 25,
    address: 'B-45, Green Park, South Ext, New Delhi',
    membershipPlanId: 'plan-1',
    membershipFee: 2000,
    paymentStatus: 'Paid',
    joiningDate: '2026-06-04',
    expiryDate: '2026-07-04', // Expiring Today
    duration: '1 Month',
    status: 'Expiring',
    profilePhoto: 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/female.png',
    history: [
      {
        id: 'hist-2',
        planName: '1 Month Plan',
        fee: 2000,
        joiningDate: '2026-06-04',
        expiryDate: '2026-07-04',
        status: 'Active',
      }
    ]
  },
  {
    id: 'mem-3',
    name: 'Amit & Sunita Verma',
    phone: '123456789',
    gender: 'Couple',
    age: 31,
    address: 'Flat 502, Orchid Apartments, Noida Sec 62',
    membershipPlanId: 'plan-3',
    membershipFee: 5000,
    paymentStatus: 'Paid',
    joiningDate: '2026-04-09',
    expiryDate: '2026-07-09', // Expiring in 5 days
    duration: '3 Months',
    status: 'Expiring',
    profilePhoto: 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/couple.png',
    history: [
      {
        id: 'hist-3',
        planName: '3 Months Plan',
        fee: 5000,
        joiningDate: '2026-04-09',
        expiryDate: '2026-07-09',
        status: 'Active',
      }
    ]
  },
  {
    id: 'mem-4',
    name: 'Sahil Khan',
    phone: '123456789',
    gender: 'Male',
    age: 29,
    address: 'House 14, Gali 2, Jamia Nagar, New Delhi',
    membershipPlanId: 'plan-1',
    membershipFee: 2000,
    paymentStatus: 'Paid',
    joiningDate: '2026-06-12',
    expiryDate: '2026-07-12', // Expiring in 8 days -> Active
    duration: '1 Month',
    status: 'Active',
    profilePhoto: 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/male.png',
    history: [
      {
        id: 'hist-4',
        planName: '1 Month Plan',
        fee: 2000,
        joiningDate: '2026-06-12',
        expiryDate: '2026-07-12',
        status: 'Active',
      }
    ]
  },
  {
    id: 'mem-5',
    name: 'Karan Patel',
    phone: '123456789',
    gender: 'Male',
    age: 34,
    address: 'A-201, Elite Residency, Gurugram Sec 45',
    membershipPlanId: 'plan-1',
    membershipFee: 2000,
    paymentStatus: 'Paid',
    joiningDate: '2026-05-30',
    expiryDate: '2026-06-30', // Expired June 30th
    duration: '1 Month',
    status: 'Expired',
    profilePhoto: 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/male.png',
    history: [
      {
        id: 'hist-5',
        planName: '1 Month Plan',
        fee: 2000,
        joiningDate: '2026-05-30',
        expiryDate: '2026-06-30',
        status: 'Completed',
      }
    ]
  },
  {
    id: 'mem-6',
    name: 'Rohit Kumar',
    phone: '123456789',
    gender: 'Male',
    age: 27,
    address: 'C-3, Patel Nagar, West Delhi',
    membershipPlanId: 'plan-3',
    membershipFee: 5000,
    paymentStatus: 'Paid',
    joiningDate: '2026-03-20',
    expiryDate: '2026-06-20', // Expired June 20th
    duration: '3 Months',
    status: 'Expired',
    profilePhoto: 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/male.png',
    history: [
      {
        id: 'hist-6',
        planName: '3 Months Plan',
        fee: 5000,
        joiningDate: '2026-03-20',
        expiryDate: '2026-06-20',
        status: 'Completed',
      }
    ]
  },
  {
    id: 'mem-7',
    name: 'Pooja Patel',
    phone: '123456789',
    gender: 'Female',
    age: 26,
    address: '78, Vasant Kunj, Pocket B, New Delhi',
    membershipPlanId: 'plan-6',
    membershipFee: 9500,
    paymentStatus: 'Paid',
    joiningDate: '2026-02-24',
    expiryDate: '2026-08-24', // Active, far out
    duration: '6 Months',
    status: 'Active',
    profilePhoto: 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/female.png',
    history: [
      {
        id: 'hist-7',
        planName: '6 Months Plan',
        fee: 9500,
        joiningDate: '2026-02-24',
        expiryDate: '2026-08-24',
        status: 'Active',
      }
    ]
  },
  {
    id: 'mem-9',
    name: 'Vikram Mehta',
    phone: '123456789',
    gender: 'Male',
    age: 36,
    address: 'F-12, Malviya Nagar, New Delhi',
    membershipPlanId: 'plan-12',
    membershipFee: 18000,
    paymentStatus: 'Paid',
    joiningDate: '2025-12-15',
    expiryDate: '2026-12-15', // Active
    duration: '12 Months',
    status: 'Active',
    profilePhoto: 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/male.png',
    history: [
      {
        id: 'hist-9',
        planName: '12 Months Plan',
        fee: 18000,
        joiningDate: '2025-12-15',
        expiryDate: '2026-12-15',
        status: 'Active',
      }
    ]
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    memberId: 'mem-1',
    memberName: 'Rahul Sharma',
    type: 'joined',
    description: 'Joined the gym with Monthly Basic plan',
    timestamp: '2026-06-07T10:30:00Z',
  },
  {
    id: 'log-2',
    memberId: 'mem-8',
    memberName: 'Aman Singh',
    type: 'cancelled',
    description: 'Cancelled membership due to medical reasons (knee injury)',
    timestamp: '2026-06-15T15:45:00Z',
  },
  {
    id: 'log-3',
    memberId: 'mem-2',
    memberName: 'Neha Singh',
    type: 'status_change',
    description: 'Membership status marked as Expiring Soon',
    timestamp: '2026-06-27T09:00:00Z',
  },
  {
    id: 'log-4',
    memberId: 'mem-5',
    memberName: 'Karan Patel',
    type: 'status_change',
    description: 'Membership expired (Unpaid renewal)',
    timestamp: '2026-07-01T00:01:00Z',
  }
];

export const DEFAULT_SETTINGS: SystemSettings = {
  gymName: 'GYM-member',
  ownerName: 'Devashish Raikwar',
  currency: '₹',
  reminderTemplates: {
    expiringToday: 'Hi {name}, your GYM-member membership expires TODAY! To avoid any interruption, please renew now. Feel free to reply or call us for help.',
    expiring3Days: 'Hi {name}, your GYM-member membership will expire in 3 days on {date}. Renew today to lock in your current rate!',
    expiring7Days: 'Hi {name}, hope you are crushing your goals! Just a friendly reminder that your GYM-member membership expires in 7 days on {date}. Keep moving!',
  }
};

// Date utilities helper
export function getDaysDiff(date1Str: string, date2Str: string): number {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  const timeDiff = d2.getTime() - d1.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
