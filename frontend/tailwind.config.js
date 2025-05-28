/** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{html,js,svelte,ts}"],
   theme: {
      extend: {
         colors: {
            // Simple color scheme for trading
            profit: "#10b981", // Green for profits
            loss: "#ef4444", // Red for losses
            neutral: "#6b7280", // Gray for neutral
         },
      },
   },
   plugins: [],
};
