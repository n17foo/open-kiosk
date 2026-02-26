import { NotificationService } from '../../services/notifications/NotificationService';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = NotificationService.getInstance();
    service.clearAll();
  });

  it('should be a singleton', () => {
    const a = NotificationService.getInstance();
    const b = NotificationService.getInstance();
    expect(a).toBe(b);
  });

  it('should notify and store notifications', () => {
    service.notify('Test Title', 'Test body', 'info');
    const all = service.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Test Title');
    expect(all[0].message).toBe('Test body');
    expect(all[0].severity).toBe('info');
    expect(all[0].read).toBe(false);
  });

  it('should invoke listeners on notify', () => {
    const listener = jest.fn();
    service.addListener(listener);
    service.notify('Hello', 'World', 'success');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ title: 'Hello' }));
  });

  it('should mark notification as read', () => {
    service.notify('A', 'B', 'info');
    const id = service.getAll()[0].id;
    service.markRead(id);
    expect(service.getAll()[0].read).toBe(true);
  });

  it('should mark all as read', () => {
    service.notify('A', 'B', 'info');
    service.notify('C', 'D', 'warning');
    service.markAllRead();
    const all = service.getAll();
    expect(all.every(n => n.read)).toBe(true);
  });

  it('should clear all notifications', () => {
    service.notify('A', 'B', 'info');
    service.clearAll();
    expect(service.getAll()).toHaveLength(0);
  });

  it('should unsubscribe listeners', () => {
    const listener = jest.fn();
    const unsubscribe = service.addListener(listener);
    unsubscribe();
    service.notify('X', 'Y', 'error');
    expect(listener).not.toHaveBeenCalled();
  });
});
