import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

class SignalRClient {
  private connection: HubConnection | null = null;
  private notificationConnection: HubConnection | null = null;

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

  async connectToNotifications(userId: string) {
    this.notificationConnection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_URL!.replace('/chathub', '/notificationhub')}`)
      .withAutomaticReconnect()
      .build();

    await this.notificationConnection.start();

    // Join user group for notifications
    await this.notificationConnection.invoke('JoinUserGroup', userId);

    this.notificationConnection.on('ReceiveNotification', (notification) => {
      // Handle notifications
      console.log('ReceiveNotification', notification);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });
  }

  async disconnect() {
    await this.connection?.stop();
    await this.notificationConnection?.stop();
  }
}

export const signalRClient = new SignalRClient();
