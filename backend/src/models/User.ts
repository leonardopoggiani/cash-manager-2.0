import * as cliTs from 'https://deno.land/x/typeorm/cli.ts';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;
}
