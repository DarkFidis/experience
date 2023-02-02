import { IsEmail, IsInt, Length } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @Length(3, 20)
  username: string

  @Column()
  @IsEmail()
  email: string

  @Column()
  @Length(8, 64)
  password: string

  @Column()
  @IsInt()
  age: number
}
