import { useState, useEffect, useCallback, useRef } from 'react';
import { DiscordSDK } from "@discord/embedded-app-sdk";

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

export function useDiscord() {
  const [auth, setAuth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const setupStarted = useRef(false);

  const setup = useCallback(async () => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      await discordSdk.ready();
      
      const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
        response_type: "code",
        state: "",
        prompt: "none",
        scope: ["identify", "guilds", "applications.commands"],
      });

      const response = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.statusText}`);
      }

      const { access_token } = await response.json();
      const authenticatedAuth = await discordSdk.commands.authenticate({ access_token });

      setAuth(authenticatedAuth);
    } catch (err) {
      console.error(err);
      setError(err);
      // Reset setupStarted on error so it can be retried if needed, 
      // though usually we want to stay in error state.
      // setupStarted.current = false; 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!setupStarted.current) {
      setup();
    }
  }, [setup]);

  return { auth, error, loading, discordSdk };
}
