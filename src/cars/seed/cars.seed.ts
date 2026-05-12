// src/cars/seed/cars.seed.ts

import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CarSchema } from '../schema/car.schema';

dotenv.config();

const CarModel = mongoose.model('Car', CarSchema);

async function seed() {
  console.log('🚀 Connecting to DB...');

  await mongoose.connect(process.env.MONGO_URL as string);

  console.log('✅ DB connected');

  await CarModel.deleteMany({});
  console.log('🧹 Old data cleared');

  const cars = [
    {
      category: 'Saloon vehicles',
      model: 'Corolla',
      subModel: '2016',
      name: 'Toyota Corolla (2016)',
      description:
        'Reliable and fuel-efficient saloon car for city and business trips.',
      features: [
        'A/C',
        'Quality fabric seats',
        'Bluetooth, USB, touchscreen',
        'Reverse camera, ABS',
      ],
      images: [
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755269093/Novo-Image-1_fde2sm.jpg',
      ],
      price: 67200,
    },
    {
      category: 'Saloon vehicles',
      model: 'Corolla',
      subModel: '2018',
      name: 'Toyota Corolla (2018)',
      description:
        'Modern and efficient saloon vehicle with enhanced safety features.',
      features: [
        'Air conditioning',
        'Quality fabric seats',
        'Bluetooth, USB, touchscreen',
        'Advanced stability & safety systems',
      ],
      images: [
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755188149/2018_Corolla_front_ubyefn.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755188148/2018_Corolla_with_Driver_vizuyh.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755188146/2018_Corolla_dashboard_zcuo0d.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755188154/2018_Corolla_rear_seat_zjzgj2.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755188146/2018_Corolla_rear_udhmtv.jpg',
      ],
      price: 81600,
    },
    {
      category: 'SUVs',
      model: 'Prado',
      subModel: '2020 Upgraded',
      name: 'Toyota Prado (2020 Upgraded)',
      description:
        'Enhanced performance and safety with advanced infotainment.',
      features: [
        'Touchscreen infotainment',
        'Reverse camera & parking sensors',
        'Premium interior (leather)',
        'Advanced safety systems',
      ],
      images: [
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755187206/AD36C12D-785A-41F1-B5DD-D77A0B1E4E65_f1rlla.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755187208/Prado_dashboard_vcoi8p.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755187214/Prado_seat_xdmkqn.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755187194/5CF9F486-13B3-49B3-A1C8-D611C057EC76_wkozjq.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755187194/0618E4F1-CD7D-4930-B6C2-31FD7FF90E82_rrwig4.jpg',
      ],
      price: 193200,
    },
    {
      category: 'SUVs',
      model: 'Land Cruiser',
      subModel: '2022 Upgraded',
      name: 'Toyota Land Cruiser (2022 Upgraded)',
      description: 'Luxury SUV with power and comfort for VIP travel.',
      features: [
        'Luxury interior',
        'Touchscreen infotainment',
        'Reverse camera & parking sensors',
        'Advanced safety features',
        'Enhanced comfort and ride quality',
      ],
      images: [
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755186271/DE7A2EFC-8385-4AB4-A908-0CC027B73B68_yikiw0.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755186270/6CFF0B2C-9378-45CE-A8EC-CADA94E0A845_nopfei.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755186267/C2AB5C21-0674-48D0-AB0A-108A629601BA_l3spnt.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755186267/D9543E68-7A8D-4260-9AD3-C837BF648E2D_p5vo1o.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755186277/E3F47804-6C6C-4A42-B8B3-EF776E44C17E_b9rlrn.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755186276/E167930F-80D6-40B5-B4B3-8DE37D6E9FDC_mkuose.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755186286/F7398DDC-BACD-4654-A01D-32ABDFE3AC3E_yqs6hu.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755186284/F4014288-53C8-4422-89EE-502A5366A02B_oakirc.jpg',
      ],
      price: 208800,
    },
    {
      category: 'Delivery vans',
      model: 'Hilux',
      subModel: '2020 Upgraded',
      name: 'Toyota Hilux (2020 Upgraded)',
      description:
        'Durable utility vehicle suitable for logistics and official operations.',
      features: [
        'Amber light & siren',
        'High load and towing capacity',
        'Touchscreen infotainment',
        'Reverse camera & sensors',
        'Durable suspension',
        'Advanced safety features',
      ],
      images: [
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755187529/hilux_side_view_if3zxu.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755187528/Hilus_Dashboard_ezq9e9.jpg',
      ],
      price: 139200,
    },
    {
      category: 'Buses',
      model: 'Hiace',
      subModel: '2011 Mid Roof',
      name: 'Toyota Hiace Mid Roof (2011)',
      description: 'Efficient mini-bus ideal for group transportation.',
      features: [
        'Mid-roof design',
        '10–14 seating capacity',
        'Front/rear air conditioning',
        'Sliding side door',
        'Basic audio system',
        'Strong suspension',
      ],
      images: [
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755187529/hilux_side_view_if3zxu.jpg',
        'https://res.cloudinary.com/djogptxxc/image/upload/v1755187528/Hilus_Dashboard_ezq9e9.jpg',
      ],
      price: 148800,
    },
    {
      category: 'Buses',
      model: 'Hiace',
      subModel: '2017 High Roof',
      name: 'Toyota Hiace High Roof (2017)',
      description: 'Spacious high-roof bus built for long-distance travel.',
      features: [
        'High-roof design',
        '10–15 seating capacity',
        'Front/rear AC vents',
        'Sliding door',
        'Bluetooth/USB audio system',
        'Built for long-distance travel',
      ],
      images: [],
      price: 174000,
    },
    {
      category: 'Buses',
      model: 'Coaster',
      subModel: '2022',
      name: 'Toyota Coaster (2022)',
      description:
        'Large capacity bus suitable for corporate and group transport.',
      features: [
        '19–30 seating capacity',
        'Spacious high-roof design',
        'Front/rear AC',
        'Sliding door',
        'Improved suspension',
        'Advanced safety systems',
      ],
      images: [],
      price: 361200,
    },
  ];

  await CarModel.insertMany(cars);

  console.log('✅ Cars seeded successfully');

  await mongoose.disconnect();
  console.log('🔌 Disconnected');
}

seed().catch((err) => {
  console.error('❌ Error seeding:', err);
});
