import { ActionForm } from "./action-form";
export function TechnicianVerification({userId, categoryId, options, phone}: {userId:string; categoryId?:string; options:{value:string;label:string}[];phone?:string}) {
  return <div><p>Review the original National ID/passport and profile photo through FallsFix&apos;s private verification process. Record private evidence references below, not full identity numbers or public links. A customer&apos;s problem photo is never verification evidence. Repeat for each approved skill.</p><ActionForm action="verifyTechnician" title="Verify technician skill and coverage" fixed={{userId,serviceArea:"victoria-falls"}} fields={[
    {name:"categoryId",label:"Verified skill / service",value:categoryId,options},
    {name:"identityType",label:"Identity document reviewed",options:[{value:"NATIONAL_ID",label:"National ID"},{value:"PASSPORT",label:"Passport"}]},
    {name:"identityEvidence",label:"Private identity review record / evidence reference",maxLength:500},
    {name:"phone",label:"Verified phone",type:"tel",value:phone,maxLength:32},
    {name:"profilePhotoEvidence",label:"Private profile photo review record / evidence reference",maxLength:500},
    {name:"competenceEvidence",label:"Certificate, previous work or reference evidence (if available)",required:false,maxLength:1000},
    {name:"reason",label:"Review outcome and confirmed Victoria Falls coverage",maxLength:1000},
  ]}/></div>;
}
