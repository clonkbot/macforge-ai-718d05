import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export function IconGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const icons = useQuery(api.icons.list) ?? [];
  const saveIcon = useMutation(api.icons.create);
  const deleteIcon = useMutation(api.icons.remove);
  const generateImage = useAction(api.ai.generateImage);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setPreviewImage(null);

    try {
      const enhancedPrompt = `macOS app icon for: ${prompt}. Style: Modern, clean, minimal, rounded corners (macOS Big Sur style), gradient background, centered symbol, professional, high quality, app store ready`;

      const imageBase64 = await generateImage({ prompt: enhancedPrompt });

      if (imageBase64) {
        setPreviewImage(imageBase64);
        await saveIcon({ prompt: prompt.trim(), imageBase64 });
        setPrompt("");
      } else {
        setError("Failed to generate icon. Try a different prompt.");
      }
    } catch (err) {
      setError("Failed to generate icon. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: typeof icons[0]["_id"]) => {
    try {
      await deleteIcon({ id });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 h-[calc(100dvh-56px)] lg:h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-white mb-2">
            App Icon Generator
          </h1>
          <p className="text-zinc-400">
            Generate beautiful macOS-style app icons with AI
          </p>
        </div>

        {/* Generator Form */}
        <div className="glass rounded-2xl p-6 mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <form onSubmit={handleGenerate}>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your app icon... (e.g., 'A music player with neon waves')"
                disabled={isLoading}
                className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 whitespace-nowrap"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                    Generate
                  </span>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 flex flex-col items-center py-8">
              <div className="w-24 h-24 rounded-[22px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse flex items-center justify-center">
                <svg className="w-10 h-10 text-zinc-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="mt-4 text-zinc-500 text-sm">Creating your icon...</p>
            </div>
          )}

          {/* Preview */}
          {previewImage && !isLoading && (
            <div className="mt-6 flex flex-col items-center">
              <p className="text-zinc-400 text-sm mb-4">Latest generation:</p>
              <div className="relative group">
                <img
                  src={`data:image/png;base64,${previewImage}`}
                  alt="Generated icon"
                  className="w-32 h-32 rounded-[28px] shadow-2xl shadow-blue-500/20 ring-1 ring-white/10"
                />
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="text-white text-xs">Icon saved!</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Icon Gallery */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Your Icons
          </h2>

          {icons.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="text-zinc-500">No icons generated yet</p>
              <p className="text-zinc-600 text-sm mt-1">Describe your app icon above to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {icons.map((icon: { _id: typeof icons[0]["_id"]; prompt: string; imageBase64: string }, idx: number) => (
                <div
                  key={icon._id}
                  className="group relative glass rounded-2xl p-4 animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <img
                    src={`data:image/png;base64,${icon.imageBase64}`}
                    alt={icon.prompt}
                    className="w-full aspect-square rounded-[20px] shadow-lg ring-1 ring-white/10"
                  />
                  <p className="mt-3 text-xs text-zinc-500 truncate" title={icon.prompt}>
                    {icon.prompt}
                  </p>

                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`data:image/png;base64,${icon.imageBase64}`}
                      download={`${icon.prompt.slice(0, 20)}-icon.png`}
                      className="p-2 bg-black/60 backdrop-blur-sm rounded-lg text-white hover:bg-black/80 transition-colors"
                      title="Download"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </a>
                    <button
                      onClick={() => handleDelete(icon._id)}
                      className="p-2 bg-black/60 backdrop-blur-sm rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pb-6 text-center">
          <p className="text-zinc-700 text-xs">
            Requested by @CryptoStacksss · Built by @clonkbot
          </p>
        </footer>
      </div>
    </div>
  );
}
