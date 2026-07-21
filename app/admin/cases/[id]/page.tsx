import { requireRole } from "@/lib/authorization"
import { CaseDetail } from "@/components/portal/case-detail"
export default async function Page({params}:{params:Promise<{id:string}>}){const user=await requireRole("ADMIN");const {id}=await params;return <CaseDetail id={id} user={user}/>}
