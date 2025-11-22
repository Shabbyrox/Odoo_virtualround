'use server'

import { db } from "@/lib/db"
import { StockMoveType, StockMoveStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.string().min(1, "Category is required"),
  unitOfMeasure: z.string().min(1, "Unit of Measure is required"),
  initialStock: z.coerce.number().int().nonnegative().default(0),
  minStockThreshold: z.coerce.number().int().nonnegative().default(0),
})

export async function createProduct(formData: FormData) {
  const validatedFields = productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    unitOfMeasure: formData.get("unitOfMeasure"),
    initialStock: formData.get("initialStock"),
    minStockThreshold: formData.get("minStockThreshold"),
  })

  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error.flatten() }
  }

  const { name, sku, categoryId, unitOfMeasure, initialStock, minStockThreshold } = validatedFields.data

  try {
    const product = await db.product.create({
      data: {
        name,
        sku,
        categoryId,
        unitOfMeasure,
        initialStock,
        currentStock: initialStock, // Set current stock to initial stock
        minStockThreshold,
      },
    })

    // Optionally create an initial stock move if initialStock > 0
    if (initialStock > 0) {
      await db.stockMove.create({
        data: {
          type: StockMoveType.ADJUSTMENT,
          productId: product.id,
          quantity: initialStock,
          status: StockMoveStatus.VALIDATED,
        },
      })
    }

    revalidatePath("/dashboard/products")
    return { success: true, product }
  } catch (error) {
    console.error("Failed to create product:", error)
    return { error: "Failed to create product" }
  }
}

export async function validateMove(moveId: string) {
  try {
    await db.$transaction(async (tx) => {
      const move = await tx.stockMove.findUnique({
        where: { id: moveId },
      })

      if (!move) {
        throw new Error("Stock move not found")
      }

      if (move.status !== StockMoveStatus.DRAFT) {
        throw new Error("Stock move is already validated or cancelled")
      }

      let stockChange = 0

      switch (move.type) {
        case StockMoveType.INCOMING_RECEIPT:
          stockChange = move.quantity
          break
        case StockMoveType.OUTGOING_DELIVERY:
          stockChange = -move.quantity
          break
        case StockMoveType.ADJUSTMENT:
          // For adjustment, we assume quantity is the delta to apply
          // Or if it's a "set to" operation, we need to know the current stock.
          // Given the schema doesn't have "targetQuantity", we assume 'quantity' in StockMove is the change amount.
          stockChange = move.quantity
          break
        case StockMoveType.INTERNAL_TRANSFER:
          // Internal transfer doesn't change total stock
          stockChange = 0
          break
      }

      // Update Product Stock
      if (stockChange !== 0) {
        await tx.product.update({
          where: { id: move.productId },
          data: {
            currentStock: {
              increment: stockChange,
            },
          },
        })
      }

      // Update Move Status
      await tx.stockMove.update({
        where: { id: moveId },
        data: {
          status: StockMoveStatus.VALIDATED,
        },
      })
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to validate move:", error)
    return { error: error instanceof Error ? error.message : "Failed to validate move" }
  }
}

// Helper to create a stock move (e.g. from UI)
const moveSchema = z.object({
  type: z.nativeEnum(StockMoveType),
  productId: z.string().min(1),
  sourceLocationId: z.string().optional(),
  destinationLocationId: z.string().optional(),
  quantity: z.coerce.number().int(),
})

export async function createStockMove(formData: FormData) {
    const validatedFields = moveSchema.safeParse({
        type: formData.get("type"),
        productId: formData.get("productId"),
        sourceLocationId: formData.get("sourceLocationId"),
        destinationLocationId: formData.get("destinationLocationId"),
        quantity: formData.get("quantity"),
    })

    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten() }
    }

    const { type, productId, sourceLocationId, destinationLocationId, quantity } = validatedFields.data

    try {
        await db.stockMove.create({
            data: {
                type,
                productId,
                sourceLocationId,
                destinationLocationId,
                quantity,
                status: StockMoveStatus.DRAFT
            }
        })
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to create stock move:", error)
        return { error: "Failed to create stock move" }
    }
}
