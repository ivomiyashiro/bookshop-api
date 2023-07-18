import { Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { UserService } from '../service/user.service';
import { AuthUser } from 'src/common/decorators';
import { UpdateMeDto, UpdateUserDto } from '../dto';
import { Roles } from '../decorator';
import { RolesGuard } from '../guard';
import { IQuery } from '../interface';
import { UserFilterPipe, UpdateMePipe, UpdateUserPipe } from '../pipe';

@Controller('api/')
export class UserController {
  constructor(private userService: UserService) {}
  // Client routers --->
  @Get('storefront/users/me')
  getMe(@AuthUser() user: User) {
    return { data: { user } };
  }

  @Put('storefront/users/me')
  async updateMe(
    @Body(UpdateMePipe) dto: UpdateMeDto,
    @AuthUser() me: Omit<User, 'password'>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.updateMe(dto, me, res);

    return { data: { user } };
  }

  // Admin routers --->
  @Get('admin/users')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getUsers(@Query(UserFilterPipe) query: IQuery) {
    const { users, count, totalCount } = await this.userService.getUsers(query);

    return { data: { users, count, totalCount } };
  }

  @Get('admin/users/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getUser(@Param('id', new ParseIntPipe()) id: number) {
    const user = await this.userService.getUser(id);

    return { data: { user } };
  }

  @Put('admin/users/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateUsers(
    @Body(UpdateUserPipe) dto: UpdateUserDto,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    const user = await this.userService.updateUser(id, dto);

    return { data: { user } };
  }

  @Delete('admin/users/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteUsers(@Param('id', new ParseIntPipe()) id: number) {
    await this.userService.deleteUser(id);

    return {
      data: {
        message: [`User ${id} has been deleted`],
      },
    };
  }
}
