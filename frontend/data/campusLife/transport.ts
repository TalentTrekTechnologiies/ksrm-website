export interface BusRoute {
  routeNo: string
  from: string
  via: string[]
  departureTime: string
  returnTime: string
  fee: string
}

export interface FleetStats {
  totalBuses: string
  routesCovered: string
  studentsServed: string
  kmPerDay: string
}

export interface TransportData {
  pageTitle: string
  subtitle: string
  intro: string
  stats: FleetStats
  routes: BusRoute[]
  rules: string[]
  contact: {
    inCharge: string
    phone: string
    email: string
  }
}

export const transport: TransportData = {
  pageTitle: "Transport",
  subtitle: "Safe & Reliable Campus Connectivity",
  intro:
    "K.S.R.M. College of Engineering operates a comprehensive transport system with a modern fleet of buses covering major routes in and around Kadapa. Our transport facility ensures safe, comfortable, and timely commute for students and staff from various areas.",
  stats: {
    totalBuses: "15",
    routesCovered: "8",
    studentsServed: "500+",
    kmPerDay: "1,200+",
  },
  routes: [
    {
      routeNo: "R1",
      from: "Kadapa Railway Station",
      via: ["Clock Tower", "Tirupati Road", "KSRMCE Gate"],
      departureTime: "7:30 AM",
      returnTime: "5:30 PM",
      fee: "₹3,000/month",
    },
    {
      routeNo: "R2",
      from: "Giddapalem",
      via: ["Ambapuram", "Piler Road", "KSRMCE Gate"],
      departureTime: "7:00 AM",
      returnTime: "6:00 PM",
      fee: "₹2,500/month",
    },
    {
      routeNo: "R3",
      from: "Srikalahasthi",
      via: ["Hayathnagar", "Chandragiri Road", "KSRMCE Gate"],
      departureTime: "6:30 AM",
      returnTime: "5:00 PM",
      fee: "₹4,000/month",
    },
    {
      routeNo: "R4",
      from: "Tirupati",
      via: ["Arani", "Kodur", "KSRMCE Gate"],
      departureTime: "6:00 AM",
      returnTime: "4:30 PM",
      fee: "₹4,500/month",
    },
    {
      routeNo: "R5",
      from: "Naidupet",
      via: ["Proddatur", "Chakrayapet", "KSRMCE Gate"],
      departureTime: "7:15 AM",
      returnTime: "5:45 PM",
      fee: "₹3,500/month",
    },
    {
      routeNo: "R6",
      from: "Rayachoti",
      via: ["Jammalamadugu", "Mydukur", "KSRMCE Gate"],
      departureTime: "6:45 AM",
      returnTime: "5:15 PM",
      fee: "₹3,800/month",
    },
    {
      routeNo: "R7",
      from: "Chintachintala",
      via: ["KSRMCE Gate"],
      departureTime: "7:45 AM",
      returnTime: "5:00 PM",
      fee: "₹2,000/month",
    },
    {
      routeNo: "R8",
      from: "Palamaner",
      via: ["Madanapalle", "Gangavalli", "KSRMCE Gate"],
      departureTime: "6:15 AM",
      returnTime: "4:45 PM",
      fee: "₹4,200/month",
    },
  ],
  rules: [
    "Valid bus pass is mandatory for boarding. Display it clearly to the conductor.",
    "Be at the pickup point 5 minutes before departure. Buses do not wait beyond scheduled time.",
    "Maintain discipline and decorum inside the bus. No loud talking or creating disturbance.",
    "Eating and drinking (except water) are not permitted inside the bus.",
    "No smoking, vaping, or use of tobacco products inside the bus.",
    "Keep the bus clean. Do not litter or damage bus property.",
    "In case of emergency, immediately inform the driver or conductor.",
    "Drivers are authorized to enforce speed limits and safety protocols as per traffic rules.",
    "Misbehavior or misconduct may result in suspension of transport privileges.",
    "Bus pass should be renewed every semester. Late renewals may incur additional charges.",
  ],
  contact: {
    inCharge: "Transport Officer",
    phone: "+91-8554-233333 (Ext: 330)",
    email: "transport@ksrmce.ac.in",
  },
}
