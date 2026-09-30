import "dotenv/config";
import { readAuthConfig } from "../src/backend/auth/config";
const missing:string[]=[];
try {readAuthConfig({...process.env,NODE_ENV:"production"});}catch{missing.push("HTTPS authentication origin, SMTP credentials, secret, and trusted proxy header");}
for(const key of ["DATABASE_URL"]) if(!process.env[key])missing.push(key);
if(process.env.AUTH_EMAIL_TRANSPORT!=="smtp")missing.push("real SMTP delivery");
if(missing.length){console.error("Production configuration is incomplete: " + missing.join("; "));process.exitCode=1;}
else console.log("Production configuration shape validated. Delivery, backup, monitoring, and pilot verification are still required.");
