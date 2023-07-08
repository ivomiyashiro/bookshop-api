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
import { JwtGuard } from '../../auth/guard';
import { AuthUser } from 'src/auth';
import { UserService } from '../service/user.service';
import { UpdateMeDto, UpdateUserDto } from '../dto';
import { Roles } from '../decorator';
import { RolesGuard } from '../guard';
import { IQuery } from '../interface';
import { UserFilterPipe, UpdateMePipe } from '../pipe';
import { UpdateUserPipe } from '../pipe/updateUser.pipe';

@Controller('api/')
export class UserController {
  constructor(private userService: UserService) {}
  // Client routers --->
  @UseGuards(JwtGuard)
  @Get('storefront/users/me')
  getMe(@AuthUser() user: User) {
    return { data: { user } };
  }

  @UseGuards(JwtGuard)
  @Put('storefront/users/me')
  async updateMe(
    @Body(UpdateMePipe) dto: UpdateMeDto,
    @AuthUser() me: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.updateMe(dto, me, res);

    return { data: { user } };
  }

  // Admin routers --->
  @Get('admin/users')
  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  async getUsers(@Query(UserFilterPipe) query: IQuery) {
    const { users, totalCount } = await this.userService.getUsers(query);

    return { data: { users, count: users.length, totalCount } };
  }

  @Get('admin/users/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  async getUser(@Param('id', new ParseIntPipe()) id: number) {
    const user = await this.userService.getUser(id);

    return { data: { user } };
  }

  @Put('admin/users/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  async updateUsers(
    @Body(UpdateUserPipe) dto: UpdateUserDto,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    const user = await this.userService.updateUser(id, dto);

    return { data: { user } };
  }

  @Delete('admin/users/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  async deleteUsers(@Param('id', new ParseIntPipe()) id: number) {
    await this.userService.deleteUser(id);

    return {
      data: {
        message: [`User ${id} has been deleted`],
      },
    };
  }
}
