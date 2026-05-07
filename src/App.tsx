import { AppProvider, useApp } from "./contexts/AppContext";
import { LineSelectPage } from "./pages/LineSelectPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TrainEntryPage } from "./pages/TrainEntryPage";
import { TrainRoomPage } from "./pages/TrainRoomPage";

function Router() {
  const { page } = useApp();
  switch (page) {
    case "line-select":
      return <LineSelectPage />;
    case "train-entry":
      return <TrainEntryPage />;
    case "train-room":
      return <TrainRoomPage />;
    case "profile":
      return <ProfilePage />;
    default:
      return <LineSelectPage />;
  }
}

function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

export default App;
