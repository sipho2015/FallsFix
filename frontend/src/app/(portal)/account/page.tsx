import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { photoFor } from "@/shared/data/photography";
import { requirePrincipal } from "@/backend/authorization/server";
import { hasRole, portalRoles, type Portal } from "@/backend/authorization/policy";
import { SignOut } from "@/frontend/components/sign-out";
export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const session = await requirePrincipal();
  const workspaces: {role: Portal; title: string; description: string; photo: string; action: string}[] = [
    {role:"admin",title:"Administrator workspace",description:"Review requests, manage your team and keep service operations moving.",photo:"coordination",action:"Manage operations"},
    {role:"technician",title:"Technician workspace",description:"View assignments, record your progress and keep customers updated.",photo:"handyman",action:"View assigned work"},
    {role:"customer",title:"Customer workspace",description:"Request a service, follow your jobs and review quotes and invoices.",photo:"it-support",action:"Manage my requests"},
  ];
  return <main id="main-content" tabIndex={-1} className="account-home">
    <header className="account-welcome"><p className="account-eyebrow">YOUR FALLSFIX ACCOUNT</p><h1>Welcome, {session.user.name}.</h1><p>Choose a workspace to get started.</p></header>
    <div className="account-profile"><span className="account-avatar" aria-hidden="true">{session.user.name.slice(0,1).toUpperCase()}</span><div><strong>{session.user.name}</strong><span className="account-email">{session.user.email}</span></div><span className="account-verified"><span aria-hidden="true">&#10003;</span> Email verified</span></div>
    <section aria-labelledby="workspaces-title"><div className="account-section-title"><h2 id="workspaces-title">Your workspaces</h2><p>Select the area you want to work in.</p></div>
      <nav className="account-workspaces" aria-label="Your workspaces">{workspaces.filter(w=>hasRole(session,portalRoles[w.role])).map(w=><Link key={w.role} href={`/portal/${w.role}`} prefetch={false} className="account-workspace-card" data-role={w.role}>
        <Image className="account-workspace-photo" src={photoFor(w.photo).src} alt={photoFor(w.photo).alt} width={720} height={480} sizes="(max-width: 600px) 85vw, 30vw" />
        <h3>{w.title}</h3><p>{w.description}</p><span className="account-card-action">{w.action}<span aria-hidden="true">&rarr;</span></span>
      </Link>)}</nav>
    </section>
    <footer className="account-session"><div><strong>Finished for now?</strong><p>Sign out when you&apos;re done, especially on a shared device.</p></div><div className="account-signout"><SignOut/></div></footer>
  </main>;
}
