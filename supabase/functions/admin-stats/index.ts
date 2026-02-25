import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminStats {
  totalUsers: number;
  totalPets: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  cancelledSubscriptions: number;
  subscriptionsByPlan: Record<string, number>;
  totalRevenueCents: number;
  monthlyRevenueCents: number;
  waitlistCount: number;
  referralCount: number;
  convertedReferrals: number;
  usersByRole: Record<string, number>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Extract the user's JWT from the Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the caller using the user's JWT
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Aggregate stats using the service role client (bypasses RLS)

    // Total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Total pets
    const { count: totalPets } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true });

    // Subscriptions by status
    const { data: allSubs } = await supabase
      .from("subscriptions")
      .select("status, plan");

    const activeSubscriptions = allSubs?.filter((s) => s.status === "active").length ?? 0;
    const trialingSubscriptions = allSubs?.filter((s) => s.status === "trialing").length ?? 0;
    const cancelledSubscriptions = allSubs?.filter((s) => s.status === "cancelled").length ?? 0;

    // Subscriptions by plan
    const subscriptionsByPlan: Record<string, number> = {};
    for (const sub of allSubs ?? []) {
      if (sub.status === "active" || sub.status === "trialing") {
        subscriptionsByPlan[sub.plan] = (subscriptionsByPlan[sub.plan] ?? 0) + 1;
      }
    }

    // Total revenue (all time, paid only)
    const { data: allPayments } = await supabase
      .from("payments")
      .select("amount_cents, currency, status, created_at")
      .eq("status", "paid");

    const totalRevenueCents =
      allPayments?.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0) ?? 0;

    // Monthly revenue (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthlyRevenueCents =
      allPayments
        ?.filter((p) => p.created_at >= startOfMonth)
        .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0) ?? 0;

    // Waitlist count
    const { count: waitlistCount } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    // Referrals
    const { data: allReferrals } = await supabase
      .from("referrals")
      .select("status");

    const referralCount = allReferrals?.length ?? 0;
    const convertedReferrals =
      allReferrals?.filter((r) => r.status === "converted" || r.status === "rewarded").length ?? 0;

    // Users by role
    const { data: allProfiles } = await supabase.from("profiles").select("role");

    const usersByRole: Record<string, number> = {};
    for (const p of allProfiles ?? []) {
      const role = p.role ?? "member";
      usersByRole[role] = (usersByRole[role] ?? 0) + 1;
    }

    const stats: AdminStats = {
      totalUsers: totalUsers ?? 0,
      totalPets: totalPets ?? 0,
      activeSubscriptions,
      trialingSubscriptions,
      cancelledSubscriptions,
      subscriptionsByPlan,
      totalRevenueCents,
      monthlyRevenueCents,
      waitlistCount: waitlistCount ?? 0,
      referralCount,
      convertedReferrals,
      usersByRole,
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error computing admin stats:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
