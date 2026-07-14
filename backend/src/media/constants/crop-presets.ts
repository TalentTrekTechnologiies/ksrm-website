export interface CropPreset {
  key: string;
  label: string;
  targetWidth: number;
  targetHeight: number;
}

/** Code-defined, not a DB-configurable table - a small, known set matching
 * the user's explicit examples. Can grow via a code change; not scoped as
 * its own admin-configurable preset manager this pass. */
export const CROP_PRESETS: Record<string, CropPreset> = {
  HERO_BANNER: {
    key: 'HERO_BANNER',
    label: 'Hero Banner',
    targetWidth: 1920,
    targetHeight: 823, // ~21:9
  },
  SQUARE: {
    key: 'SQUARE',
    label: 'Square',
    targetWidth: 800,
    targetHeight: 800,
  },
  FACULTY_PORTRAIT: {
    key: 'FACULTY_PORTRAIT',
    label: 'Faculty Portrait',
    targetWidth: 600,
    targetHeight: 800, // 3:4
  },
};

export const CROP_PRESET_KEYS = Object.keys(CROP_PRESETS);
