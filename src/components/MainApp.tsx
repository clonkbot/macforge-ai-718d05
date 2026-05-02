import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Sidebar } from "./Sidebar";
import { ChatView } from "./ChatView";
import { IconGenerator } from "./IconGenerator";

type Tab = "chat" | "icons";

interface MainAppProps {
  onSignOut: () => void;
}

export function MainApp({ onSignOut }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [selectedConversation, setSelectedConversation] = useState<Id<"conversations"> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const conversations = useQuery(api.conversations.list) ?? [];
  const createConversation = useMutation(api.conversations.create);
  const deleteConversation = useMutation(api.conversations.remove);

  const handleNewChat = async () => {
    const id = await createConversation({ title: "New Chat" });
    setSelectedConversation(id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async (id: Id<"conversations">) => {
    await deleteConversation({ id });
    if (selectedConversation === id) {
      setSelectedConversation(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex relative overflow-hidden noise-overlay">
      {/* Ambient effects */}
      <div className="absolute top-[-30%] right-[-20%] w-[800px] h-[800px] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-20%] w-[700px] h-[700px] rounded-full bg-purple-600/5 blur-[130px] pointer-events-none" />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
          </div>
          <span className="font-display font-semibold text-white">MacForge</span>
        </div>
        <button onClick={onSignOut} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-50 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300
      `}>
        <Sidebar
          conversations={conversations}
          selectedId={selectedConversation}
          activeTab={activeTab}
          onSelectConversation={(id) => {
            setSelectedConversation(id);
            setSidebarOpen(false);
          }}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onTabChange={setActiveTab}
          onSignOut={onSignOut}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen pt-14 lg:pt-0 relative z-10">
        {activeTab === "chat" ? (
          <ChatView
            conversationId={selectedConversation}
            onNewChat={handleNewChat}
          />
        ) : (
          <IconGenerator />
        )}
      </main>
    </div>
  );
}
