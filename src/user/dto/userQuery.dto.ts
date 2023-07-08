import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class userQueryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
