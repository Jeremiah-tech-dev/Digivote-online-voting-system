import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from './api';

// Who is logged in. Kept in sessionStorage so a page refresh doesn't log you out,
// but it is cleared when the browser tab is closed.
const STORAGE_KEY = 'digivote-session';

const AuthContext = createContext(null);

// Read the expiry time inside a JWT (the middle part is base64-encoded JSON)
const isExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch (error) {
    return true;
  }
};

const loadSession = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
    return {
      voter: saved.voter && !isExpired(saved.voter.token) ? saved.voter : null,
      admin: saved.admin && !isExpired(saved.admin.token) ? saved.admin : null
    };
  } catch (error) {
    return { voter: null, admin: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      // Storage unavailable (e.g. private mode): the login just won't survive a refresh
    }
  }, [session]);

  const loginVoter = useCallback((profile, token) => setSession(s => ({ ...s, voter: { profile, token } })), []);
  const logoutVoter = useCallback(() => setSession(s => ({ ...s, voter: null })), []);
  const loginAdmin = useCallback((token) => setSession(s => ({ ...s, admin: { token } })), []);
  const logoutAdmin = useCallback(() => setSession(s => ({ ...s, admin: null })), []);

  // If the server rejects a token (expired or invalid), forget that login,
  // which sends the user back to the login page
  useEffect(() => {
    setUnauthorizedHandler((token) => {
      setSession(s => ({
        voter: s.voter?.token === token ? null : s.voter,
        admin: s.admin?.token === token ? null : s.admin
      }));
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(
    () => ({ voter: session.voter, admin: session.admin, loginVoter, logoutVoter, loginAdmin, logoutAdmin }),
    [session, loginVoter, logoutVoter, loginAdmin, logoutAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
