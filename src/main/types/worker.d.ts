export interface Workerable {
  handleSignal(name: string): Promise<void>
  run(): Promise<void>
  shutdown(exitCode?: number): Promise<void>
}
