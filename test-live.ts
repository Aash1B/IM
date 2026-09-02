import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const customer = await prisma.customer.create({
    data: {
      name: "THIS IS LIVE DB DATA 🚀",
      email: "live.data@test.com",
      phone: "9999999999"
    }
  });
  
  const service = await prisma.service.findFirst();
  const vehicle = await prisma.vehicle.findFirst();

  if (service && vehicle) {
    await prisma.booking.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        serviceId: service.id,
        status: 'PENDING',
        amount: 9999,
        bookingDate: new Date(),
      }
    });
    console.log("Created custom test booking");
  }
}
main().finally(() => prisma.$disconnect());
