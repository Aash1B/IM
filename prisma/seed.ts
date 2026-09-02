import { PrismaClient, Role, BookingStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const REALISTIC_SERVICES = [
  { name: 'Full Synthetic Oil & Filter Change', description: 'High grade synthetic engine oil, OES filter, and 15-point safety inspection.', price: 1499 },
  { name: 'Brake Pad Replacement & Rotor Service', description: 'Front/rear ceramic brake pads installation and rotor resurfacing.', price: 2299 },
  { name: 'Complete AC Servicing & Gas Refill', description: 'R134a refrigerant top-up, evaporator & condenser deep cleaning.', price: 1850 },
  { name: 'Computerized Engine Diagnostic', description: 'OBD-II scanner diagnostic, sensor readout, and ECU fault code clearance.', price: 799 },
  { name: 'Wheel Alignment & 4-Wheel Balancing', description: '3D laser wheel alignment and dynamic counter-weight wheel balancing.', price: 650 },
  { name: 'Battery Health Check & Replacement', description: 'Heavy-duty zero-maintenance battery installation with 36-month warranty.', price: 4500 },
  { name: 'Transmission Fluid Flush & Service', description: 'Complete automatic/manual gearbox oil flush and filter replacement.', price: 2800 },
  { name: 'Suspension & Shock Absorber Overhaul', description: 'Front strut replacement, lower control arm, and sway bar bushing check.', price: 3600 },
  { name: 'Radiator Coolant Flush & Pressure Test', description: 'Organic acid technology coolant flush and cooling system pressure test.', price: 950 },
  { name: 'Premium Interior Detailing & Sanitization', description: 'Deep foam shampooing, leather conditioning, and anti-bacterial ozone treatment.', price: 1200 },
  { name: 'Clutch Assembly Replacement', description: 'Friction plate, pressure plate, flywheel check, and release bearing setup.', price: 5400 },
  { name: 'Spark Plug Replacement & Injector Cleaning', description: 'Laser Iridium spark plugs and ultrasonic fuel injector cleaning.', price: 1750 },
];

const REALISTIC_VEHICLES = [
  { make: 'Maruti Suzuki', models: ['Swift', 'Baleno', 'Brezza', 'Ertiga', 'Dzire'] },
  { make: 'Hyundai', models: ['Creta', 'i20', 'Venue', 'Verna'] },
  { make: 'Tata', models: ['Nexon', 'Punch', 'Harrier', 'Safari', 'Altroz'] },
  { make: 'Mahindra', models: ['Thar', 'XUV700', 'Scorpio-N', 'Bolero'] },
  { make: 'Honda', models: ['City', 'Amaze', 'Civic'] },
  { make: 'Toyota', models: ['Fortuner', 'Innova Crysta', 'Glanza'] },
  { make: 'Kia', models: ['Seltos', 'Sonet', 'Carens'] },
  { make: 'Volkswagen', models: ['Virtus', 'Taigun', 'Polo'] },
  { make: 'Skoda', models: ['Slavia', 'Kushaq'] },
  { make: 'BMW', models: ['3 Series', 'X3'] },
];

function getRandomLicensePlate() {
  const states = ['DL', 'MH', 'KA', 'HR', 'UP', 'TS', 'GJ'];
  const state = faker.helpers.arrayElement(states);
  const code = String(faker.number.int({ min: 1, max: 99 })).padStart(2, '0');
  const letters = faker.string.alpha({ length: 2, casing: 'upper' });
  const digits = String(faker.number.int({ min: 1000, max: 9999 }));
  return `${state}-${code}-${letters}-${digits}`;
}

async function main() {
  console.log('Clearing old database records...');
  await prisma.notification.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.mechanicLocation.deleteMany();
  await prisma.mechanic.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Realistic Automotive Services...');
  await prisma.service.createMany({ data: REALISTIC_SERVICES });
  const services = await prisma.service.findMany();

  console.log('Seeding Users (Admin & Operations)...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const usersData = Array.from({ length: 50 }).map((_, i) => ({
    email: i === 0 ? 'admin@instantmechanic.com' : faker.internet.email().toLowerCase(),
    password: hashedPassword,
    role: i === 0 ? Role.ADMIN : Role.OPERATIONS,
  }));
  await prisma.user.createMany({ data: usersData });
  const users = await prisma.user.findMany();

  console.log('Seeding Customers...');
  const customersData = Array.from({ length: 60 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
  }));
  await prisma.customer.createMany({ data: customersData });
  const customers = await prisma.customer.findMany();

  console.log('Seeding Vehicles...');
  const vehiclesData = Array.from({ length: 120 }).map(() => {
    const brand = faker.helpers.arrayElement(REALISTIC_VEHICLES);
    const model = faker.helpers.arrayElement(brand.models);
    return {
      make: brand.make,
      model,
      year: faker.number.int({ min: 2016, max: 2025 }),
      licensePlate: getRandomLicensePlate(),
      customerId: faker.helpers.arrayElement(customers).id,
    };
  });
  await prisma.vehicle.createMany({ data: vehiclesData });
  const vehicles = await prisma.vehicle.findMany();

  console.log('Seeding Certified Mechanics...');
  const mechanicsData = Array.from({ length: 25 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
  }));
  await prisma.mechanic.createMany({ data: mechanicsData });
  const mechanics = await prisma.mechanic.findMany();

  console.log('Seeding Delhi NCR Mechanic Locations...');
  const locationsData = mechanics.map(mechanic => ({
    latitude: 28.5355 + (Math.random() - 0.5) * 0.3,
    longitude: 77.3910 + (Math.random() - 0.5) * 0.3,
    mechanicId: mechanic.id,
  }));
  await prisma.mechanicLocation.createMany({ data: locationsData });

  console.log('Seeding Bookings & Status History...');
  const statuses = [
    BookingStatus.PENDING,
    BookingStatus.ASSIGNED,
    BookingStatus.MECHANIC_ON_THE_WAY,
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED,
  ];

  for (let i = 0; i < 50; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const customerVehicles = vehicles.filter(v => v.customerId === customer.id);
    const vehicle = customerVehicles.length > 0 
      ? faker.helpers.arrayElement(customerVehicles) 
      : faker.helpers.arrayElement(vehicles);

    const service = faker.helpers.arrayElement(services);
    const currentStatusIndex = faker.number.int({ min: 0, max: statuses.length - 1 });
    const currentStatus = statuses[currentStatusIndex];
    const mechanic = currentStatusIndex > 0 ? faker.helpers.arrayElement(mechanics) : null;
    const bookingDate = faker.date.recent({ days: 45 });

    const booking = await prisma.booking.create({
      data: {
        customerId: vehicle.customerId,
        vehicleId: vehicle.id,
        serviceId: service.id,
        mechanicId: mechanic?.id,
        status: currentStatus,
        amount: service.price,
        bookingDate,
      },
    });

    const historyData = [];
    for (let j = 0; j <= currentStatusIndex; j++) {
      historyData.push({
        bookingId: booking.id,
        fromStatus: j === 0 ? null : statuses[j - 1],
        toStatus: statuses[j],
        createdAt: new Date(bookingDate.getTime() + j * 3600000),
      });
    }

    if (Math.random() > 0.5) {
      await prisma.notification.create({
        data: {
          userId: faker.helpers.arrayElement(users).id,
          message: `Update on booking #${booking.id.substring(0, 8).toUpperCase()}: Status updated to ${currentStatus.replace(/_/g, ' ')}`,
          read: faker.datatype.boolean(),
        }
      });
    }

    await prisma.bookingStatusHistory.createMany({ data: historyData });
  }

  console.log('Seeding finished successfully with realistic automotive data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
