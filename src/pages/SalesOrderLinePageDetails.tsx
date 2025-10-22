// services/salesOrderService.ts
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAllResource } from "@/hooks/useResource"
import apiClient from "@/services/apiClient"
import { ResourceService } from "@/services/resourceService"
import { computePermissions, normalizeSalesOrderPayload } from "@/utils/salesOrderHelpers"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useParams } from "react-router-dom"


// Components
import { CancelConfirmDialog } from "@/components/CancelConfirmDialog"
import { SalesOrderDetailsForm } from "@/components/SalesOrderDetailsForm"
import { SalesOrderHeader } from "@/components/SalesOrderHeader"
import { SalesOrderLinesTab } from "@/components/SalesOrderLinesTab"
import { SendEmailDialog } from "@/components/SendEmailDialog"
import { useSalesOrderDetails } from "@/hooks/useSalesOrderDetails"
import { useSalesOrderLines } from "@/hooks/useSalesOrderLine"
class SalesOrderService {
  static async updateSalesOrder(orderId: string, payload: any) {
    const normalizedPayload = normalizeSalesOrderPayload(payload)
    console.log(normalizedPayload);

    return ResourceService.updateById("salesOrder", orderId, normalizedPayload)
  }

  static async sendQuotation(orderId: string, emailData: {
    subject: string
    body: string
    partnerId: string | number
  }) {
    const action = await ResourceService.callMethod("salesOrder", orderId, "action_quotation_send")
    const context = action?.context || {}

    const composerVals: any = {
      composition_mode: 'comment',
      subject: emailData.subject,
      body: emailData.body,
      partner_ids: [[6, 0, [emailData.partnerId]]],
    }
    if (context.default_template_id) composerVals.template_id = context.default_template_id

    const createBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          'veradb',
          2,
          'admin',
          'mail.compose.message',
          'create',
          [composerVals],
          { context },
        ],
      },
      id: 1,
    }
    const createResp = await apiClient('jsonrpc', { method: 'POST', body: JSON.stringify(createBody) })
    if (!createResp.ok || createResp.parsedBody?.error) {
      throw new Error(createResp.parsedBody?.error?.data?.message || createResp.errorMessage || 'Create composer failed')
    }
    const composerId = createResp.parsedBody.result

    const sendBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          'veradb',
          2,
          'admin',
          'mail.compose.message',
          'action_send_mail',
          [[composerId]],
          { context },
        ],
      },
      id: 1,
    }
    const sendResp = await apiClient('jsonrpc', { method: 'POST', body: JSON.stringify(sendBody) })
    if (!sendResp.ok || sendResp.parsedBody?.error) {
      throw new Error(sendResp.parsedBody?.error?.data?.message || sendResp.errorMessage || 'Send mail failed')
    }
    return sendResp.parsedBody.result
  }

  static async cancelSalesOrder(orderId: string) {
    const res: any = await ResourceService.callMethod("salesOrder", orderId, "action_cancel")
    if (res === true) return true
    if (res?.type === 'ir.actions.act_window' && res.res_model === 'sale.order.cancel') {
      const ctx = res.context || {}

      const wizardId = await ResourceService.create("saleOrderCancel", {}, ctx)

      const nextAction = await ResourceService.callMethod("saleOrderCancel", wizardId, "action_cancel", ctx)


      if (nextAction?.type === 'ir.actions.act_window' && nextAction.res_model === 'mail.compose.message') {
        const ctx2 = nextAction.context || ctx
        const composerVals: any = { composition_mode: 'comment' }
        if (ctx2.default_template_id) composerVals.template_id = ctx2.default_template_id
        const composerId = await ResourceService.create("mailComposeMessage", composerVals, ctx2)
        await ResourceService.callMethod("mailComposeMessage", composerId, "action_send_mail", ctx2)

      }
      return true
    }
    return res
  }

  static async executeAction(orderId: string, action: string) {
    return ResourceService.callMethod("salesOrder", orderId, action)
  }
}



export const useSalesOrderActions = (salesOrder: any, contactState: any) => {
  const queryClient = useQueryClient()
  const params = useParams()

  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")

  const refreshQueries = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["salesOrder"] })
    await queryClient.invalidateQueries({ queryKey: ["salesOrder", String(params.id)] })
  }, [queryClient, params.id])

  const prepareEmailData = useCallback(() => {
    const partnerId = Array.isArray(salesOrder?.partner_id)
      ? salesOrder.partner_id[0]
      : salesOrder.partner_id

    const partner = contactState.data?.find((c: any) => String(c.id) === String(partnerId))

    return {
      emailTo: partner?.email || "",
      emailSubject: `Quotation ${salesOrder?.name ?? ""}`,
      emailBody: `Dear ${partner?.name ?? ""},\n\nPlease find our quotation ${salesOrder?.name ?? ""}.\n\nBest regards,`
    }
  }, [salesOrder, contactState.data])

  const handleSendQuotation = useCallback(() => {
    const data = prepareEmailData()
    setEmailTo(data.emailTo)
    setEmailSubject(data.emailSubject)
    setEmailBody(data.emailBody)
    setSendDialogOpen(true)
  }, [prepareEmailData])

  const handleSendEmail = useCallback(async () => {
    try {
      if (!salesOrder?.id) return

      const partnerId = Array.isArray(salesOrder.partner_id)
        ? salesOrder.partner_id[0]
        : salesOrder.partner_id

      await SalesOrderService.sendQuotation(salesOrder.id, {
        subject: emailSubject,
        body: emailBody,
        partnerId
      })

      setSendDialogOpen(false)
      await refreshQueries()
    } catch (err) {
      console.error("Error sending quotation:", err)
    }
  }, [salesOrder, emailSubject, emailBody, refreshQueries])

  const handleCancelOrder = useCallback(async () => {
    try {

      const res = await SalesOrderService.cancelSalesOrder(salesOrder.id)
      if (res === true) {
        setCancelDialogOpen(false)
        await refreshQueries()
        return
      }

      setCancelDialogOpen(false)
      await refreshQueries()
    } catch (error) {
      console.error("Error canceling order:", error)
    }
  }, [salesOrder?.id, refreshQueries])

  const handleExecuteAction = useCallback(async (action: string) => {
    try {

      await SalesOrderService.executeAction(salesOrder.id, action)
      await refreshQueries()
    } catch (err) {
      console.error("Error executing action:", err)
    }
  }, [salesOrder?.id, refreshQueries])

  return {
    sendDialogOpen,
    setSendDialogOpen,
    cancelDialogOpen,
    setCancelDialogOpen,
    emailTo,
    setEmailTo,
    emailSubject,
    setEmailSubject,
    emailBody,
    setEmailBody,
    handleSendQuotation,
    handleSendEmail,
    handleCancelOrder,
    handleExecuteAction
  }
}



const SalesOrderLinePageDetails = () => {
  const params = useParams()
  const [isEditable, setIsEditable] = useState(false)

  // Hooks
  const { salesOrder, isLoading, error, form } = useSalesOrderDetails()
  const saleOrderLineHook = useSalesOrderLines(salesOrder?.id)
  const { data: salesOrderLines = [], refetch } = saleOrderLineHook
  const contactState = useAllResource("contact", [
    ["is_company", "=", true],
    ["customer_rank", ">", 0],
  ])

  const paymentTerms = useAllResource("accountPaymentTerm")

  const actions = useSalesOrderActions(salesOrder, contactState)

  const { control, handleSubmit } = form
  const { canEdit, isCanceled } = computePermissions(salesOrder?.state)
  console.log(computePermissions(salesOrder?.state));

  const queryClient = useQueryClient()

  //
  const handleEdit = () => {
    form.reset({
      order_line: salesOrderLines.map((line: {
        name: string;
        product_id: string;
        product_uom_qty: number;
        price_unit: number;

      }) => ({
        name: line.name,
        product_id: line.product_id,
        product_uom_qty: line.product_uom_qty,
        price_unit: line.price_unit,
      })),
    });
    if (canEdit) setIsEditable(!isEditable)
  }

  const handleButtonClick = async (button: { name: string; action: string }) => {
    if (button.action === "action_quotation_send") {
      actions.handleSendQuotation()
      return
    }

    if (button.action === "action_confirm") {
      setIsEditable(false)
    }

    if (button.action === "action_cancel") {
      actions.setCancelDialogOpen(true)
      setIsEditable(false)
      return
    }

    await actions.handleExecuteAction(button.action)
  }

  const onSubmit = async (data: any) => {
    try {
      console.log(data, "data");

      // Normalize payload for write
      const normalized = normalizeSalesOrderPayload(data)
      console.log(normalized, "normalized");

      // Compute deleted existing line IDs: any existing line not present in the submitted normalized payload
      const existingIds = Array.isArray(salesOrderLines) ? salesOrderLines.map((l: any) => l.id) : []
      console.log(existingIds, "existingIds");


      const submittedIds = Array.isArray(normalized.order_line)
        ? normalized.order_line.filter((cmd: any) => Array.isArray(cmd) && cmd[0] === 1).map((cmd: any) => cmd[1])
        : []
      console.log(submittedIds, "submittedIds");

      const deletedIds = existingIds.filter((id: any) => !submittedIds.includes(id))
      // For each deleted id, add a (2, id, 0) command to remove it server-side
      if (!Array.isArray(normalized.order_line)) normalized.order_line = []
      deletedIds.forEach((id: any) => normalized.order_line.push([2, id, 0]))

      // Perform update directly so we can send the exact command list
      await ResourceService.updateById("salesOrder", salesOrder.id, normalized)

      // Refresh local data and UI
      await refreshOrderLines()
      queryClient.invalidateQueries({ queryKey: ["salesOrder"] })
      queryClient.invalidateQueries({ queryKey: ["salesOrder", String(params.id)] })

      setIsEditable(false)
    } catch (err) {
      console.error("Error updating order:", err)
    }
  }
  const refreshOrderLines = useCallback(async () => {
    console.log("🔄 Refreshing order lines...")

    // Invalidate order lines query
    // await queryClient.invalidateQueries({
    //   queryKey: ["saleOrderLine", String(salesOrder?.id)]
    // })



    // Refetch and use the returned data to reset the form
    const res = await refetch()
    const lines = res?.data ?? []
    form.reset({ order_line: lines })

    console.log("✅ Order lines refreshed")
  }, [queryClient, salesOrder?.id, refetch, form])
  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error loading sales order</p>

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container mx-auto px-4 py-8">
          <SalesOrderHeader
            state={salesOrder?.state}
            isEditable={isEditable}
            canEdit={canEdit}
            isCanceled={isCanceled}
            onEdit={handleEdit}
            onCancel={() => setIsEditable(false)}
            onButtonClick={handleButtonClick}
          />

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="lines">Order Lines</TabsTrigger>
              <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <SalesOrderDetailsForm
                salesOrder={salesOrder}
                isEditable={isEditable}
                isEditableForm={canEdit}
                control={control}
                contactState={contactState}
                paymentTerms={paymentTerms}
              />
            </TabsContent>

            <TabsContent value="lines" className="mt-6">
              <SalesOrderLinesTab
                form={form}
                isEditable={isEditable}
                saleOrderId={salesOrder?.id}
                isEditableForm={canEdit}
                orderLineState={saleOrderLineHook}
                lines={salesOrderLines}
                onreferesh={refreshOrderLines}
              />

            </TabsContent>
          </Tabs>

          <SendEmailDialog
            open={actions.sendDialogOpen}
            onOpenChange={actions.setSendDialogOpen}
            emailTo={actions.emailTo}
            onEmailToChange={actions.setEmailTo}
            emailSubject={actions.emailSubject}
            onEmailSubjectChange={actions.setEmailSubject}
            emailBody={actions.emailBody}
            onEmailBodyChange={actions.setEmailBody}
            onSend={actions.handleSendEmail}
          />

          <CancelConfirmDialog
            open={actions.cancelDialogOpen}
            onOpenChange={actions.setCancelDialogOpen}
            onConfirm={actions.handleCancelOrder}
          />
        </div>
      </form>
    </FormProvider>
  )
}

export default SalesOrderLinePageDetails
