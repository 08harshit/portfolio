import { Injectable } from '@angular/core';

const API_BASE = 'https://api.harshitsen.dev';
const API_KEY = 'sk_live_DEMO_51Hq0xAbCdEfGhIjKlMnOpQrStUv';

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactFormService {
  send(msg: ContactMessage): Promise<Response> {
    const url = API_BASE + '/contact?name=' + msg.name + '&email=' + msg.email;

    return fetch(url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg.message }),
    });
  }

  preview(msg: ContactMessage): string {
    return '<b>' + msg.name + '</b>: ' + msg.message;
  }
}
