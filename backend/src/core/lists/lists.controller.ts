import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  create(@Body() createListDto: CreateListDto, @CurrentUser() user: any) {
    return this.listsService.create(createListDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.listsService.findAll(user);
  }

  @Get('board/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.listsService.findByBoardId(+id, user);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
  //   return this.listsService.update(+id, updateListDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.listsService.remove(+id, user);
  }
}
