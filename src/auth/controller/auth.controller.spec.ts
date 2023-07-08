import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { AuthRequest } from '../interface';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const userMock = {
    id: 1,
    email: 'test@example.com',
    name: 'Testing Name',
    role: Role.CUSTOMER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, PrismaService, ConfigService, JwtService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signup', () => {
    it('should return a new user', async () => {
      const signupDto = {
        name: 'Testing Name',
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(authService, 'signup').mockResolvedValue(userMock);

      const user = await authController.signup(signupDto);

      expect(user).toEqual({ data: { user: { ...userMock } } });
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('login', () => {
    it('should return a logged in user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const response: any = {};

      jest.spyOn(authService, 'login').mockResolvedValue(userMock);

      const user = await authController.login(loginDto, response);

      expect(user).toEqual({
        data: {
          user: { ...userMock },
        },
      });
      expect(authService.login).toHaveBeenCalledWith(loginDto, response);
    });
  });

  describe('googleAuth', () => {
    it('should return void and delegate to authService.googleAuth', async () => {
      // Mock the dependencies
      jest
        .spyOn(authService, 'googleAuth')
        .mockReturnValueOnce(Promise.resolve());

      // Execute the googleAuth method
      const result = await authController.googleAuth();

      // Assertions
      expect(result).toBeUndefined();
    });
  });

  describe('googleAuthCallback', () => {
    it('should call authService.googleAuth with the provided request and response objects', async () => {
      // Mock the dependencies
      const req = {} as AuthRequest;
      const res = {} as any;
      const googleAuthMock = jest
        .spyOn(authService, 'googleAuth')
        .mockReturnValueOnce(Promise.resolve());

      // Execute the googleAuthCallback method
      const result = await authController.googleAuthCallback(req, res);

      // Assertions
      expect(googleAuthMock).toHaveBeenCalledWith(req, res);
      expect(result).toBeUndefined();
    });
  });
});
