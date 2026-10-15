import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "./brand-logo";

const navigation = [
  ["overview", "Overview"], ["requests", "Service requests"],
  ["people", "People & technicians"], ["services", "Service coverage"],
  ["reports", "Financial reports"], ["notifications", "Notifications"],
  ["activity", "Activity log"], ["settings", "Business settings"], ["profile", "My profile"],
];
const descriptions: Record<string,string> = {
  overview: "A clear view of your service operation. Start with what needs attention.",
  requests: "Review customer requests and keep every job moving forward.",
  people: "Review applications, verify technicians and manage account access.",
  services: "Manage the services your team is ready to fulfil.",
  reports: "Follow invoicing, receipts and labour allocations by currency.",
  notifications: "Catch up on updates across your service requests.",
  activity: "Review the changes made across your operation.",
  settings: "Keep your business and invoice information up to date.",
  profile: "Manage your name and contact information.",
};
export function AdminShell({view,name,notifications,children}:{view:string;name:string;notifications:number;children:ReactNode}) {
  const label = navigation.find(([key])=>key===view)?.[1] ?? "Overview";
  return <main id="main-content" tabIndex={-1} className="admin-workspace">
    <aside className="admin-sidebar">
      <Link href="/portal/admin" className="admin-brand"><BrandLogo/></Link>
      <p className="admin-nav-label">MANAGEMENT</p>
      <nav aria-label="Administrator navigation">{navigation.map(([key,title])=><Link key={key} href={key==="overview"?"/portal/admin":"/portal/admin?view="+key} aria-current={view===key?"page":undefined}><span>{title}</span>{key==="notifications" && notifications>0 && <span className="admin-nav-count">{notifications}{notifications===20?"+":""}</span>}</Link>)}</nav>
      <div className="admin-identity"><span className="admin-avatar" aria-hidden="true">{name.slice(0,1).toUpperCase()}</span><div><strong>{name}</strong><Link href="/account">Account & sign out</Link></div></div>
    </aside>
    <div className="admin-content">
      <header className="admin-heading"><div><p className="admin-eyebrow">FALLSFIX / {label.toUpperCase()}</p><h1>Administrator workspace</h1><p>{descriptions[view]}</p></div><div className="admin-header-actions"><Link href="/account">My account</Link><Link href="/portal/admin?view=requests" className="button">Manage requests <span aria-hidden="true">&rarr;</span></Link></div></header>
      {view==="overview" && <div className="admin-greeting"><span className="admin-eyebrow">YOUR DAILY OVERVIEW</span><h2>Welcome back, {name.split(" ")[0]}.</h2><p>Review new requests, check your team and follow up on work in progress.</p></div>}
      <div className="admin-sections" key={view}>{children}</div>
      <footer className="admin-footnote">FallsFix management <span>Local services. Real solutions.</span></footer>
    </div>
  </main>;
}
