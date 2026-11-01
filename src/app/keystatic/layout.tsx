import KeystaticApp from "./keystatic";

export const metadata = {
  title: "Editor · Online in Cambodia",
  robots: { index: false, follow: false },
};

export default function KeystaticLayout() {
  return (
    <html lang="en">
      <body>
        <KeystaticApp />
      </body>
    </html>
  );
}
