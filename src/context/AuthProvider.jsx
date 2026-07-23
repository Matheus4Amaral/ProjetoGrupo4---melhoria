import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AuthContext } from "@/context/authContext";

const INITIAL_STATE = {
  session: null,
  user: null,
  profile: null,
  loading: true,
  error: "",
};

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("perfis")
    .select("id, nome_completo, email, papel, gestor_id, ativo")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("Não foi possível carregar o perfil desta conta.");
  }

  if (data.ativo === false) {
    throw new Error("Esta conta está inativa. Procure o RH.");
  }

  return data;
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const syncVersion = useRef(0);

  const clearSession = useCallback((error = "") => {
    syncVersion.current += 1;
    setState({ ...INITIAL_STATE, loading: false, error });
  }, []);

  const syncSession = useCallback(async (session) => {
    const version = ++syncVersion.current;

    if (!session?.user) {
      setState({ ...INITIAL_STATE, loading: false });
      return null;
    }

    setState((current) => ({
      ...current,
      session,
      user: session.user,
      loading: true,
      error: "",
    }));

    try {
      const profile = await fetchProfile(session.user.id);

      if (version !== syncVersion.current) return null;

      setState({
        session,
        user: session.user,
        profile,
        loading: false,
        error: "",
      });
      return profile;
    } catch (error) {
      if (version !== syncVersion.current) return null;

      await supabase.auth.signOut();
      clearSession(error.message);
      throw error;
    }
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        clearSession("Não foi possível restaurar sua sessão.");
        return;
      }

      syncSession(data.session).catch(() => {});
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session) {
        clearSession();
        return;
      }

      window.setTimeout(() => {
        if (active) syncSession(session).catch(() => {});
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [clearSession, syncSession]);

  const login = useCallback(async ({ email, password }) => {
    setState((current) => ({ ...current, error: "" }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    await syncSession(data.session);
    return data;
  }, [syncSession]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    clearSession();
    if (error) throw error;
  }, [clearSession]);

  const refreshProfile = useCallback(async () => {
    if (!state.session) return null;
    return syncSession(state.session);
  }, [state.session, syncSession]);

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshProfile,
    isAdmin: state.profile?.papel === "admin",
    isRh: state.profile?.papel === "rh",
    canManageUsers: ["admin", "rh"].includes(state.profile?.papel),
  }), [state, login, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
