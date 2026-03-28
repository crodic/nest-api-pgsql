import { ID } from '@/common/types/common.type';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { ValidationException } from '@/exceptions/validation.exception';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import assert from 'assert';
import { plainToInstance } from 'class-transformer';
import { ClsService } from 'nestjs-cls';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { CreateUserReqDto } from './dto/create-user.req.dto';
import { UpdateUserReqDto } from './dto/update-user.req.dto';
import { UserResDto } from './dto/user.res.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private cls: ClsService,
  ) {}

  async findAllUser(query: PaginateQuery): Promise<Paginated<UserResDto>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const result = await paginate(query, queryBuilder, {
      sortableColumns: ['id', 'email', 'createdAt', 'updatedAt'],
      searchableColumns: ['email', 'id'],
      defaultSortBy: [['id', 'DESC']],
      relations: [],
      filterableColumns: {
        createdAt: [FilterOperator.BTW],
        email: [FilterOperator.ILIKE],
        username: [FilterOperator.ILIKE],
        id: [FilterOperator.EQ],
      },
    });

    return {
      ...result,
      data: plainToInstance(UserResDto, result.data, {
        excludeExtraneousValues: true,
      }),
    } as Paginated<UserResDto>;
  }

  async create(dto: CreateUserReqDto): Promise<UserResDto> {
    const { email, password } = dto;

    // check uniqueness of username/email
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (user) {
      throw new ValidationException(ErrorCode.E001);
    }

    if (dto.password !== dto.confirmPassword) {
      throw new ValidationException(ErrorCode.E003);
    }

    const newUser = new UserEntity({
      ...dto,
      email,
      password,
      createdBy: this.cls.get('userId') || SYSTEM_USER_ID,
      updatedBy: this.cls.get('userId') || SYSTEM_USER_ID,
    });

    const savedUser = await this.userRepository.save(newUser);

    return plainToInstance(UserResDto, savedUser);
  }

  async findOne(id: ID): Promise<UserResDto> {
    assert(id, 'id is required');
    const user = await this.userRepository.findOneByOrFail({ id });

    return user.toDto(UserResDto);
  }

  async update(id: ID, updateUserDto: UpdateUserReqDto) {
    const user = await this.userRepository.findOneByOrFail({ id });

    user.firstname = updateUserDto.firstname;
    user.lastname = updateUserDto.lastname;
    user.updatedBy = SYSTEM_USER_ID;

    await this.userRepository.save(user);
  }

  async remove(id: ID) {
    const user = await this.userRepository.findOneByOrFail({ id });
    await this.userRepository.softRemove(user);
  }
}
