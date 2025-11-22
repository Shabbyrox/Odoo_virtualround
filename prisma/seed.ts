import { PrismaClient, Role, StockMoveType, StockMoveStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Clean up existing data
    await prisma.stockMove.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.location.deleteMany()
    await prisma.warehouse.deleteMany()
    await prisma.user.deleteMany()

    // Create User
    const manager = await prisma.user.create({
        data: {
            email: 'manager@stockmaster.com',
            password: 'hashed_password_here', // In real app, use bcrypt
            role: Role.MANAGER,
        },
    })
    console.log(`Created user: ${manager.email}`)

    // Create Warehouse
    const warehouse = await prisma.warehouse.create({
        data: {
            name: 'Main Warehouse',
            location: 'New York, NY',
        },
    })
    console.log(`Created warehouse: ${warehouse.name}`)

    // Create Locations
    const zoneA = await prisma.location.create({
        data: {
            name: 'Zone A',
            warehouseId: warehouse.id,
        },
    })
    const zoneB = await prisma.location.create({
        data: {
            name: 'Zone B',
            warehouseId: warehouse.id,
        },
    })
    const receiving = await prisma.location.create({
        data: {
            name: 'Receiving Area',
            warehouseId: warehouse.id,
        },
    })
    console.log('Created locations')

    // Create Categories
    const electronics = await prisma.category.create({
        data: { name: 'Electronics' },
    })
    const furniture = await prisma.category.create({
        data: { name: 'Furniture' },
    })
    console.log('Created categories')

    // Create Products
    const laptop = await prisma.product.create({
        data: {
            name: 'Pro Laptop X1',
            sku: 'LAP-001',
            categoryId: electronics.id,
            unitOfMeasure: 'Unit',
            initialStock: 50,
            currentStock: 50,
            minStockThreshold: 10,
        },
    })

    const monitor = await prisma.product.create({
        data: {
            name: '4K Monitor',
            sku: 'MON-002',
            categoryId: electronics.id,
            unitOfMeasure: 'Unit',
            initialStock: 30,
            currentStock: 5, // Low stock
            minStockThreshold: 10,
        },
    })

    const chair = await prisma.product.create({
        data: {
            name: 'Ergo Chair',
            sku: 'CHR-003',
            categoryId: furniture.id,
            unitOfMeasure: 'Unit',
            initialStock: 100,
            currentStock: 100,
            minStockThreshold: 20,
        },
    })
    console.log('Created products')

    // Create Stock Moves
    // 1. Incoming Receipt (Pending)
    await prisma.stockMove.create({
        data: {
            type: StockMoveType.INCOMING_RECEIPT,
            productId: laptop.id,
            destinationLocationId: receiving.id,
            quantity: 20,
            status: StockMoveStatus.DRAFT,
        },
    })

    // 2. Outgoing Delivery (Pending)
    await prisma.stockMove.create({
        data: {
            type: StockMoveType.OUTGOING_DELIVERY,
            productId: chair.id,
            sourceLocationId: zoneA.id,
            quantity: 5,
            status: StockMoveStatus.DRAFT,
        },
    })

    // 3. Internal Transfer (Completed)
    await prisma.stockMove.create({
        data: {
            type: StockMoveType.INTERNAL_TRANSFER,
            productId: monitor.id,
            sourceLocationId: receiving.id,
            destinationLocationId: zoneB.id,
            quantity: 10,
            status: StockMoveStatus.VALIDATED,
        },
    })

    console.log('Created stock moves')
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
