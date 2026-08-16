// Shared Clerk appearance for auth screens, themed to the Ease Health
// botanical palette (ADR-0007). Clerk needs resolved color strings rather than
// CSS variables, so these mirror the values in `design idea resource/theme.css`:
//   forest-ink  #0f3e17   cream-paper  #fffefc   charcoal  #222222
export const clerkAppearance = {
  variables: {
    colorPrimary: "#0f3e17",
    colorBackground: "#fffefc",
    colorText: "#222222",
    colorInputBackground: "#fffefc",
    borderRadius: "14px",
  },
};
