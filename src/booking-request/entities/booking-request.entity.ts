// entities/booking-request.entity.ts

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export type BookingRequestStatus =
  | 'pending_review'
  | 'contacted'
  | 'converted'
  | 'rejected';

export type ShuttleType =
  | 'airport'
  | 'wedding'
  | 'tour'
  | 'event'
  | 'luxury'
  | 'standard';

@Entity('booking_requests')
export class BookingRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  shuttleType!: ShuttleType;

  @Column()
  pickupLocation!: string;

  @Column()
  dropoffLocation!: string;

  @Column()
  bookingDate!: string;

  @Column()
  pickupTime!: string;

  @Column({ default: 1 })
  numberOfPassengers!: number;

  @Column({ nullable: true })
  specialRequests?: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column()
  phoneNumber!: string;

  @Column({ nullable: true })
  airport?: string;

  @Column({ nullable: true })
  flightNumber?: string;

  @Column({ nullable: true })
  terminal?: string;

  @Column({ nullable: true })
  weddingVenue?: string;

  @Column({ nullable: true })
  weddingDate?: string;

  @Column({ nullable: true })
  numberOfCars?: number;

  @Column({ nullable: true })
  tourPackage?: string;

  @Column({ nullable: true })
  tourDuration?: number;

  @Column({ nullable: true })
  accommodationType?: string;

  @Column({ default: 'pending_review' })
  status!: BookingRequestStatus;

  @Column({ default: 'booking-page' })
  source!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
