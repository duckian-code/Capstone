import { ConversationScreen } from "./components/conversation/ConversationScreen";
import type { User } from "./data/models/dao-types";

import "./styles/App.css";

interface Props {
    currentUser: User;
    goals: string[];
}

export default function App({ currentUser, goals }: Props) {
    return (
        <ConversationScreen
            userId={currentUser.id}
            context={{
                language: currentUser.target_language ?? "French",
                goals,
            }}
        />
    );
}
