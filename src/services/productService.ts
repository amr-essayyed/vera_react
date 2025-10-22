import { ResourceService } from "@/services/resourceService"

export class ProductService {
  /**
   * Search for a product by name (case-insensitive)
   */
  static async searchProductByName(name: string): Promise<any | null> {
    try {
      const trimmedName = name.trim()
      if (!trimmedName) return null

      const products = await ResourceService.getAll("product", [
        ["name", "=ilike", trimmedName]
      ])

      // Return exact match first, or first similar match
      if (products && products.length > 0) {
        const exactMatch = products.find((p: any) =>
          p.name.toLowerCase() === trimmedName.toLowerCase()
        )
        return exactMatch || products[0]
      }

      return null
    } catch (error) {
      console.error("Error searching product:", error)
      return null
    }
  }

  /**
   * Create a new product with fallback for different Odoo versions
   */
  static async createProduct(productData: {
    name: string
    price: number
    type?: string
  }): Promise<number> {
    // Minimal required fields that work across all Odoo versions
    const minimalProductVals: any = {
      name: productData.name.trim(),
      list_price: productData.price,
      type: productData.type || 'consu',
      sale_ok: true,
    }

    try {
      console.log("Creating new product (minimal):", minimalProductVals)
      const productId = await ResourceService.create("product", minimalProductVals)
      console.log("✅ Product created with ID:", productId)
      return productId
    } catch (error: any) {
      console.error("❌ Error creating product:", error)

      // If it's a field error, try with even more minimal fields
      if (error?.message?.includes("Invalid field")) {
        console.log("Retrying with absolute minimal fields...")

        const absoluteMinimal = {
          name: productData.name.trim(),
          list_price: productData.price,
        }

        try {
          const productId = await ResourceService.create("product", absoluteMinimal)
          console.log("✅ Product created with minimal fields, ID:", productId)
          return productId
        } catch (retryError) {
          console.error("❌ Failed even with minimal fields:", retryError)
          throw retryError
        }
      }

      throw error
    }
  }

  /**
   * Get existing product or create new one
   */
  static async getOrCreateProduct(name: string, price: number): Promise<{
    id: number
    name: string
    isNew: boolean
  }> {
    // First, search for existing product
    const existingProduct = await this.searchProductByName(name)

    if (existingProduct) {
      console.log(`✅ Found existing product: ${existingProduct.name} (ID: ${existingProduct.id})`)
      return {
        id: existingProduct.id,
        name: existingProduct.name,
        isNew: false
      }
    }

    // If not found, create new product
    console.log(`🔨 Product "${name}" not found, creating new...`)
    const newProductId = await this.createProduct({ name, price })

    return {
      id: newProductId,
      name: name.trim(),
      isNew: true
    }
  }

  /**
   * Batch process products (search or create multiple at once)
   */
  static async batchGetOrCreateProducts(products: Array<{
    name: string
    price: number
  }>): Promise<Array<{
    id: number
    name: string
    isNew: boolean
    originalName: string
  }>> {
    const results = []

    for (const product of products) {
      try {
        const result = await this.getOrCreateProduct(product.name, product.price)
        results.push({
          ...result,
          originalName: product.name
        })
      } catch (error) {
        console.error(`Failed to process product "${product.name}":`, error)
        results.push({
          id: 0,
          name: product.name,
          isNew: false,
          originalName: product.name
        })
      }
    }

    return results
  }
}


export class OrderLineService {
  /**
   * Create a sale order line linked to a sale order
   */
  static async createOrderLine(orderId: number, lineData: {
    product_id: number
    name: string
    product_uom_qty: number
    price_unit: number
    discount?: number
  }) {
    try {
      const payload = {
        order_id: orderId,
        product_id: lineData.product_id,
        name: lineData.name,
        product_uom_qty: lineData.product_uom_qty,
        price_unit: lineData.price_unit,
        ...(lineData.discount && { discount: lineData.discount })
      }

      console.log("Creating order line:", payload)
      const lineId = await ResourceService.create("saleOrderLine", payload)
      console.log("Order line created with ID:", lineId)
      return lineId
    } catch (error) {
      console.error("Error creating order line:", error)
      throw error
    }
  }

  /**
   * Batch create multiple order lines
   */
  static async batchCreateOrderLines(orderId: number, lines: Array<{
    product_id: number
    name: string
    product_uom_qty: number
    price_unit: number
    discount?: number
  }>) {
    const results = []

    for (const line of lines) {
      try {
        const lineId = await this.createOrderLine(orderId, line)
        results.push({ success: true, lineId, productName: line.name })
      } catch (error) {
        console.error(`Failed to create line for ${line.name}:`, error)
        results.push({ success: false, error, productName: line.name })
      }
    }

    return results
  }

  /**
   * Update existing order line
   */
  static async updateOrderLine(orderId: string, lineData: Partial<{
    product_id: number
    name: string
    product_uom_qty: number
    price_unit: number
    discount: number
  }>) {
    return await ResourceService.updateById("saleOrderLine", orderId, lineData)
  }

  /**
   * Delete order line
   */
  static async deleteOrderLine(lineId: string) {
    return await ResourceService.deleteById("saleOrderLine", lineId)
  }
}
