import { IsEmail, IsInt, Length } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @Length(3, 20)
  firstName: string

  @Column()
  @Length(3, 30)
  lastName: string

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
