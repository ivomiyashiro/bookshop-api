import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { AuthService, LoginDto, SignupDto } from '../';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService, ConfigService, JwtService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('Signup', () => {
    const dto: SignupDto = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    };

    it('should signup a new user', async () => {
      // Mock hashed password
      const hashedPassword = 'hashedPassword';

      // Mock argon2 hash password
      const hashMock = jest
        .spyOn(argon2, 'hash')
        .mockResolvedValueOnce(hashedPassword);

      // Mock prisma db insertion
      const createUserMock = jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValueOnce({
          id: 1,
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          role: Role.CUSTOMER,
        } as any);

      const result = await authService.signup(dto);

      // Test if hasMock was called with dto.password
      expect(hashMock).toHaveBeenCalledWith(dto.password);

      // Test if createUserMock was called with the correct data to insert
      expect(createUserMock).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
        },
      });

      // Test if signup return the correct user data
      expect(result).toEqual({
        id: 1,
        email: dto.email,
        name: dto.name,
        role: Role.CUSTOMER,
      });
    });

    it('should throw a ConflictException if email is already in use', async () => {
      jest.spyOn(prismaService.user, 'create').mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Email is already in use', {
          code: 'P2002',
          clientVersion: '',
        }),
      );

      // Execute the signup method and expect it to throw a ConflictException
      await expect(authService.signup(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('Login', () => {
    const dto: LoginDto = {
      email: 'test@example.com',
      password: 'password',
    };

    const mockUser = {
      id: 1,
      email: dto.email,
      password: 'hashedPassword',
      name: 'Test User',
      role: Role.CUSTOMER,
    };

    const res = { cookie: jest.fn() } as any;

    it('should authenticate the user and put the ACCESS_TOKEN in cookies', async () => {
      const findFirstOrThrowMock = jest
        .spyOn(prismaService.user, 'findFirstOrThrow')
        .mockResolvedValueOnce(mockUser as any);

      const verifyMock = jest.spyOn(argon2, 'verify').mockResolvedValue(true);

      const signTokenMock = jest
        .spyOn(authService, 'signToken')
        .mockResolvedValueOnce('accessToken');

      const result = await authService.login(dto, res);

      expect(findFirstOrThrowMock).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(verifyMock).toHaveBeenCalledWith(mockUser.password, dto.password);

      expect(signTokenMock).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );

      expect(res.cookie).toHaveBeenCalledWith('ACCESS_TOKEN', 'accessToken', {
        maxAge: 12 * 60 * 60 * 1000,
      });

      expect(result).toEqual({
        id: 1,
        email: dto.email,
        name: 'Test User',
        role: Role.CUSTOMER,
      });
    });

    it('should throw an UnauthorizedException if the email is incorrect', async () => {
      jest.spyOn(prismaService.user, 'findFirstOrThrow').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError(
          'Email or password incorrect.',
          {
            code: 'P2025',
            clientVersion: '',
          },
        ),
      );

      await expect(authService.login(dto, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException if the password is incorrect', async () => {
      jest
        .spyOn(prismaService.user, 'findFirstOrThrow')
        .mockResolvedValueOnce(mockUser as any);

      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(authService.login(dto, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('googleAuth', () => {
    const req = {
      user: {
        id: 1,
        email: 'test@example.com',
        role: Role.CUSTOMER,
      },
    };

    const res = {
      redirect: jest.fn(),
      cookie: jest.fn(),
    } as any;

    it('should authenticate the user with Google and redirect to the client', async () => {
      const signTokenMock = jest
        .spyOn(authService, 'getTokens')
        .mockResolvedValueOnce('accessToken');

      jest.spyOn(configService, 'get').mockReturnValueOnce('CLIENT_ORIGIN');

      // Execute the googleAuth method
      await authService.googleAuth(req as any, res);

      // Assertions
      expect(signTokenMock).toHaveBeenCalledWith(
        1,
        req.user.email,
        Role.CUSTOMER,
      );

      expect(res.cookie).toHaveBeenCalledWith('ACCESS_TOKEN', 'accessToken', {
        maxAge: 12 * 60 * 60 * 1000,
      });

      expect(res.redirect).toHaveBeenCalledWith('CLIENT_ORIGIN');
    });
  });

  describe('signToken', () => {
    const userId = 1;
    const email = 'test@example.com';
    const role = Role.CUSTOMER;

    it('should sign and return a JWT token', async () => {
      const signAsyncMock = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('token');

      jest.spyOn(configService, 'get').mockReturnValueOnce('secret');

      // Execute the signToken method
      const result = await authService.getTokens(userId, email, role);

      // Assertions
      expect(signAsyncMock).toHaveBeenCalledWith(
        { sub: userId, email, role },
        { expiresIn: '12h', secret: 'secret' },
      );
      expect(result).toBe('token');
    });

    it('should return null if an error occurs', async () => {
      const signAsyncMock = jest
        .spyOn(jwtService, 'signAsync')
        .mockRejectedValueOnce(new Error('JWT signing error'));

      jest.spyOn(configService, 'get').mockReturnValueOnce('secret');

      // Execute the signToken method
      const result = await authService.getTokens(userId, email, role);

      // Assertions
      expect(signAsyncMock).toHaveBeenCalledWith(
        { sub: userId, email, role },
        { expiresIn: '12h', secret: 'secret' },
      );
      expect(result).toBeNull();
    });
  });
});
