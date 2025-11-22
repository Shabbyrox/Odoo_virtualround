
import { db } from "./lib/db"
import { StockMoveType, StockMoveStatus } from "@prisma/client"

async function main() {
    console.log("Starting verification...")

    // 1. Create a Product
    const product = await db.product.create({
        data: {
            name: "Test Product " + Date.now(),
            sku: "TEST-" + Date.now(),
            // categoryId removed because we are creating category inline
            unitOfMeasure: "Units",
            initialStock: 0,
            currentStock: 0,
            minStockThreshold: 10,
            category: {
                create: {
                    name: "Test Category " + Date.now()
                }
            }
        }
    })
    console.log("Created Product:", product.id, product.name)

    // 2. Create Incoming Receipt (Draft)
    const receipt = await db.stockMove.create({
        data: {
            type: StockMoveType.INCOMING_RECEIPT,
            productId: product.id,
            quantity: 100,
            status: StockMoveStatus.DRAFT
        }
    })
    console.log("Created Receipt:", receipt.id)

    // 3. Validate Receipt
    await db.$transaction(async (tx) => {
        await tx.product.update({
            where: { id: product.id },
            data: { currentStock: { increment: 100 } }
        })
        await tx.stockMove.update({
            where: { id: receipt.id },
            data: { status: StockMoveStatus.VALIDATED }
        })
    })
    console.log("Validated Receipt")

    // 4. Check Stock
    const pAfterReceipt = await db.product.findUnique({ where: { id: product.id } })
    console.log("Stock after receipt:", pAfterReceipt?.currentStock)
    if (pAfterReceipt?.currentStock !== 100) throw new Error("Stock mismatch after receipt")

    // 5. Create Delivery (Draft)
    const delivery = await db.stockMove.create({
        data: {
            type: StockMoveType.OUTGOING_DELIVERY,
            productId: product.id,
            quantity: 30,
            status: StockMoveStatus.DRAFT
        }
    })
    console.log("Created Delivery:", delivery.id)

    // 6. Validate Delivery
    await db.$transaction(async (tx) => {
        await tx.product.update({
            where: { id: product.id },
            data: { currentStock: { increment: -30 } }
        })
        await tx.stockMove.update({
            where: { id: delivery.id },
            data: { status: StockMoveStatus.VALIDATED }
        })
    })
    console.log("Validated Delivery")

    // 7. Check Stock
    const pAfterDelivery = await db.product.findUnique({ where: { id: product.id } })
    console.log("Stock after delivery:", pAfterDelivery?.currentStock)
    if (pAfterDelivery?.currentStock !== 70) throw new Error("Stock mismatch after delivery")

    console.log("Verification Successful!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
