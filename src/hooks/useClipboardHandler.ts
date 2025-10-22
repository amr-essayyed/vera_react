import { OrderLineService, ProductService } from "@/services/productService"
import { useCallback, useState } from "react"

interface ISelectedCell {
  form: any
  fields: any[]
  orderId: number // Add orderId to link products to sale order
  append: (data: { name: string; product_id?: number; product_uom_qty: number; price_unit: number }) => void
  selectedCell: { row: number; col: number } | null
  handleImagePaste: (e: React.ClipboardEvent, rowIndex: number) => Promise<void>
  onRefresh?: () => Promise<void> // Callback to refresh order lines after creation
}

export function useClipboardHandler({
  form,
  fields,
  append,
  selectedCell,
  handleImagePaste
}: ISelectedCell) {
  const [isProcessing, setIsProcessing] = useState(false)

  const parseClipboardData = useCallback((text: string) => {
    return text.trim().split("\n").map((r) => r.split("\t"))
  }, [])

  /**
   * Process pasted data and search/create products
   */
  const processPastedProducts = useCallback(async (
    data: string[][],
    startRow: number,
    startCol: number
  ) => {
    setIsProcessing(true)

    try {
      // Collect all products that need to be searched/created
      const productsToProcess: Array<{
        name: string
        quantity: number
        price: number
        rowIndex: number
      }> = []

      data.forEach((row, rIndex) => {
        const targetRow = startRow + rIndex
        let name = ""
        let quantity = 1
        let price = 0

        row.forEach((cell, cIndex) => {
          const col = startCol + cIndex
          switch (col) {
            case 1: // Product Name
              name = cell?.trim() || ""
              break
            case 2: // Quantity
              quantity = parseFloat(cell) || 1
              break
            case 3: // Price
              price = parseFloat(cell) || 0
              break
          }
        })

        if (name) {
          productsToProcess.push({
            name,
            quantity,
            price,
            rowIndex: targetRow
          })
        }
      })

      console.log("Processing products:", productsToProcess)

      // Ensure we have enough rows
      const requiredRows = startRow + data.length
      if (requiredRows > fields.length) {
        const toAdd = requiredRows - fields.length
        for (let i = 0; i < toAdd; i++) {
          append({ name: "", product_uom_qty: 1, price_unit: 0 })
        }
      }

      // Process each product sequentially
      let processedCount = 0
      let createdCount = 0

      for (const product of productsToProcess) {
        try {
          // Search for existing product or create new one
          const result = await ProductService.getOrCreateProduct(
            product.name,
            product.price
          )

          console.log(form.getValues().id);

          if (result.isNew) {
            await OrderLineService.createOrderLine(form.getValues().id, {
              product_id: result.id,
              name: result.name,
              product_uom_qty: product.quantity,
              price_unit: product.price
            })
            createdCount++
          }

          // Update form with product data
          form.setValue(`order_line.${product.rowIndex}.product_id`, result.id)
          form.setValue(`order_line.${product.rowIndex}.name`, result.name)
          form.setValue(`order_line.${product.rowIndex}.product_uom_qty`, product.quantity)
          form.setValue(`order_line.${product.rowIndex}.price_unit`, product.price)

          processedCount++
          console.log(`✓ Processed: ${result.name} (${result.isNew ? 'NEW' : 'EXISTING'})`)
        } catch (error) {
          console.error(`✗ Failed to process product "${product.name}":`, error)
          // Still set the data even if product creation failed
          form.setValue(`order_line.${product.rowIndex}.name`, product.name)
          form.setValue(`order_line.${product.rowIndex}.product_uom_qty`, product.quantity)
          form.setValue(`order_line.${product.rowIndex}.price_unit`, product.price)
        }
      }

      console.log(`\n📊 Summary:`)
      console.log(`   Total processed: ${processedCount}/${productsToProcess.length}`)
      console.log(`   New products created: ${createdCount}`)
      console.log(`   Existing products found: ${processedCount - createdCount}`)

      // Optional: Show toast notification
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast({
          title: "Products Pasted",
          description: `${processedCount} products added (${createdCount} new, ${processedCount - createdCount} existing)`,
        })
      }

    } catch (error) {
      console.error("Error processing pasted products:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [fields.length, append, form])

  /**
   * Main paste handler
   */
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    if (!selectedCell) return

    // Handle image paste in first column
    if (selectedCell.col === 0) {
      await handleImagePaste(e, selectedCell.row)
      return
    }

    e.preventDefault()

    if (isProcessing) {
      console.log("Already processing, please wait...")
      return
    }

    const text = e.clipboardData.getData("text")
    const data = parseClipboardData(text)

    if (!data.length) return

    console.log("\n🔄 Starting paste operation...")
    console.log(`   Starting cell: Row ${selectedCell.row}, Col ${selectedCell.col}`)
    console.log(`   Data rows: ${data.length}`)

    // Process the pasted data with product search/creation
    await processPastedProducts(data, selectedCell.row, selectedCell.col)

  }, [
    selectedCell,
    isProcessing,
    handleImagePaste,
    parseClipboardData,
    processPastedProducts
  ])

  return { handlePaste, isProcessing }
}
