import { Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { UserService } from '../service/user.service';
import { UserController } from './user.controller';
import { IQuery } from '../interface';

describe('UserController', () => {
  let userController: UserController;

  const userServiceMock = {
    updateMe: jest.fn((dto, user) => ({
      id: 1,
      name: dto.name,
      email: dto.email,
      role: user.role,
    })),
    getUsers: jest.fn(() => ({
      users: [
        {
          id: 1,
          name: 'John',
          email: 'john@example.com',
          role: 'ADMIN',
        },
      ],
      count: 1,
      totalCount: 1,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    })
      .overrideProvider(UserService)
      .useValue(userServiceMock)
      .compile();

    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('getMe', () => {
    it('should return the authenticated user', () => {
      const user: any = {
        id: 1,
        email: 'example@test.com',
        name: 'John Doe',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = userController.getMe(user);

      expect(result).toEqual({ data: { user } });
    });
  });

  describe('updateMe', () => {
    it('should update the authenticated user and return the updated user', async () => {
      const dto: any = { name: 'Updated Name' };
      const user: any = {
        id: 1,
        name: 'John Doe',
        email: 'example@email.com',
        role: Role.CUSTOMER,
      };

      const response: Response = {} as Response;

      const result = await userController.updateMe(dto, user, response);

      expect(result).toEqual({
        data: {
          user: {
            id: 1,
            name: 'Updated Name',
            role: Role.CUSTOMER,
          },
        },
      });
    });
  });

  describe('getUsers', () => {
    it('should get a list of users', async () => {
      const query: IQuery = {
        limit: 10,
        offset: 10,
        orderBy: 'createdAt',
        sortBy: 'asc',
        filters: {},
      };

      const result = await userController.getUsers(query);

      expect(result).toEqual({
        data: {
          users: [
            {
              id: 1,
              name: 'John',
              email: 'john@example.com',
              role: 'ADMIN',
            },
          ],
          count: 1,
          totalCount: 1,
        },
      });
    });
  });
});
