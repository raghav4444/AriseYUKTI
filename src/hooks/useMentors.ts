import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Mentor } from "../types";

/** Consider mentor "active" if last_seen is within this many milliseconds */
const ACTIVE_WITHIN_MS = 5 * 60 * 1000; // 5 minutes

function isActive(lastSeen: string | null | undefined): boolean {
  if (!lastSeen) return false;
  const t = new Date(lastSeen).getTime();
  return Date.now() - t <= ACTIVE_WITHIN_MS;
}

function mapRowToMentor(
  row: {
    id: string;
    user_id: string;
    rating: number | null;
    bio: string | null;
    skills: string[];
    is_available: boolean;
    experience: string[];
    achievements: string[];
    response_time: string | null;
    profiles: {
      id: string;
      name: string;
      college: string;
      branch: string;
      year: number;
      bio: string | null;
      avatar_url: string | null;
      is_verified: boolean;
      last_seen: string | null;
    } | null;
  }
): Mentor & { isActive: boolean } {
  const p = row.profiles;
  return {
    id: row.id,
    userId: row.user_id,
    name: p?.name ?? "Mentor",
    college: p?.college ?? "",
    branch: p?.branch ?? "",
    year: p?.year ?? 0,
    skills: Array.isArray(row.skills) ? row.skills : [],
    bio: row.bio ?? p?.bio ?? "",
    isAvailable: row.is_available,
    rating: row.rating ?? undefined,
    isVerified: p?.is_verified ?? false,
    experience: Array.isArray(row.experience) ? row.experience : [],
    achievements: Array.isArray(row.achievements) ? row.achievements : [],
    responseTime: row.response_time ?? "",
    isActive: isActive(p?.last_seen),
    lastSeenAt: p?.last_seen ?? undefined,
  };
}

export function useMentors() {
  const [mentors, setMentors] = useState<(Mentor & { isActive: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: mentorRows, error: e } = await supabase
      .from("mentors")
      .select("id, user_id, rating, bio, skills, is_available, experience, achievements, response_time")
      .order("created_at", { ascending: false });

    if (e) {
      setError(e.message);
      setMentors([]);
      setLoading(false);
      return;
    }

    const rows = mentorRows ?? [];
    if (rows.length === 0) {
      setMentors([]);
      setLoading(false);
      return;
    }

    const userIds = rows.map((r: { user_id: string }) => r.user_id);
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, user_id, name, college, branch, year, bio, avatar_url, is_verified, last_seen")
      .in("user_id", userIds);

    const profileByUserId = new Map(
      (profileRows ?? []).map((p: { user_id: string }) => [p.user_id, p])
    );

    const list = rows.map((row: Record<string, unknown>) =>
      mapRowToMentor({
        ...row,
        profiles: profileByUserId.get(row.user_id as string) ?? null,
      } as Parameters<typeof mapRowToMentor>[0])
    );
    setMentors(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  // Realtime: when mentors or profiles change, refetch
  // NOTE: Enable Realtime for 'profiles' table in Supabase Dashboard → Database → Replication
  useEffect(() => {
    const channel = supabase
      .channel("mentors-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentors" },
        () => {
          console.log("🔄 Mentors table changed, refetching...");
          fetchMentors();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          console.log("🔄 Profile updated (last_seen?), refetching mentors...", payload);
          fetchMentors();
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMentors]);

  // Recompute isActive every 30 seconds (to show "Available Now" quickly when mentor logs in)
  useEffect(() => {
    const interval = setInterval(() => {
      setMentors((prev) =>
        prev.map((m) => ({
          ...m,
          isActive: "lastSeenAt" in m && m.lastSeenAt ? isActive(m.lastSeenAt) : false,
        }))
      );
    }, 30_000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { mentors, loading, error, refetch: fetchMentors };
}

/** Call when the current user (mentor) is active — updates their profile last_seen so they show as active */
export async function updateMentorLastSeen(userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ last_seen: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) console.warn("Failed to update last_seen:", error.message);
}
