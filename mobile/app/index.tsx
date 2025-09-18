import React from "react";
import { ReportsProvider } from "../src/context/ReportsContext";
import AppNavigator from "../src/navigation/AppNavigator";

export default function App() {
  return (
    <ReportsProvider>
      <AppNavigator />
    </ReportsProvider>
  );
}
