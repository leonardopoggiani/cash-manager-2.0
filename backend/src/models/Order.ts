import { Entity, PrimaryGeneratedColumn, Column } from "https://deno.land/x/typeorm/mod.ts";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  customerName!: string;
}
1