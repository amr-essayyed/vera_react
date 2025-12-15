import { ResourceService } from "@/services/resourceService";
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [report, setReport] = useState();
  const [accounts, setAccounts] = useState();
  const [contacts, setContacts] = useState();

  const contact1Payables = accounts?.find((account)=>account.id === contacts?.[0]?.property_account_payable_id?.[0])

  useEffect(()=>{(async()=>{
    // const res = await ResourceService.getReport('account.report_trial_balance');

    // accounts
    const accounts = await ResourceService.getAlll('account.account')
    setAccounts(accounts);
    console.log("accounts =============👇");
    console.log(accounts);
    
    // contacts
    const contacts = await ResourceService.getAlll('res.partner')
    setContacts(contacts);
    console.log("contacts =============👇");
    console.log(contacts);
    
  })()},[])
  return (
    <div>
      <div>DashboardPage?</div>
      {/* <pre>{JSON.stringify(contact1Payables, null, 2)}</pre> */}
      <table>
        <thead>
          <tr>
            <th className="border-2 p-2">contact</th>
            <th className="border-2 p-2">payables</th>
            <th className="border-2 p-2">receivables</th>
          </tr>
        </thead>
        <tbody>
          {contacts?.map((contact)=>(
            <tr>
              <td className="border-2 p-2">{contact.name}</td>
              <td className="border-2 p-2">{accounts?.find((account)=>account.id === contact?.property_account_payable_id?.[0]).current_balance}</td>
              <td className="border-2 p-2">{accounts?.find((account)=>account.id === contact?.property_account_receivable_id?.[0]).current_balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <pre>contact1Payables</pre>
    </div>
  )
}
