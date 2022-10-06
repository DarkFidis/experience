export interface BaseModelable {
  readonly model: any

  getAll(): Promise<any>
  getById(id: number): Promise<any>
  create(input: any): Promise<any>
}
