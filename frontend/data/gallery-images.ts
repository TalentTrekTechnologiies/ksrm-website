export interface GalleryImage {
  src: string;
  alt: string;
  category: string;
}

export const galleryImages: GalleryImage[] = [
  // Campus
  { src: '/gallery/campus/topview.jpg', alt: 'KSRM College aerial campus view', category: 'Campus' },
  { src: '/gallery/campus/blocktop.jpg', alt: 'Main block aerial view', category: 'Campus' },
  { src: '/gallery/campus/block.jpg', alt: 'Main administrative block', category: 'Campus' },
  { src: '/gallery/campus/19.jpg', alt: 'Solar powered campus', category: 'Campus' },
  { src: '/gallery/campus/22.jpg', alt: 'Solar parking facility', category: 'Campus' },

  // Labs
  { src: '/gallery/labs/lab.jpg', alt: 'Robotics laboratory with ABB robotic arm', category: 'Labs' },
  { src: '/gallery/labs/roboticslab.jpg', alt: 'Robotic 3D printing lab', category: 'Labs' },
  { src: '/gallery/labs/ab.jpg', alt: 'Computer laboratory', category: 'Labs' },
  { src: '/gallery/labs/labw.jpg', alt: 'Computer lab examination', category: 'Labs' },
  { src: '/gallery/labs/lab2.jpg', alt: 'Chemistry laboratory', category: 'Labs' },
  { src: '/gallery/labs/lab3.jpg', alt: 'Electrical engineering lab', category: 'Labs' },

  // Sports
  { src: '/gallery/sports/volleyball.jpg', alt: 'Volleyball match', category: 'Sports' },
  { src: '/gallery/sports/sportsg3.jpg', alt: 'Indoor badminton court', category: 'Sports' },
  { src: '/gallery/sports/sportsground.jpg', alt: 'Basketball court', category: 'Sports' },
  { src: '/gallery/sports/sportsground2.jpg', alt: 'Sports ground aerial view', category: 'Sports' },

  // Library
  { src: '/gallery/library/library.jpg', alt: 'Central Library building', category: 'Library' },
  { src: '/gallery/library/studentsinlib.jpg', alt: 'Students reading in library', category: 'Library' },
  { src: '/gallery/library/studentsinlib2.jpg', alt: 'Students studying in library', category: 'Library' },

  // Events
  { src: '/gallery/events/fest.jpg', alt: 'Award ceremony', category: 'Events' },
  { src: '/gallery/events/fest2.jpg', alt: 'Cultural fest performance', category: 'Events' },
  { src: '/gallery/events/event.jpg', alt: 'KGCET poster launch', category: 'Events' },
  { src: '/gallery/events/event2.jpg', alt: 'CONNECT 2K26 technical fest', category: 'Events' },
  { src: '/gallery/events/seminar.jpg', alt: 'Seminar in auditorium', category: 'Events' },
  { src: '/gallery/events/inaugaration.jpg', alt: 'Statue inauguration ceremony', category: 'Events' },
  { src: '/gallery/events/inaugaration2.jpg', alt: 'Event inauguration ribbon cutting', category: 'Events' },
  { src: '/gallery/events/achievements.jpg', alt: 'Achievement award', category: 'Events' },
  { src: '/gallery/events/activity.jpg', alt: 'College activity', category: 'Events' },
  { src: '/gallery/events/activity2.jpg', alt: 'Campus tour activity', category: 'Events' },
  { src: '/gallery/events/activity3.jpg', alt: 'Bharat Environment Program', category: 'Events' },
  { src: '/gallery/events/activity4.jpg', alt: 'INSPIRON 2K26 event', category: 'Events' },

  // Filtered Campus Events (WebP)
  { src: '/hero/KSR00001.webp', alt: 'Campus event - day view', category: 'Events' },
  { src: '/hero/KSR00007.webp', alt: 'Campus gathering and activities', category: 'Events' },
  { src: '/hero/KSR00014.webp', alt: 'Students engaged in event', category: 'Events' },
  { src: '/hero/KSR00016.webp', alt: 'Campus life moment', category: 'Events' },
  { src: '/hero/KSR00017.webp', alt: 'College event participation', category: 'Events' },
  { src: '/hero/KSR00019.webp', alt: 'Campus event scene', category: 'Events' },
  { src: '/hero/KSR00027.webp', alt: 'Student activities on campus', category: 'Events' },
  { src: '/hero/KSR00028.webp', alt: 'Event with student participation', category: 'Events' },
  { src: '/hero/KSR00048.webp', alt: 'Campus gathering and networking', category: 'Events' },
  { src: '/hero/KSR00053.webp', alt: 'Event moment on campus', category: 'Events' },
  { src: '/hero/KSR00058.webp', alt: 'Students at campus event', category: 'Events' },
  { src: '/hero/KSR00104.webp', alt: 'Campus celebration event', category: 'Events' },
  { src: '/hero/KSR00116.webp', alt: 'Crowd at campus event', category: 'Events' },
  { src: '/hero/KSR00140.webp', alt: 'Event scene with students', category: 'Events' },
  { src: '/hero/KSR00163.webp', alt: 'Large campus event gathering', category: 'Events' },
  { src: '/hero/KSR09989.webp', alt: 'Campus activity highlight', category: 'Events' },

  // Transport
  { src: '/gallery/transport/buses.jpg', alt: 'KSRM college bus fleet', category: 'Transport' },
];

export const getImagesByCategory = (category: string) =>
  category === 'All' ? galleryImages : galleryImages.filter(img => img.category === category);

export const galleryCategories = ['All', 'Campus', 'Labs', 'Sports', 'Library', 'Events', 'Transport'];
