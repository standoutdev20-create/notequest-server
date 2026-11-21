export default [
  {
    slug: "mobile-app-landscape",
    title: "The Mobile App Landscape",
    module: "Foundations",
    duration: 10,
    summary: "Native, cross-platform and web apps: how to choose.",
    sections: [
      {
        heading: "Three ways to build an app",
        paragraphs: [
          "- **Native**: Swift for iOS, Kotlin for Android. Best performance and platform features, but two codebases.\n- **Cross-platform**: React Native or Flutter. One codebase for both platforms with near-native results.\n- **Progressive Web Apps (PWAs)**: websites that can be installed and work offline. No app store needed.",
        ],
      },
      {
        heading: "How to choose",
        paragraphs: [
          "- Know JavaScript and React? **React Native** lets you reuse those skills.\n- Want pixel-perfect custom UI everywhere? **Flutter** (Dart) is excellent.\n- Need deep hardware access or top performance (games, AR)? Go **native**.\n- Content app, small budget? Start as a **PWA**.",
        ],
      },
      {
        heading: "Mobile is different",
        paragraphs: [
          "Phones have small screens, touch input, unreliable networks, limited battery and strict app-store rules. Design for thumbs, handle offline gracefully, and keep apps fast to start.",
        ],
      },
    ],
    keyPoints: [
      "Native, cross-platform, and PWA are the main approaches.",
      "React Native reuses JavaScript/React skills.",
      "Flutter offers a consistent custom UI on every platform.",
      "Design for touch, small screens and poor connectivity.",
    ],
  },
  {
    slug: "react-native-basics",
    title: "React Native Basics",
    module: "Building Apps",
    duration: 20,
    summary: "Build your first cross-platform screen with React Native and Expo.",
    sections: [
      {
        heading: "Getting started with Expo",
        paragraphs: ["Expo removes most setup pain. You can run your app on a real phone by scanning a QR code."],
        code: `npx create-expo-app@latest study-app
cd study-app
npx expo start`,
        language: "Shell",
      },
      {
        heading: "Core components",
        paragraphs: [
          "React Native uses the React you know, but with native components instead of HTML: `View` (like a div), `Text`, `Image`, `TextInput`, `Pressable` and `FlatList` for long lists.",
        ],
        code: `import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function StreakCard() {
  const [days, setDays] = useState(3);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>🔥 {days}-day streak</Text>
      <Pressable style={styles.button} onPress={() => setDays(days + 1)}>
        <Text style={styles.buttonText}>I studied today</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700" },
  button: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: "#4f46e5" },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});`,
        language: "JSX",
      },
      {
        heading: "Styling and layout",
        paragraphs: ["Styles are JavaScript objects, and layout uses **Flexbox** by default, with `flexDirection: \"column\"` as the default direction (unlike the web, which defaults to row)."],
      },
    ],
    keyPoints: [
      "Expo is the fastest way to start with React Native.",
      "Use View, Text, Image, Pressable and FlatList instead of HTML.",
      "Styles are objects; layout is Flexbox, column by default.",
      "Your React knowledge transfers directly.",
    ],
  },
  {
    slug: "navigation-and-data",
    title: "Navigation and Data",
    module: "Building Apps",
    duration: 15,
    summary: "Move between screens and load data from your API.",
    sections: [
      {
        heading: "Screens and navigation",
        paragraphs: ["Expo Router uses files for routes, just like Next.js: `app/index.jsx` is the home screen and `app/lesson/[id].jsx` is a dynamic lesson screen."],
        code: `import { Link } from "expo-router";

<Link href="/lesson/html-fundamentals">Open lesson</Link>`,
        language: "JSX",
      },
      {
        heading: "Fetching data",
        paragraphs: ["`fetch` works the same as in the browser. Show a spinner while loading and a friendly message on failure, since mobile networks drop constantly."],
        code: `const [lessons, setLessons] = useState([]);
const [error, setError] = useState(null);

useEffect(() => {
  fetch("https://api.notequest.in/api/subjects/web-development")
    .then((r) => r.json())
    .then((data) => setLessons(data.lessons))
    .catch(() => setError("You're offline. Pull to retry."));
}, []);`,
        language: "JSX",
      },
      {
        heading: "Storing data on the device",
        paragraphs: ["Use `AsyncStorage` for small preferences, `expo-secure-store` for tokens, and SQLite for larger offline data."],
      },
    ],
    keyPoints: [
      "Expo Router maps files to screens.",
      "fetch loads data, so always handle loading and offline states.",
      "Store tokens securely, never in plain storage.",
      "Cache data locally for offline use.",
    ],
  },
  {
    slug: "publishing-apps",
    title: "Publishing Your App",
    module: "Shipping",
    duration: 12,
    summary: "Build, test and release to the App Store and Google Play.",
    sections: [
      {
        heading: "Before you submit",
        paragraphs: [
          "- An app icon, splash screen, and screenshots for each device size.\n- A privacy policy URL that explains what data you collect.\n- Test on real devices, including small and older phones.",
        ],
      },
      {
        heading: "Building with EAS",
        paragraphs: ["Expo Application Services builds signed binaries in the cloud, so you don't need to own a Mac to build for iOS."],
        code: `npm install -g eas-cli
eas build --platform android
eas build --platform ios
eas submit --platform all`,
        language: "Shell",
      },
      {
        heading: "Store review and updates",
        paragraphs: [
          "Apple and Google review every release. Read their guidelines; the most common rejections are crashes, missing privacy details, and broken login for reviewers. After launch, watch crash reports and ratings, and ship small updates often.",
        ],
      },
    ],
    keyPoints: [
      "Prepare icons, screenshots and a privacy policy.",
      "EAS builds and submits iOS and Android apps.",
      "Expect store review; follow the guidelines.",
      "Monitor crashes and ship small updates.",
    ],
  },
];
