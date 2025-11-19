"use client";

import GuardianTodayCard from "@/app/components/guardian/GuardianTodayCard";
import Active from "./Active";
import Entry from "./Entry";
import TodoDaily from "./TodoDaily";
import GuardianNudgeClient from "@/app/components/guardian/GuardianNudgeClient";

export default function DashboardClient() {
  return (
    <div className="space-y-8">
      <TodoDaily />
      <GuardianTodayCard />
      <GuardianNudgeClient />
      <Active />
      <Entry />
    </div>
  );
}
