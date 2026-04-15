import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    except: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationGateway],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);

    (gateway as any).server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should send notification to user', () => {
    gateway.sendToUser('123', { msg: 'hi' });

    expect(mockServer.to).toHaveBeenCalledWith('user_123');
    expect(mockServer.emit).toHaveBeenCalledWith('notification', { msg: 'hi' });
  });

  it('should send global notification', () => {
    gateway.sendGlobal({ x: 1 });

    expect(mockServer.emit).toHaveBeenCalledWith('notification', { x: 1 });
  });

  it('should send to room', () => {
    gateway.sendToRoom('roomA', { ok: true });

    expect(mockServer.to).toHaveBeenCalledWith('roomA');
    expect(mockServer.emit).toHaveBeenCalledWith('notification', { ok: true });
  });
});
