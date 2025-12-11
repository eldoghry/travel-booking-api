export interface ICommandContext {}

export abstract class CommandHandler<ICommandContext> {
  private next: CommandHandler<ICommandContext> | null = null;

  setNext(handler: CommandHandler<ICommandContext>): CommandHandler<ICommandContext> {
    this.next = handler;
    return handler;
  }

  async handle(context: ICommandContext): Promise<ICommandContext> {
    const updatedContext = await this.execute(context);

    if (this.next) {
      return this.next.handle(updatedContext);
    }

    return updatedContext;
  }

  abstract execute(context: ICommandContext): Promise<ICommandContext>;
}
