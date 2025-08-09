import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

class SignalRClient {
  private connection: HubConnection | null = null;

  async connect() {
    this.connection = new HubConnectionBuilder()
      .withUrl(process.env.NEXT_PUBLIC_SIGNALR_URL!)
      .withAutomaticReconnect()
      .build();

    await this.connection.start();

    this.connection.on('ReceiveMessage', (message) => {
      // Handle real-time messages
      console.log('ReceiveMessage', message);
    });

    this.connection.on('ProjectUpdate', (update) => {
      // Handle project updates
      console.log('ProjectUpdate', update);
    });
  }

  async disconnect() {
    await this.connection?.stop();
  }
}

export const signalRClient = new SignalRClient();
