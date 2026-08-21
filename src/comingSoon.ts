export type ComingSoonInfo = {
  title: string;
  message: string;
};

export const COMING_SOON_EVENT = 'fmf:coming-soon';

export const RETREATS_COMING_SOON: ComingSoonInfo = {
  title: 'Retreats',
  message: 'FMF Retreats are being finalized. Destinations, dates and booking will open soon.',
};

// Lets any page (footer, home CTA, profile tabs) open the popup rendered by the Navbar.
export const openComingSoon = (info: ComingSoonInfo) => {
  window.dispatchEvent(new CustomEvent(COMING_SOON_EVENT, { detail: info }));
};
