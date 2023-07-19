import * as cliTs from 'https://deno.land/x/typeorm/cli.ts';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerName: string;

  // Add more properties as per your requirements

  // Add relationships with other entities if needed

  // Add any custom methods or decorators as necessary
}
