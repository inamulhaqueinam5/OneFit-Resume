// Shared Clerk appearance for auth screens, themed to Newsprint.
// Clerk needs resolved color strings rather than CSS variables.
//   newsprint  #F9F9F7   ink  #111111   editorial  #CC0000   rule  #E5E5E0
export const clerkAppearance = {
  variables: {
    colorPrimary: "#CC0000",
    colorBackground: "#F9F9F7",
    colorText: "#111111",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#111111",
    borderRadius: "0px",
  },
  elements: {
    card: "border border-[#111111] shadow-none rounded-none",
    formButtonPrimary:
      "bg-[#111111] hover:bg-[#F9F9F7] hover:text-[#111111] border border-[#111111] rounded-none shadow-none",
    formFieldInput: "rounded-none border-[#111111]",
    footerActionLink: "text-[#CC0000]",
  },
};
