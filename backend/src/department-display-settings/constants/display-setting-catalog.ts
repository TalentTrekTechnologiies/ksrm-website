// The scalable configuration system for Department CMS visibility - one row
// per toggle (DepartmentDisplaySetting), not one boolean column per toggle.
// This catalog is the code-defined list of every togglable key so the admin
// UI can render a full toggle grid even for a department with zero rows
// (absence of a row means "on" - see the model's doc comment in
// schema.prisma). Adding a new toggle later is a one-line addition here,
// never a migration.
export interface DisplaySettingCatalogEntry {
  key: string;
  section: string;
  label: string;
}

export const DEPARTMENT_DISPLAY_SETTINGS_CATALOG: DisplaySettingCatalogEntry[] =
  [
    { key: 'about.showSection', section: 'About', label: 'Show About Section' },
    {
      key: 'vision.showSection',
      section: 'Vision & Mission',
      label: 'Show Vision & Mission',
    },
    { key: 'hod.showSection', section: 'HOD', label: "Show HOD's Desk" },
    { key: 'hod.showPhoto', section: 'HOD', label: "Show HOD's Photo" },
    { key: 'hod.showMessage', section: 'HOD', label: "Show HOD's Message" },
    {
      key: 'hod.showContact',
      section: 'HOD',
      label: "Show HOD's Contact Email",
    },
    {
      key: 'faculty.showSection',
      section: 'Faculty',
      label: 'Show Faculty Section',
    },
    // NOTE: faculty photos on/off is a GLOBAL switch (SiteSetting
    // 'faculty_show_photos', edited under Site Settings -> Department Pages), not
    // a per-department toggle - off renders a compact faculty list on every
    // department page. Deliberately not listed here so admins aren't offered a
    // dead per-department control that the public page no longer reads.
    {
      key: 'faculty.showQualification',
      section: 'Faculty',
      label: 'Show Faculty Qualification',
    },
    {
      key: 'faculty.showExperience',
      section: 'Faculty',
      label: 'Show Faculty Experience',
    },
    {
      key: 'faculty.showEmail',
      section: 'Faculty',
      label: 'Show Faculty Email',
    },
    {
      key: 'programmes.showSection',
      section: 'Programs',
      label: 'Show Programs Section',
    },
    {
      key: 'labs.showSection',
      section: 'Laboratories',
      label: 'Show Laboratories Section',
    },
    {
      key: 'labs.showEquipment',
      section: 'Laboratories',
      label: 'Show Equipment List',
    },
    {
      key: 'research.showSection',
      section: 'Research',
      label: 'Show Research Section',
    },
    {
      key: 'research.showPublications',
      section: 'Research',
      label: 'Show Publications',
    },
    {
      key: 'research.showProjects',
      section: 'Research',
      label: 'Show Projects',
    },
    { key: 'research.showPatents', section: 'Research', label: 'Show Patents' },
    {
      key: 'research.showVideos',
      section: 'Research',
      label: 'Show Related Videos',
    },
    {
      key: 'highlights.showSection',
      section: 'Highlights',
      label: 'Show AI-Enabled Highlights',
    },
    {
      key: 'achievements.showSection',
      section: 'Achievements',
      label: 'Show Achievements Section',
    },
    {
      key: 'gallery.showSection',
      section: 'Gallery',
      label: 'Show Gallery Section',
    },
    {
      key: 'videos.showSection',
      section: 'Videos',
      label: 'Show Videos Section',
    },
    {
      key: 'downloads.showSection',
      section: 'Downloads',
      label: 'Show Downloads Section',
    },
    { key: 'peo.showSection', section: 'PEO / PO / PSO', label: 'Show PEOs' },
    { key: 'po.showSection', section: 'PEO / PO / PSO', label: 'Show POs' },
    { key: 'pso.showSection', section: 'PEO / PO / PSO', label: 'Show PSOs' },
    {
      key: 'statistics.showSection',
      section: 'Statistics',
      label: 'Show Department Statistics',
    },
    {
      key: 'contact.showSection',
      section: 'Contact',
      label: 'Show Contact Information',
    },
  ];
