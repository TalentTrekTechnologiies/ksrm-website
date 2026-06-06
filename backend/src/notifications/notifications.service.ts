import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface Notification {
  id: string;
  text: string;
  active: boolean;
  createdAt: string;
}

@Injectable()
export class NotificationsService {
  private readonly filePath = join(process.cwd(), 'data', 'notifications.json');

  private read(): Notification[] {
    if (!existsSync(this.filePath)) return [];
    return JSON.parse(readFileSync(this.filePath, 'utf8'));
  }

  private write(data: Notification[]): void {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  // Public: only active notifications for the ticker
  findActive(): Notification[] {
    return this.read().filter((n) => n.active);
  }

  // Admin: all notifications
  findAll(): Notification[] {
    return this.read();
  }

  create(text: string): Notification {
    const data = this.read();
    const item: Notification = {
      id: Date.now().toString(),
      text: text.trim(),
      active: true,
      createdAt: new Date().toISOString(),
    };
    data.push(item);
    this.write(data);
    return item;
  }

  toggle(id: string): Notification | null {
    const data = this.read();
    const item = data.find((n) => n.id === id);
    if (!item) return null;
    item.active = !item.active;
    this.write(data);
    return item;
  }

  remove(id: string): boolean {
    const data = this.read();
    const filtered = data.filter((n) => n.id !== id);
    if (filtered.length === data.length) return false;
    this.write(filtered);
    return true;
  }
}
