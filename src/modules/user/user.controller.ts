import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { UserEntity } from "./dto/user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() data: UserEntity) {
    return this.userService.create(data);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() data: UserEntity) {
    return this.userService.update(id, data);
  }

  @Get()
  async list() {
    return this.userService.list();
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.userService.delete(id);
  }

  @Get(":token")
  async findToken(@Param("token") token: string) {
    return this.userService.findToken(token);
  }

  @Get("/")
  async test() {
    return "Hello World";
  }
}
